import fs from 'fs';
import path from 'path';

const root = path.join(process.cwd(), 'src');

function walk(dir, out = []) {
	for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
		const p = path.join(dir, ent.name);
		if (ent.isDirectory()) walk(p, out);
		else if (ent.name.endsWith('.tsx')) out.push(p);
	}
	return out;
}

for (const full of walk(root)) {
	let s = fs.readFileSync(full, 'utf8');
	if (!s.includes('<DialogContent>')) continue;
	const before = s;
	// Insert </DialogContent> before </Dialog> when DialogContent is still open
	s = s.replace(/<DialogContent>([\s\S]*?)<\/Dialog>/g, (m, inner) => {
		if (inner.includes('</DialogContent>')) return m;
		return `<DialogContent>${inner}</DialogContent>\n</Dialog>`;
	});
	if (s !== before) fs.writeFileSync(full, s, 'utf8');
}
console.log('dialog close fix done');
