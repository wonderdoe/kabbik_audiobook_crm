/**
 * List or migrate files still importing @mantine (excluding allowlist).
 * Usage: node scripts/migrate-mantine-batch.mjs [--apply]
 */
import fs from 'fs';
import path from 'path';

const root = path.join(process.cwd(), 'src');
const apply = process.argv.includes('--apply');
const skip = new Set([
	'app/layout.tsx',
	'styles/theme.ts',
	'components/providers/UiProviders.tsx',
]);

const MANTINE_CORE_MAP = {
	ActionIcon: 'IconButton',
	Anchor: 'Link',
	Avatar: 'Avatar',
	Badge: 'Badge',
	Box: 'Box',
	Burger: 'IconButton',
	Button: 'Button',
	Card: 'Card',
	Center: 'Box',
	Container: 'Container',
	Divider: 'Divider',
	Drawer: 'Drawer',
	Flex: 'Stack',
	Grid: 'Grid',
	Group: 'Stack',
	Image: 'Box',
	List: 'List',
	Loader: 'CircularProgress',
	Menu: 'Menu',
	Modal: 'Dialog',
	Pagination: 'Pagination',
	Paper: 'Paper',
	PasswordInput: 'TextField',
	Radio: 'Radio',
	Rating: 'Rating',
	ScrollArea: 'Box',
	Select: 'Select',
	SimpleGrid: 'Grid',
	Space: 'Box',
	Stack: 'Stack',
	Switch: 'Switch',
	Table: 'Table',
	Tabs: 'Tabs',
	Text: 'Typography',
	TextInput: 'TextField',
	Textarea: 'TextField',
	ThemeIcon: 'Avatar',
	Title: 'Typography',
	rem: null,
	useMantineColorScheme: null,
	useMantineTheme: null,
	useDirection: null,
	Direction: null,
	MantineColorScheme: null,
	MantineProvider: null,
	InputWrapper: 'FormControl',
};

const EXTRA_MUI = new Set([
	'DialogTitle',
	'DialogContent',
	'DialogActions',
	'TableBody',
	'TableCell',
	'TableContainer',
	'TableHead',
	'TableRow',
	'MenuItem',
	'FormControl',
	'InputLabel',
	'ListItem',
	'ListItemIcon',
	'ListItemText',
	'Tab',
	'IconButton',
	'CircularProgress',
	'Typography',
	'Link',
]);

function collectFiles() {
	const files = [];
	function walk(dir) {
		for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
			const p = path.join(dir, ent.name);
			if (ent.isDirectory()) walk(p);
			else if (/\.(tsx|ts|jsx|js)$/.test(ent.name)) {
				const rel = path.relative(root, p).replace(/\\/g, '/');
				if (ent.name.endsWith('.stories.tsx')) continue;
				if (skip.has(rel)) continue;
				const text = fs.readFileSync(p, 'utf8');
				if (text.includes('@mantine/')) files.push(rel);
			}
		}
	}
	walk(root);
	return files.sort();
}

