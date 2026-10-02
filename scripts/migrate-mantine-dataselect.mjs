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
	if (!/<Select[\s\S]{0,500}?data=/.test(s)) continue;
	const before = s;
	s = s.replace(/<Select\b/g, '<DataSelect');
	if (!s.includes("from '@/components/Form/DataSelect'")) {
		const imp = "import { DataSelect } from '@/components/Form/DataSelect';\n";
		const idx = s.search(/^import\s/m);
		s = idx >= 0 ? s.slice(0, idx) + imp + s.slice(idx) : imp + s;
	}
	if (s !== before) fs.writeFileSync(full, s, 'utf8');
}
console.log('dataselect pass done');
