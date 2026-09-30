import DB from '../../../server/config/db.js';

class QuickAccessModel {
	tableName = 'quick_access';

	rowToDto = row => {
		if (!row) return null;
		return {
			id: row.id,
			enName: row.en_name,
			bnName: row.bn_name,
			gotoPage: row.goto_page,
			audience: row.audience,
			isActive: row.is_active === 1,
			sortOrder: row.sort_order,
			createdBy: row.created_by,
			updatedBy: row.updated_by,
			createdAt: row.created_at,
			updatedAt: row.updated_at,
		};
	};

	getById = async id => {
		const sql = `SELECT * FROM ${this.tableName} WHERE id = ?`;
		const rows = await DB.query(sql, [id]);
		return rows[0] ? this.rowToDto(rows[0]) : null;
	};

	list = async ({ audience, isActive, search, limit, offset }) => {
		const conditions = ['1=1'];
		const values = [];

		if (audience) {
			conditions.push('audience = ?');
			values.push(audience);
		}
		if (isActive !== undefined) {
			conditions.push('is_active = ?');
			values.push(isActive);
		}
		if (search) {
			conditions.push('(LOWER(en_name) LIKE CONCAT(\'%\', LOWER(?), \'%\') OR LOWER(bn_name) LIKE CONCAT(\'%\', LOWER(?), \'%\'))');
			values.push(search, search);
		}

		const where = conditions.join(' AND ');
		const countSql = `SELECT COUNT(*) AS total FROM ${this.tableName} WHERE ${where}`;
		const countRows = await DB.query(countSql, values);
		const total = countRows[0]?.total ?? 0;

		const listSql = `SELECT * FROM ${this.tableName} WHERE ${where} ORDER BY sort_order ASC, id ASC LIMIT ? OFFSET ?`;
		const listValues = [...values, limit, offset];
		const rows = await DB.query(listSql, listValues);

		return {
			data: rows.map(r => this.rowToDto(r)),
			total,
		};
	};

	create = async ({ enName, bnName, gotoPage, audience, isActive, sortOrder, createdBy }) => {
		const sql = `INSERT INTO ${this.tableName}
			(en_name, bn_name, goto_page, audience, is_active, sort_order, created_by)
			VALUES (?, ?, ?, ?, ?, ?, ?)`;
		const result = await DB.query(sql, [
			enName,
			bnName,
			gotoPage,
			audience,
			isActive ? 1 : 0,
			sortOrder ?? 0,
			createdBy ?? null,
		]);
		return this.getById(result.insertId);
	};

	update = async (id, fields, updatedBy) => {
		const allowed = {
			enName: 'en_name',
			bnName: 'bn_name',
			gotoPage: 'goto_page',
			audience: 'audience',
			isActive: 'is_active',
			sortOrder: 'sort_order',
		};
		const updates = [];
		const values = [];

		Object.entries(allowed).forEach(([key, col]) => {
			if (fields[key] !== undefined) {
				updates.push(`${col} = ?`);
				if (key === 'isActive') values.push(fields[key] ? 1 : 0);
				else values.push(fields[key]);
			}
		});

		if (updates.length === 0) {
			return this.getById(id);
		}

		updates.push('updated_by = ?');
		values.push(updatedBy ?? null);
		values.push(id);

		const sql = `UPDATE ${this.tableName} SET ${updates.join(', ')} WHERE id = ?`;
		await DB.query(sql, values);
		return this.getById(id);
	};

	toggle = async (id, updatedBy) => {
		const existing = await this.getById(id);
		if (!existing) return null;
		const next = existing.isActive ? 0 : 1;
		const sql = `UPDATE ${this.tableName} SET is_active = ?, updated_by = ? WHERE id = ?`;
		await DB.query(sql, [next, updatedBy ?? null, id]);
		return this.getById(id);
	};

	setActive = async (id, isActive, updatedBy) => {
		const sql = `UPDATE ${this.tableName} SET is_active = ?, updated_by = ? WHERE id = ?`;
		await DB.query(sql, [isActive ? 1 : 0, updatedBy ?? null, id]);
		return this.getById(id);
	};

	delete = async id => {
		const sql = `DELETE FROM ${this.tableName} WHERE id = ?`;
		const result = await DB.query(sql, [id]);
		return result.affectedRows > 0;
	};

	reorder = async (items, updatedBy) => {
		if (!items?.length) return;
		const ids = items.map(i => i.id);
		const caseParts = [];
		const values = [];
		items.forEach(({ id, sortOrder }) => {
			caseParts.push('WHEN ? THEN ?');
			values.push(id, sortOrder);
		});
		const placeholders = ids.map(() => '?').join(', ');
		const sql = `UPDATE ${this.tableName}
			SET sort_order = CASE id ${caseParts.join(' ')} END,
			    updated_by = ?
			WHERE id IN (${placeholders})`;
		await DB.query(sql, [...values, updatedBy ?? null, ...ids]);
	};
}

export default new QuickAccessModel();
