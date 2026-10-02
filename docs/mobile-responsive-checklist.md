# Mobile responsive QA checklist

Test in Chrome DevTools device toolbar: **375px (iPhone SE)**, **600px (sm)**, **900px (md)**, **1440px (desktop)**.

## Global shell

- [ ] Sidebar opens via burger; main content not clipped horizontally
- [ ] Header search / notifications usable on narrow width
- [ ] Page padding tighter on xs (`MainLayout` `p: 1.5`)

## Per-page smoke (sample)

- [ ] Dashboard: stat cards stack; charts fit width
- [ ] Audiobook: filters stack; table scrolls horizontally; modals full-screen on xs
- [ ] Rewards / Subscription / Rent: date filters stack; tables scroll
- [ ] Book requests / Contributors: card grid; search stacks
- [ ] User report: tree diagram scrolls or stacks on xs

## Patterns applied

- Page shell (`MainLayout`, `PageTransition`): `overflow-x: hidden` — no whole-screen horizontal scroll
- `MuiTableContainer` / table wrappers: `max-width: 100%` + horizontal scroll **inside** the table only
- `PageHeader` / `MainCard`: responsive padding and action stacking
- `useIsMobileSm()` + `fullScreen` on major `Dialog`s
- Filter bars: `Stack direction={{ xs: 'column', sm: 'row' }}`
