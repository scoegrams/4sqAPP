# Design system (colors & themes)

## Where colors live

| Piece | Purpose |
|--------|---------|
| `src/theme/presets.ts` | **Named schemes** — one full `DesignTokens` object per `ThemeMode` (`light`, `dark`, `modern`, `apple`). Edit here to ship a new palette. |
| `src/theme/designTokenTypes.ts` | Token **keys**, **CSS variable names** (`--fs-*`), **admin labels**, and **groups** for Theme Studio. |
| `src/theme/getTheme.ts` | Builds the `Theme` object passed to pages — almost entirely **Tailwind + `var(--fs-…)`** (no per-mode hex in components). |
| `src/theme/tokenApply.ts` | Writes tokens to `document.documentElement` as CSS variables. |
| `src/contexts/DesignTokensContext.tsx` | Merges **preset + overrides**, loads/saves **`site_theme`** in Supabase when configured. |
| `public.site_theme` (migration `003`) | Single row `global`: **active preset**, **studio on/off**, **token_overrides** JSON — public read, owners write. |

## On-the-fly tuning (owner)

1. Open **Jackpot** (`/#jackpot`) → **Theme Studio** (collapsed section).
2. Turn **Custom colors ON** — overrides apply on top of the current **App theme** preset.
3. Adjust any token; changes apply instantly. With Supabase + `003_site_theme.sql`, the app **loads that row for every visitor** and **owners auto-save** (~0.9s debounce). Without DB, overrides stay in `localStorage` only.
4. **Export JSON** to back up a scheme; **Import** to restore.
5. **Clear overrides** removes all customizations; **Clear override** on one row drops that key back to the preset.

**Custom colors OFF** — visitors see only the selected preset (no token overrides).

## Adding a new named theme (code)

1. Add mode to `ThemeMode` in `src/theme/types.ts`.
2. Add a full preset object to `PRESET_TOKENS` in `src/theme/presets.ts`.
3. Add flags in `FLAGS` inside `src/theme/getTheme.ts` (`isDark`, `chromeLightFg`).
4. Wire a button in `JackpotPage` / `App` `cycleTheme` if it should be choosable.

## Component rules

- **Prefer** `var(--fs-…)` (via Tailwind arbitrary classes or inline `style`) for chrome, footer, drawer, train sign, logo squares, quadrants.
- **Avoid** new hardcoded hex in shell components; add a token in `designTokenTypes.ts` + all presets instead.
- Inner pages (About, Booking, Connect 4 modals) may still use `theme.mode` for layout; migrate over time to tokens if needed.
