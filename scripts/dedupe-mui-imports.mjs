/**
 * Merge duplicate @mui/material import lines in src.
 */
import fs from 'fs';
import path from 'path';

const root = path.join(process.cwd(), 'src');

function walk(dir, out = []) {
	for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
		const p = path.join(dir, ent.name);
		if (ent.isDirectory()) walk(p, out);
		else if (/\.tsx?$/.test(ent.name)) out.push(p);
	}
	return out;
}

function dedupeMuiImports(content) {
	const re = /import\s+\{([^}]+)\}\s+from\s+['"]@mui\/material['"];?\s*\n/g;
	const names = new Set();
	let match;
	while ((match = re.exec(content)) !== null) {
		match[1].split(',').forEach(n => {
			const t = n.trim().split(/\s+as\s+/)[0].trim();
			if (t) names.add(t);
		});
	}
	if (names.size === 0) return content;
	let s = content.replace(re, '');
	const sorted = [...names].sort();
	const imp = `import {\n\t${sorted.join(',\n\t')},\n} from '@mui/material';\n`;
	const idx = s.search(/^import\s/m);
	if (idx >= 0) return s.slice(0, idx) + imp + s.slice(idx);
	return imp + s;
}

let n = 0;
for (const file of walk(root)) {
	const before = fs.readFileSync(file, 'utf8');
	if (!before.includes("@mui/material")) continue;
	const after = dedupeMuiImports(before);
	if (after !== before) {
		fs.writeFileSync(file, after, 'utf8');
		n++;
	}
}
console.log('Deduped:', n);
