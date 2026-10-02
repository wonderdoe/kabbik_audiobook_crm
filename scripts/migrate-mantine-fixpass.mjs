/**
 * Second pass: fix common issues after mantine batch migration.
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

function ensureImport(s, name) {
	if (s.includes(name) && !new RegExp(`import\\s*\\{[^}]*\\b${name}\\b`).test(s)) {
		const muiMatch = s.match(/import\s+\{([^}]+)\}\s+from\s+'@mui\/material';/);
		if (muiMatch) {
			const names = muiMatch[1]
				.split(',')
				.map(x => x.trim())
				.filter(Boolean);
			if (!names.includes(name)) {
				names.push(name);
				names.sort();
				const replacement = `import {\n\t${names.join(',\n\t')},\n} from '@mui/material';`;
				s = s.replace(muiMatch[0], replacement);
			}
		} else if (s.includes('@mui/material')) {
			// multi import blocks — skip
		} else {
			const firstImport = s.search(/^import\s/m);
			const imp = `import { ${name} } from '@mui/material';\n`;
			s = firstImport >= 0 ? s.slice(0, firstImport) + imp + s.slice(firstImport) : imp + s;
		}
	}
	return s;
}

function fixFile(full) {
	let s = fs.readFileSync(full, 'utf8');
	const before = s;

	// 'use client' must be first
	if (s.includes("'use client'") || s.includes('"use client"')) {
		const directive = s.match(/(['"])use client\1;?\s*\n/)?.[0];
		if (directive && !s.startsWith(directive.trim() + '\n') && s.indexOf(directive) > 0) {
			s = s.replace(directive, '');
			s = directive.trim() + '\n' + s;
		}
	}

	s = s.replace(/<Text\b/g, '<Typography');
	s = s.replace(/<\/Text>/g, '</Typography>');

	// Mantine typography props on Typography
	s = s.replace(/\bfw=\{(\d+)\}/g, 'fontWeight={$1}');
	s = s.replace(/\bfw="(\d+)"/g, 'fontWeight="$1"');
	s = s.replace(/\bfz="([^"]+)"/g, 'fontSize="$1"');
	s = s.replace(/\bfz=\{([^}]+)\}/g, 'fontSize={$1}');
	s = s.replace(/\btt="([^"]+)"/g, 'textTransform="$1"');
	s = s.replace(/\bta="([^"]+)"/g, 'textAlign="$1"');
	s = s.replace(/\bta=\{'([^']+)'\}/g, "textAlign={'$1'}");
	s = s.replace(/\blineClamp=\{(\d+)\}/g, 'sx={{ display: "-webkit-box", WebkitLineClamp: $1, WebkitBoxOrient: "vertical", overflow: "hidden" }}');
	s = s.replace(/\bmaw=\{(\d+)\}/g, 'sx={{ maxWidth: $1 }}');
	s = s.replace(/\bff="([^"]+)"/g, 'fontFamily="monospace"');
	s = s.replace(/\bc=\{([^}]+)\}/g, 'color={$1}');
	s = s.replace(/color="dimmed"/g, 'color="text.secondary"');
	s = s.replace(/color="teal"/g, 'color="primary"');

	// Button icons
	s = s.replace(/\bleftSection=\{/g, 'startIcon={');
	s = s.replace(/\brightSection=\{/g, 'endIcon={');

	// Dialog
	s = s.replace(/\s+centered\b/g, '');
	s = s.replace(/\s+classNames=\{[^}]+\{[^}]*\}[^}]*\}/g, '');
	s = s.replace(/\bsize=\{'lg'\}/g, 'maxWidth="lg" fullWidth');
	s = s.replace(/\bsize="lg"/g, 'maxWidth="lg" fullWidth');
	s = s.replace(/\bsize=\{'md'\}/g, 'maxWidth="md" fullWidth');
	s = s.replace(/\bsize="md"/g, 'maxWidth="md" fullWidth');
	s = s.replace(/\bsize=\{'xl'\}/g, 'maxWidth="xl" fullWidth');
	s = s.replace(/\bsize="xl"/g, 'maxWidth="xl" fullWidth');
	s = s.replace(/\bsize=\{'sm'\}/g, 'maxWidth="sm" fullWidth');
	s = s.replace(/\bsize="sm"/g, 'maxWidth="sm" fullWidth');

	// Pagination
	s = s.replace(/\s+siblings=\{\d+\}/g, '');

	// Divider
	s = s.replace(/<Divider\s+my="sm"\s*\/>/g, '<Divider sx={{ my: 1 }} />');
	s = s.replace(/<Divider\s+my=\{([^}]+)\}/g, '<Divider sx={{ my: $1 }}');

	// Avatar responsive — drop mantine visibility props
	s = s.replace(/\s+visibleFrom="[^"]+"/g, '');
	s = s.replace(/\s+hiddenFrom="[^"]+"/g, '');

	// Duplicate sx on Paper — merge naive
	s = s.replace(/sx=\{\{ borderRadius: 2 \}\}\s+sx=\{\{ p: 2 \}\}/g, 'sx={{ borderRadius: 2, p: 2 }}');

	// TableContainer minWidth
	s = s.replace(/<TableContainer\s+minWidth=\{(\d+)\}/g, '<TableContainer sx={{ minWidth: $1 }}');

	// Loader component preference
	s = s.replace(/<CircularProgress\s*\/>/g, '<Loader />');
	s = s.replace(/<CircularProgress>/g, '<Loader>');

	if (s.includes('<Loader') && !s.includes("from '@/components/Loader'") && !s.includes('from "../Loader"')) {
		const firstImport = s.search(/^import\s/m);
		const imp = "import Loader from '@/components/Loader';\n";
		s = firstImport >= 0 ? s.slice(0, firstImport) + imp + s.slice(firstImport) : imp + s;
	}

	// DatePickerInput stub -> MUI DatePicker
	s = s.replace(
		/<DatePickerInput\s+label="([^"]+)"\s+value=\{([^}]+)\}\s+onChange=\{([^}]+)\}\s*\/>/g,
		'<DatePicker label="$1" value={$2 ? dayjs($2) : null} onChange={(d) => $3(d?.toDate() ?? null)} slotProps={{ textField: { size: "small", fullWidth: true } }} />',
	);

	if (s.includes('<DatePicker ') && !s.includes('@mui/x-date-pickers')) {
		const firstImport = s.search(/^import\s/m);
		s =
			s.slice(0, firstImport) +
			"import { DatePicker } from '@mui/x-date-pickers/DatePicker';\nimport dayjs from 'dayjs';\n" +
			s.slice(firstImport);
	}

	if (s !== before) fs.writeFileSync(full, s, 'utf8');
}

for (const f of walk(root)) fixFile(f);
console.log('fixpass done');
