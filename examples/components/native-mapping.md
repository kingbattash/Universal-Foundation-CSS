# Platform adaptation example (guidance, not executable React Native UI)

This mapping describes *equivalent tasks*, not pixel-identical widgets. Runtime interaction, accessibility and device behavior still require testing.

| Task | Web implementation | Native/Expo implementation |
| --- | --- | --- |
| Submit a form | `<form>`, `<button type="submit">`, associated `<label>` | `TextInput`, `Pressable`, `accessibilityRole="button"`, keyboard avoiding behavior |
| Show an invalid input | `aria-invalid="true"` plus connected `aria-describedby` text | Visible descriptive error, accessibility hint/announcement where supported |
| Pick an option | Native `<select>` where feasible | Native picker or labelled accessible sheet |
| Show loading, result and error | `role="status"` or contextual `role="alert"` | Visible state and platform-appropriate live-region/announcement mechanism |
| Switch panels | `tablist`/`tab`/`tabpanel`, manual or auto activation | Segmented selector or native tabs, with accessible selected state |
| Present modal choice | `<dialog>.showModal()` with focus return | Native `Modal` or navigator modal with focus/announcement management |
| Present records | Native `<table>` with headers and scrollable wrapper | Accessible list/rows with announced column context and stable keys |
| Show routes | Links in named `<nav>` landmarks | Platform navigation and selected-route accessibility state |

Native UI must account for safe areas, platform focus rules, screen readers, on-screen keyboards and dynamic font scaling. The TS contract catalog is not a React Native component library, and exporting a TypeScript constant does not make any of the controls functional.
