# COMMLINK — Cyberpunk Dialog Constructor

A single-page web app for composing cyberpunk-styled dialog screenshots (Cyberpunk 2077 / netrunner UI vibe). No backend, no build step. Open `index.html` in any modern browser.

Inspired by [Commlink-Thread](https://tonkatsura.github.io/Comlink-Thread/).

## Features

- **Messages** — speaker, body, portrait, left/right side, optional in-bubble image, optional time stamp. System messages (centered, no avatar) for events like `FILE TRANSFERRED`.
- **Contacts** — collapsible sidebar of named avatars. Click to drop a linked message; editable in place via the pencil button (swaps to a save icon while editing).
- **Contact links** — messages dropped from a contact are *chain-linked* by `contactId`. Editing the contact propagates name/avatar to every linked message in the preview and PNG export. Clone-of-a-clone keeps the chain even without a contact. Visible `// NO CONTACT` badge in red on rows that aren't linked.
- **Snapshots** — save/load named versions of the whole dialog. Per-language `EXAMPLE_*` snapshots are seeded for every supported locale. Toggle to hide examples once you've found your own rhythm.
- **State export / import** — JSON download / upload of the full state + contacts (images included as inlined data URLs). Confirmation prompt before import overwrites your current dialog.
- **8 languages** — EN, RU, ES, DE, CN, JP, IT, FR. Switcher in the header. Includes UI labels, toast messages, the import-confirm dialog, locale-specific glitch scramble alphabet (katakana for JP, Han for ZH, Latin elsewhere), and per-locale example dialog.
- **PNG export** — html-to-image-based, with a 15px black border around the captured frame. Filename `commlink_dialog_<epoch-ms>.png`.
- **Effects** — scanlines, glitch (static SVG displacement-map tearing), accent color picker (8 presets + custom-color slot with saved swatch), background image (upload, paste, recrop).
- **DONATE panel** — third tab in the lower-left. Cyberpunk thank-you text, "HELL YEAH" button to a configurable donation URL, and a yellow-on-dark QR code generated on the fly.
- **Persistence** — `localStorage` keeps state, contacts, snapshots, language, UI open-state. **Images** (bg + bgOriginal + body images + their `*Original` recrop sources) live in **IndexedDB**, content-addressed by SHA-256 so identical images dedupe automatically across messages and snapshots.

## Running it

Just open the file:
```
xdg-open index.html          # Linux
open index.html              # macOS
start index.html             # Windows
```

No server needed — all dependencies are either inlined (fonts as base64) or loaded from CDN (augmented-ui, html-to-image, qrcode-generator).

If you'd rather use a local server:
```
python3 -m http.server
# then visit http://localhost:8000
```

## File structure

```
.
├── index.html              ← markup + inline JS, inlined @font-face base64 fonts
├── css/
│   ├── base.css            ← root vars, layout, panels, fields, buttons, swatches, toast, lang select
│   ├── messages.css        ← message editor rows + dialog frame + preview rendering + signal bars
│   ├── config.css          ← snapshots panel + slot list
│   └── contacts.css        ← collapsible sidebars (contacts / snapshots / donate) + contact editor
└── js/
    ├── i18n.js             ← translation dictionary for all 8 supported locales
    ├── storage.js          ← localStorage + IndexedDB image store
    ├── state.js            ← defaultState, loadState/saveState, helpers, migrations
    ├── render.js           ← renderPreview, renderMessagesEditor, syncForm
    ├── snapshots.js        ← snapshot CRUD + bundled EXAMPLE_* seeding
    ├── contacts.js         ← contact CRUD + inline edit
    ├── crop.js             ← image crop modal (openCrop/doCrop + drag handlers)
    ├── png-export.js       ← html-to-image PNG export
    ├── json-io.js          ← state + contacts JSON export/import
    └── effects.js          ← tag-glitch animation + version-hover morph
```

## Tech notes

- **Fonts**: Tektur (display/body, Latin + Cyrillic) and JetBrains Mono (mono, Latin + Cyrillic) — base64-embedded directly inside `index.html`'s `<style id="font-face-inline">` block so html-to-image picks them up reliably without any cross-origin fetch (necessary for clean PNG export on `file://`). CJK glyphs fall back to system fonts (Hiragino / Yu Gothic / PingFang / Noto Sans CJK).
- **Clipped corners / notches**: [augmented-ui v2](https://augmented-ui.com), loaded from CDN.
- **PNG export**: [html-to-image](https://github.com/bubkoo/html-to-image) clones the DOM into an SVG `foreignObject` so the browser does the actual rendering (correctly handling clip-path, gradients, box-shadow). The glitch SVG filter is temporarily cloned into the captured tree so its `url(#glitch-slices)` reference resolves; the export captures `.stage-wrap` so the floating signal-bars sibling is included, then crops off the `.stage-meta` header.
- **QR code**: [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) — small SVG renderer; custom path emitted by hand so the cells can be yellow-on-dark instead of the default monochrome.
- **i18n**: dot-path key lookup with `{var}` interpolation; English fallback when a key is missing in another locale. Glitch animation reads the tag string fresh on each cycle so language changes apply on the next glitch.
- **Image dedup**: every bg / body-image upload is hashed (SHA-256) and stored once in IndexedDB. State JSON holds the `idb:<hash>` ref; snapshots store the same ref → no copy on save. A reference-count GC runs after destructive ops (image clear, JSON import, snapshot delete) to remove orphaned blobs.
- **Persistence**: switched from cookies → `localStorage` because cookies don't work reliably on `file://` URLs.

## Versioning

`APP_VERSION` constant near the top of the script in `index.html` follows X.Y.Z:
- **X** — almost certainly never bumped
- **Y** — bumped for major features
- **Z** — bumped for all small changes (tweaks, fixes, polish)

The header tag shows the version after the locale-aware app name (e.g. `DIALOG CONSTRUCTOR // v1.2.12`). The tag occasionally glitches to `DIALOG FORGER` and back.

## Storage keys

**localStorage**
- `commlink:state` — current dialog (messages, choices, meta, accent, FX). Image fields are `idb:<hash>` refs.
- `commlink:snapshots` — `{ name: snapshot }` map. Image fields are refs (same hash space as state).
- `commlink:contacts` — `[ { id, name, avatar } ]`. Avatars stay as base64 here (they're already 128×128 WEBP and small).
- `commlink:bgOriginal` — recrop source ref for the background.
- `commlink:lang` — current locale code.
- `commlink:openPanel` — currently open side panel (`contacts` / `snapshots` / `donate` / `''`).
- `commlink:seeded` — version stamp so the bundled `EXAMPLE_*` snapshots refresh after a schema bump.
- `commlink:showExamples` — `'1'` / `'0'` for the SHOW EXAMPLES toggle in the snapshots panel.

**IndexedDB**
- DB `commlink-images`, store `images`: `{ key: sha256hex, value: Blob }`. Used for bg, bgOriginal, and message body images (current + recrop source).

## License

[MIT](LICENSE) © 2026 CyberDelaai
