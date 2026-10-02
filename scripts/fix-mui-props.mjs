/**
 * Fix Mantine-style props left on MUI components after migration.
 * Usage: node scripts/fix-mui-props.mjs
 */
import fs from 'fs';
import path from 'path';

const root = path.join(process.cwd(), 'src');

function walk(dir, out = []) {
	for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
		const p = path.join(dir, ent.name);
		if (ent.isDirectory()) walk(p, out);
		else if (/\.(tsx|ts)$/.test(ent.name)) out.push(p);
	}
	return out;
}

function fix(content) {
	let s = content;

	s = s.replace(/variant="filled"/g, 'variant="contained"');
	s = s.replace(/variant="light"/g, 'variant="outlined"');
	s = s.replace(/variant="subtle"/g, 'variant="text"');
	s = s.replace(/variant="default"/g, 'variant="outlined"');

	s = s.replace(/(<Stack[^>]*)\bjustify="/g, '$1justifyContent="');
	s = s.replace(/(<Stack[^>]*)\balign="/g, '$1alignItems="');
	s = s.replace(/(<Box[^>]*display="flex"[^>]*)\bjustify="/g, '$1justifyContent="');
	s = s.replace(/(<Box[^>]*display="flex"[^>]*)\balign="/g, '$1alignItems="');

	s = s.replace(/\bfw=\{(\d+)\}/g, 'fontWeight={$1}');
	s = s.replace(/\bfw="([^"]+)"/g, 'fontWeight="$1"');
	s = s.replace(/\bfz="([^"]+)"/g, '');
	s = s.replace(/\bc="dimmed"/g, 'color="text.secondary"');
	s = s.replace(/\bc="gray"/g, 'color="text.secondary"');

	s = s.replace(/\s+classNames=\{\{[^}]+\}\}/gs, '');
	s = s.replace(/\s+classNames=\{[^}]+\}/g, '');

	s = s.replace(/\s+py=\{[^}]+\}/g, '');
	s = s.replace(/\s+py="[^"]+"/g, '');
	s = s.replace(/\s+px=\{[^}]+\}/g, '');
	s = s.replace(/\s+mt="[^"]+"/g, '');
	s = s.replace(/\s+mb="[^"]+"/g, '');
	s = s.replace(/\s+my="[^"]+"/g, '');
	s = s.replace(/\s+mx="[^"]+"/g, '');

	s = s.replace(/\s+autosize\b/g, '');
	s = s.replace(/\s+withAsterisk\b/g, ' required');
	s = s.replace(/\s+checkIconPosition="[^"]+"/g, '');

	s = s.replace(/\bradius="xl"/g, '');
	s = s.replace(/\bradius="md"/g, '');
	s = s.replace(/\bsize="([^"]+)"/g, (m, sz, offset, str) => {
		const before = str.slice(Math.max(0, offset - 30), offset);
		if (before.includes('<Avatar') || before.includes('ThemeIcon')) {
			if (sz === 'sm') return 'sx={{ width: 32, height: 32 }}';
			if (sz === 'md') return 'sx={{ width: 40, height: 40 }}';
			if (sz === 'lg') return 'sx={{ width: 48, height: 48 }}';
			if (sz === 'xl') return 'sx={{ width: 56, height: 56 }}';
		}
		return m;
	});

	s = s.replace(/shadow="xs"/g, 'elevation={1}');
	s = s.replace(/shadow="sm"/g, 'elevation={2}');
	s = s.replace(/shadow="md"/g, 'elevation={3}');
	s = s.replace(/\bshadow=\{0\}/g, 'elevation={0}');
	s = s.replace(/\bshadow="0"/g, 'elevation={0}');
	s = s.replace(/\bp="xl"/g, 'sx={{ p: 3 }}');
	s = s.replace(/\bp="xs"/g, 'sx={{ p: 1 }}');

	s = s.replace(/<TextField type="password"([^>]*)\stype="password"/g, '<TextField type="password"$1');
	s = s.replace(/<TextField([^>]*)\srequired([^>]*)\srequired/g, '<TextField$1 required$2');

	s = s.replace(/<Pagination\s+value=/g, '<Pagination page=');
	s = s.replace(/\btotal=\{/g, 'count={');

	s = s.replace(/<Select([^>]*)\bdata=\{/g, '<DataSelect$1data={');
	if (s.includes('<DataSelect') && !s.includes("from '@/components/Form/DataSelect'")) {
		if (!s.includes('DataSelect')) {
			// no-op
		} else if (!s.includes("DataSelect'")) {
			const idx = s.search(/^import\s/m);
			if (idx >= 0) {
				s =
					s.slice(0, idx) +
					"import { DataSelect } from '@/components/Form/DataSelect';\n" +
					s.slice(idx);
			}
		}
	}

	s = s.replace(/mantineFilterSelectProps/g, 'muiFilterSelectProps');
	s = s.replace(/mantineFilterTextFieldProps/g, 'muiFilterTextFieldProps');
	s = s.replace(/mantinePaperProps/g, 'muiTablePaperProps');
	s = s.replace(/variant="outline"/g, 'variant="outlined"');
	s = s.replace(/<UnstyledButton/g, '<Button variant="text"');
	s = s.replace(/<\/UnstyledButton>/g, '</Button>');
	s = s.replace(/<FormControl\s+label="([^"]+)"/g, '<FormControl><InputLabel>$1</InputLabel');
	s = s.replace(/mantineTableProps/g, 'muiTableProps');

	return s;
}

let n = 0;
for (const file of walk(root)) {
	const before = fs.readFileSync(file, 'utf8');
	const after = fix(before);
	if (after !== before) {
		fs.writeFileSync(file, after, 'utf8');
		n++;
	}
}
console.log('Fixed files:', n);