function transformSource(text, rel) {
	let s = text;

	// SnackbarProvider: comment-only mantine reference
	if (rel === 'components/providers/SnackbarProvider.tsx') {
		return s.replace(
			/\/\*\* Drop-in for @mantine\/notifications notifications\.show \*\//,
			'/** Drop-in for legacy notifications.show API */',
		);
	}

	s = s.replace(/import\s+['"]@mantine\/dates\/styles\.css['"];?\s*\n/g, '');
	s = s.replace(/import\s+['"]@mantine\/charts\/styles\.css['"];?\s*\n/g, '');
	s = s.replace(
		/import\s+\{\s*AreaChart\s*\}\s+from\s+['"]@mantine\/charts['"];?\s*\n/g,
		"import { MuiAreaChart } from '@/components/Charts/MuiAreaChart';\n",
	);
	s = s.replace(/<AreaChart\b/g, '<MuiAreaChart');
	s = s.replace(/<\/AreaChart>/g, '</MuiAreaChart>');

	s = s.replace(
		/import\s+\{\s*useDisclosure\s*\}\s+from\s+['"]@mantine\/hooks['"];?\s*\n/g,
		"import { useDisclosure } from '@/hooks/use-disclosure';\n",
	);
	s = s.replace(
		/import\s+\{\s*notifications\s*\}\s+from\s+['"]@mantine\/notifications['"];?\s*\n/g,
		"import { notifications } from '@/components/providers/SnackbarProvider';\n",
	);
	s = s.replace(
		/import\s+type\s+\{\s*DateValue\s*\}\s+from\s+['"]@mantine\/dates['"];?\s*\n/g,
		'type DateValue = Date | null;\n',
	);
	s = s.replace(
		/import\s+\{\s*DateValue\s*\}\s+from\s+['"]@mantine\/dates['"];?\s*\n/g,
		'type DateValue = Date | null;\n',
	);

	// Dropzone
	s = s.replace(
		/import\s+\{[^}]*Dropzone[^}]*\}\s+from\s+['"]@mantine\/dropzone['"];?\s*\n/g,
		"import { useCallback, useState } from 'react';\n",
	);

	// DatePickerInput from dates — use MUI DatePicker inline later; strip import for manual follow-up
	s = s.replace(
		/import\s+\{[^}]*DatePickerInput[^}]*\}\s+from\s+['"]@mantine\/dates['"];?\s*\n/g,
		'',
	);
	s = s.replace(
		/import\s+\{\s*DateTimePicker\s*\}\s+from\s+['"]@mantine\/dates['"];?\s*\n/g,
		"import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';\n",
	);
	s = s.replace(
		/import\s+\{\s*MantineProvider\s*\}\s+from\s+['"]@mantine\/core['"];?\s*\n/g,
		'',
	);
	s = s.replace(/<MantineProvider>\s*/g, '');
	s = s.replace(/<\/MantineProvider>\s*/g, '');

	// Loader alias lines
	s = s.replace(
		/import\s+\{\s*Loader\s+as\s+MantineLoader\s*\}\s+from\s+['"]@mantine\/core['"];?\s*\n/g,
		"import { CircularProgress } from '@mui/material';\n",
	);
	s = s.replace(/\bMantineLoader\b/g, 'CircularProgress');

	// Parse @mantine/core import blocks
	const coreImportRe = /import\s+\{([^}]+)\}\s+from\s+['"]@mantine\/core['"];?\s*\n/g;
	const muiNames = new Set();
	let match;
	while ((match = coreImportRe.exec(s)) !== null) {
		const names = match[1]
			.split(',')
			.map(n => n.trim())
			.filter(Boolean);
		for (const raw of names) {
			const alias = raw.match(/^(\w+)\s+as\s+(\w+)$/);
			if (alias) {
				const mapped = MANTINE_CORE_MAP[alias[1]] ?? alias[1];
				if (mapped) muiNames.add(mapped);
				continue;
			}
			const base = raw.replace(/\s+as\s+\w+$/, '').trim();
			const mapped = MANTINE_CORE_MAP[base];
			if (mapped) muiNames.add(mapped);
		}
	}
	s = s.replace(coreImportRe, '');

	if (s.includes('<Modal') || s.includes('<Dialog')) {
		muiNames.add('Dialog');
		muiNames.add('DialogTitle');
		muiNames.add('DialogContent');
	}
	if (s.includes('Table.Tr') || s.includes('Table.Tbody')) {
		muiNames.add('Table');
		muiNames.add('TableBody');
		muiNames.add('TableCell');
		muiNames.add('TableContainer');
		muiNames.add('TableHead');
		muiNames.add('TableRow');
	}
	if (s.includes('<Select') && !s.includes('react-hook-form')) {
		muiNames.add('Select');
		muiNames.add('MenuItem');
		muiNames.add('FormControl');
		muiNames.add('InputLabel');
	}
	if (s.includes('PasswordInput') || s.includes('type="password"')) {
		muiNames.add('TextField');
	}
	if (s.includes('<Tabs.')) {
		muiNames.add('Tabs');
		muiNames.add('Tab');
	}
	if (s.includes('<List.')) {
		muiNames.add('ListItem');
		muiNames.add('ListItemIcon');
		muiNames.add('ListItemText');
	}
	if (s.includes('rem(')) {
		// use theme spacing — replace rem( with literal px helper inline later
	}
	for (const e of EXTRA_MUI) {
		if (s.includes(`<${e}`) || s.includes(`</${e}`)) muiNames.add(e);
	}

	if (muiNames.size > 0) {
		const sorted = [...muiNames].sort();
		const muiImport = `import {\n\t${sorted.join(',\n\t')},\n} from '@mui/material';\n`;
		const firstImport = s.search(/^import\s/m);
		if (firstImport >= 0) {
			s = s.slice(0, firstImport) + muiImport + s.slice(firstImport);
		} else {
			s = muiImport + s;
		}
	}

	// Table compound components
	s = s.replace(/<Table\.ScrollContainer/g, '<TableContainer');
	s = s.replace(/<\/Table\.ScrollContainer>/g, '</TableContainer>');
	s = s.replace(/<Table\.Thead/g, '<TableHead');
	s = s.replace(/<\/Table\.Thead>/g, '</TableHead>');
	s = s.replace(/<Table\.Tbody/g, '<TableBody');
	s = s.replace(/<\/Table\.Tbody>/g, '</TableBody>');
	s = s.replace(/<Table\.Tr/g, '<TableRow');
	s = s.replace(/<\/Table\.Tr>/g, '</TableRow>');
	s = s.replace(/<Table\.Td/g, '<TableCell');
	s = s.replace(/<\/Table\.Td>/g, '</TableCell>');
	s = s.replace(/<Table\.Th/g, '<TableCell component="th"');
	s = s.replace(/<\/Table\.Th>/g, '</TableCell>');

	// Modal -> Dialog
	s = s.replace(/<Modal\b/g, '<Dialog');
	s = s.replace(/<\/Modal>/g, '</Dialog>');
	s = s.replace(/\bopened=/g, 'open=');

	// Title order -> variant
	s = s.replace(/<Title\s+order=\{1\}/g, '<Typography variant="h4" component="h1"');
	s = s.replace(/<Title\s+order=\{2\}/g, '<Typography variant="h5" component="h2"');
	s = s.replace(/<Title\s+order=\{3\}/g, '<Typography variant="h6" component="h3"');
	s = s.replace(/<Title\s+order=\{4\}/g, '<Typography variant="subtitle1" component="h4"');
	s = s.replace(/<Title\s+order=\{5\}/g, '<Typography variant="subtitle2" component="h5"');
	s = s.replace(/<\/Title>/g, '</Typography>');

	// Text mantine props
	s = s.replace(/\bc="([^"]+)"/g, 'color="$1"');
	s = s.replace(/\bsize="xs"/g, 'variant="caption"');
	s = s.replace(/\bsize="sm"/g, 'variant="body2"');
	s = s.replace(/\bsize="md"/g, 'variant="body1"');
	s = s.replace(/\bsize="lg"/g, 'variant="h6"');

	// Paper
	s = s.replace(/\bwithBorder\b/g, 'variant="outlined"');
	s = s.replace(/\bradius="md"/g, 'sx={{ borderRadius: 2 }}');
	s = s.replace(/\bp="md"/g, 'sx={{ p: 2 }}');
	s = s.replace(/\bp="sm"/g, 'sx={{ p: 1 }}');
	s = s.replace(/\bp="lg"/g, 'sx={{ p: 3 }}');

	// Space
	s = s.replace(/<Space\s+h=\{([^}]+)\}/g, '<Box sx={{ height: $1 }}');
	s = s.replace(/<Space\s+w=\{([^}]+)\}/g, '<Box sx={{ width: $1 }}');
	s = s.replace(/<\/Space>/g, '</Box>');

	// ScrollArea
	s = s.replace(/<ScrollArea/g, '<Box sx={{ overflow: "auto" }}');
	s = s.replace(/<\/ScrollArea>/g, '</Box>');

	// Flex / Group gap
	s = s.replace(/<Flex\b/g, '<Stack direction="row" flexWrap="wrap"');
	s = s.replace(/<\/Flex>/g, '</Stack>');
	s = s.replace(/<Group\b/g, '<Stack direction="row" alignItems="center"');
	s = s.replace(/<\/Group>/g, '</Stack>');

	// Stack gap -> spacing
	s = s.replace(/<Stack\s+gap="([^"]+)"/g, '<Stack spacing={2}');
	s = s.replace(/gap=\{(\d+)\}/g, 'spacing={$1}');

	// Pagination mantine -> mui (page is 1-based in both; MUI uses count not total)
	s = s.replace(
		/<Pagination\s+value=\{([^}]+)\}\s+total=\{([^}]+)\}\s+onChange=\{([^}]+)\}([^/]*)\/>/g,
		'<Pagination page={$1} count={$2} onChange={(_, p) => $3(p)}$4/>',
	);

	// PasswordInput -> TextField
	s = s.replace(/<PasswordInput/g, '<TextField type="password"');
	s = s.replace(/<\/PasswordInput>/g, '</TextField>');

	// TextInput -> TextField
	s = s.replace(/<TextInput/g, '<TextField');
	s = s.replace(/<\/TextInput>/g, '</TextField>');

	// Textarea -> TextField multiline
	s = s.replace(/<Textarea/g, '<TextField multiline minRows={3}');
	s = s.replace(/<\/Textarea>/g, '</TextField>');

	// Image -> Box img
	s = s.replace(/<Image\s/g, '<Box component="img" ');

	// rem() -> template for px (mantine rem unit ~16px base)
	s = s.replace(/\brem\((\d+)\)/g, (_, n) => `${Number(n) * 16}px`);

	// Loader component
	s = s.replace(/<Loader\b/g, '<CircularProgress');
	s = s.replace(/<\/Loader>/g, '</CircularProgress>');

	// ActionIcon -> IconButton
	s = s.replace(/<ActionIcon/g, '<IconButton');
	s = s.replace(/<\/ActionIcon>/g, '</IconButton>');

	// Center
	s = s.replace(/<Center\b/g, '<Box display="flex" justifyContent="center" alignItems="center"');
	s = s.replace(/<\/Center>/g, '</Box>');

	// SimpleGrid
	s = s.replace(/<SimpleGrid/g, '<Grid container');
	s = s.replace(/<\/SimpleGrid>/g, '</Grid>');

	// Tabs mantine
	s = s.replace(/<Tabs\.List/g, '<Box');
	s = s.replace(/<\/Tabs\.List>/g, '</Box>');
	s = s.replace(/<Tabs\.Tab/g, '<Tab');
	s = s.replace(/<\/Tabs\.Tab>/g, '</Tab>');
	s = s.replace(/<Tabs\.Panel/g, '<Box');
	s = s.replace(/<\/Tabs\.Panel>/g, '</Box>');

	// List mantine
	s = s.replace(/<List\.Item/g, '<ListItem');
	s = s.replace(/<\/List\.Item>/g, '</ListItem>');
	s = s.replace(/<List\.ItemIcon/g, '<ListItemIcon');
	s = s.replace(/<\/List\.ItemIcon>/g, '</ListItemIcon>');

	// Badge
	s = s.replace(/<Badge\b/g, '<Badge');

	// InputWrapper
	s = s.replace(/<InputWrapper/g, '<FormControl');
	s = s.replace(/<\/InputWrapper>/g, '</FormControl>');

	// Dialog title prop (common pattern) — move to DialogTitle child
	s = s.replace(
		/<Dialog([^>]*)\btitle=\{?("([^"]+)"|'([^']+)'|\{([^}]+)\})\}?([^>]*)>/g,
		(m, a, _q, t2, t3, t4, b) => {
			const title = t2 || t3 || `{${t4}}`;
			return `<Dialog${a.replace(/\s*title=\{?[^}]+\}?/, '')}${b}>\n<DialogTitle>${title}</DialogTitle>\n<DialogContent>`;
		},
	);

	return s;
}

const files = collectFiles();

if (!apply) {
	console.log(files.join('\n'));
	console.log('\nTotal:', files.length);
	process.exit(0);
}

const notMigrated = [];
const changed = [];

for (const rel of files) {
	const full = path.join(root, rel);
	const before = fs.readFileSync(full, 'utf8');
	const after = transformSource(before, rel);
	if (after !== before) {
		fs.writeFileSync(full, after, 'utf8');
		changed.push(rel);
	}
	if (after.includes('@mantine/')) {
		notMigrated.push(rel);
	}
}

console.log('Changed:', changed.length);
changed.forEach(f => console.log('  ', f));
console.log('\nStill @mantine:', notMigrated.length);
notMigrated.forEach(f => console.log('  ', f));
