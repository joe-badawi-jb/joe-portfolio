# CLAUDE.md

## Styling Rules

- All CSS must be handled using Tailwind CSS utility classes.
- Inline CSS is **not** accepted. Do not use the `style` attribute (e.g. `style={{ ... }}` in JSX or `style="..."` in HTML).
- Do not write separate `.css`/`.scss` stylesheets or use `<style>` blocks for component styling. Use Tailwind utilities instead.
- For conditional or dynamic styles, compose Tailwind classes (optionally with a helper like `clsx`/`cn`) rather than inline styles.
- For shared/repeated patterns, prefer Tailwind's `@apply` in a global stylesheet or extract a reusable component over duplicating long class lists.
- Extend the design system via `tailwind.config` (theme, colors, spacing) rather than hardcoding arbitrary values where avoidable.