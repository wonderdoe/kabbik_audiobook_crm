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

function ensureBoxImport(s) {
	if (!s.includes('<Box ') && !s.includes('<Box\n')) return s;
	if (/import\s*\{[^}]*\bBox\b/.test(s)) return s;
	return s.replace(
		/(import\s*\{)([^}]+)(\}\s*from\s*'@mui\/material';)/,
		(m, a, b, c) => `${a}${b.trim().startsWith('\n') ? b : '\n\t' + b.trim()},\n\tBox${c}`,
	);
}

for (const full of walk(root)) {
	let s = fs.readFileSync(full, 'utf8');
	const before = s;
	s = s.replace(/<Space h="md"\s*\/>/g, '<Box sx={{ height: 16 }} />');
	s = s.replace(/<Space h="sm"\s*\/>/g, '<Box sx={{ height: 8 }} />');
	s = s.replace(/<Space h="xs"\s*\/>/g, '<Box sx={{ height: 4 }} />');
	s = s.replace(/<Space h="4"\s*\/>/g, '<Box sx={{ height: 4 }} />');
	s = s.replace(
		/<Grid\.Col([^>]*)span=\{\{\s*base:\s*12,\s*sm:\s*6,\s*md:\s*4\s*\}\}/g,
		'<Grid item xs={12} sm={6} md={4}$1',
	);
	s = s.replace(
		/<Grid\.Col([^>]*)span=\{\{\s*base:\s*12,\s*sm:\s*6,\s*md:\s*8\s*\}\}/g,
		'<Grid item xs={12} sm={6} md={8}$1',
	);
	s = s.replace(
		/<Grid\.Col([^>]*)span=\{\{\s*base:\s*12,\s*xs:\s*5\s*\}\}/g,
		'<Grid item xs={12} sm={5}$1',
	);
	s = s.replace(
		/<Grid\.Col([^>]*)span=\{\{\s*base:\s*12,\s*xs:\s*2\s*\}\}/g,
		'<Grid item xs={12} sm={2}$1',
	);
	s = s.replace(/<Grid\.Col key=\{([^}]+)\} span=\{\{\s*base:\s*6,\s*md:\s*4,\s*lg:\s*2\s*\}\}/g,
		'<Grid item key={$1} xs={6} md={4} lg={2}',
	);
	s = s.replace(/<\/Grid\.Col>/g, '</Grid>');
	if (s !== before) {
		s = ensureBoxImport(s);
		fs.writeFileSync(full, s, 'utf8');
	}
}
console.log('space-grid done');
