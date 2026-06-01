# Ad Astra — Gallery / View redesign handoff

This folder is a full drop-in replacement for the Hugo site. It implements the
new editorial **Gallery** (homepage) and split-plate **Capture view** designs
from the prototype, while keeping the existing content / front-matter contract
mostly compatible.

The intended workflow is:

1. Diff this folder against the current repo.
2. Apply layout/CSS/JS/config changes wholesale (they're a coherent set).
3. Backfill the new per-capture front-matter fields (small one-line additions
   per existing capture — see "Front-matter migration" below).
4. Drop in the JetBrains Mono font files (see "Outstanding asset work").
5. `hugo server`, verify.

---

## What changed

### Layouts

| File | Change |
|---|---|
| `layouts/baseof.html` | Header partial no longer auto-emitted. Theme-toggle button + `main.js` moved here. |
| `layouts/_partials/head.html` | Adds the inline pre-paint theme resolver (prevents dark/light flash). Adds favicon link. |
| `layouts/_partials/header.html` | Now a single reusable header: wordmark + nav (Gallery / About / Gear). Old capture-specific branch deleted — the capture page draws its own back-link header inside its layout. |
| `layouts/_partials/footer.html` | Emptied — theme toggle is in `baseof.html`. |
| `layouts/home.html` | **Rewritten as the editorial gallery.** Bio, computed site stats (objects / total hours / total subframes), 6-col responsive tile grid with featured-first rhythm. |
| `layouts/capture/single.html` | **Rewritten as the split-plate view.** Full-bleed image + slide-in spec rail with stats, coordinates, acquisition, equipment, field notes, and prev/next. |
| `layouts/section.html`, `page.html`, `taxonomy.html`, `term.html`, `404.html` | Restyled to share tokens — wrapped in `.aa-page`, header partial included. |

### Assets

| File | Change |
|---|---|
| `assets/css/main.css` | Rewritten. Design tokens (`--bg / --fg / --sub …`) for **both** themes are now driven by `html[data-theme]`, not `@media (prefers-color-scheme)`. All component classes are namespaced `aa-*`. |
| `assets/css/main_medium.css` | Now mobile-first overrides: stacks gallery to one column, collapses the view page's split-plate to image-then-spec scroll. |
| `assets/js/main.js` | Adds (a) persisted theme toggle, (b) slide-in rail open/close on the view page. Tiny, no deps. |

### Config

| File | Change |
|---|---|
| `hugo.toml` | New `[params]` keys: `bio` (gallery hero copy), `defaultBortleScale`, and `[params.gear]` (camera / mount / optics) used as fallbacks when a capture omits them. |
| `archetypes/captures/index.md` | Adds new front-matter fields (see below) and slightly reorganises existing ones into logical groups. |

---

## Front-matter migration

The new design uses a few fields that don't exist in older captures. Each is
**optional with a sensible fallback**, so the site won't crash if you don't
backfill — but the affordance is better when they're filled in.

```toml
capture_object_subtitle = ''   # e.g. 'Sadr Region', 'M31'. Falls back to objects[0].
capture_object_type     = ''   # e.g. 'Emission Nebula'. Falls back to tags[0].
capture_designation     = ''   # e.g. 'IC 1318'. Defaults to '—'.
capture_dec_dms         = ''   # e.g. '+40° 15′ 18″'. Defaults to '—'.
capture_integration     = ''   # e.g. '52.5m', '1h 48m'. Defaults to '—'.
```

A capture with `capture_integration = '—'` is treated as a **single-frame**
shot (lunar etc.) — the stat strip switches to "01 / 1 / {exposure}" and the
gallery teaser line shows date + exposure instead of integration / frames.

**Optional helper field** for the homepage's "Integrated" total:

```toml
capture_integration_minutes = 52.5   # explicit number
```

If omitted, `home.html` will try to compute it as `frames × exposure_seconds`
when `capture_exposure` is in `"30s"` form, and skip it otherwise.

### Quick migration script idea

For each existing `content/captures/*/index.md`, add the five new fields under
the existing block. The values for the seven captures shown in the prototype
are listed at the bottom of this file as a reference.

---

## Outstanding asset work

1. **JetBrains Mono TTFs**. `layouts/_partials/head/fonts.html` (unchanged
   from before the redesign) already expects:

   ```
   assets/font/jetbrains-mono/ttf/JetBrainsMono-Regular.ttf
   assets/font/jetbrains-mono/ttf/JetBrainsMono-ExtraLight.ttf
   ```

   These files are not in the repo. Download them from
   <https://github.com/JetBrains/JetBrainsMono/releases> and drop them in.
   Browsers fall back to system mono otherwise (`ui-monospace`), so the site
   still renders but looks subtly off.

2. **`capture_alt`**. Old captures may not have this set; the new gallery uses
   it for tile `aria-label`. Backfill where possible.

3. **Optional `content/about.md`, `content/gear.md`**. The header nav
   conditionally renders About/Gear links when those pages exist
   (`with .GetPage "/about"`). Create them if you want the nav populated.

---

## Theme model

- `html[data-theme="light|dark"]` drives every token.
- On first paint, an inline `<script>` in `head.html` reads
  `localStorage.aa_theme` (or `prefers-color-scheme` if empty) and sets the
  attribute *before* CSS is applied — no flash.
- The button in the bottom-right writes the user's choice to
  `localStorage.aa_theme`.
- Removing `prefers-color-scheme` from CSS was intentional: once the user has
  toggled, their preference wins, even across cold loads.

## View-page rail

`section.aa-view[data-rail-open="true|false"]` is the state container.
`main.js` flips the attribute; CSS handles the transform / opacity. Two
buttons drive it:

- `[data-rail-open-btn]` — the on-image "Acquisition Data" CTA.
- `[data-rail-close-btn]` — the "Hide →" button in the rail header.

Esc also closes the rail.

If JS is disabled, the rail stays closed and the image overlay remains usable
(name + ra/dec are visible) — graceful but the spec sheet is unreachable.
Acceptable for now; if that matters, server-render rail-open by default
when there's no JS by adding a `<noscript>` block flipping the attribute.

---

## Reference: capture values from the prototype

For backfilling the seven captures already shown in the prototype, here are
the values the prototype hard-codes — handy if you want the live site to look
visually identical on first build.

| key | object_subtitle | object_type | designation | ra_hms | dec_dms | integration | frames | exposure | iso | f_number |
|---|---|---|---|---|---|---|---|---|---|---|
| cygnus    | Sadr Region | Emission Nebula  | IC 1318 | 20h 37m 51.3s | +40° 15′ 18″ | 52.5m | 105 | 30s | 400 | 3.5 |
| andromeda | M31         | Spiral Galaxy    | NGC 224 | 00h 42m 51.3s | +41° 16′ 18″ | 1h 48m| 216 | 30s | 800 | 3.5 |
| heart     | IC 1805     | Emission Nebula  | IC 1805 | 02h 32m 51.3s | +61° 27′ 18″ | 2h 05m| 250 | 30s | 400 | 3.5 |
| pleiades  | M45         | Open Cluster     | Mel 22  | 03h 47m 51.3s | +24° 07′ 18″ | 1h 12m| 144 | 30s | 400 | 3.5 |
| veil      | NGC 6960    | Supernova Remnant| NGC 6960| 20h 45m 51.3s | +30° 43′ 18″ | 1h 30m| 180 | 30s | 400 | 3.5 |
| orion     | M42         | Emission Nebula  | NGC 1976| 05h 35m 51.3s | −05° 23′ 18″ | 38m   |  76 | 30s | 400 | 3.5 |
| moon      | Luna        | Lunar            | —       | —             | —            | —     |   1 | 1/200s | 100 | 10 |
