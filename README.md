# COMMLINK — Cyberpunk Dialog Constructor

A single-page web app for composing cyberpunk-styled dialog screenshots (Cyberpunk 2077 / netrunner UI vibe). No backend. Open `index.html` in any modern browser.

Inspired by [Commlink-Thread](https://tonkatsura.github.io/Comlink-Thread/).

## Features

- **Messages** — speaker, body, portrait, left/right side per message
- **Contacts** — saved name + avatar presets in a collapsible sidebar; click to drop a new message pre-filled
- **Snapshots** — save/load named versions of the whole dialog
- **PNG export** — html-to-image-based, with a 15px black border around the captured frame
- **Effects** — scanlines, accent color picker, background image
- **Persistence** — `localStorage` keeps state, contacts, snapshots, and sidebar state between sessions

## Running it

Just open the file:
```
xdg-open index.html          # Linux
open index.html              # macOS
start index.html             # Windows
```

No server needed — all dependencies are either inlined (fonts as base64) or loaded from CDN (augmented-ui, html-to-image).

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
│   ├── base.css            ← root vars, layout, panels, fields, buttons, swatches, toast
│   ├── messages.css        ← message editor rows + dialog frame + preview rendering
│   ├── config.css          ← snapshots panel
│   └── contacts.css        ← collapsible sidebar + contact list
└── fonts/                  ← original woff2 files (also embedded as base64 inside index.html)
```

## Tech notes

- **Fonts**: Tektur (display/body, Latin + Cyrillic) and JetBrains Mono (mono, Latin + Cyrillic) — base64-embedded directly inside `index.html`'s `<style id="font-face-inline">` block so html-to-image picks them up reliably without any cross-origin fetch (necessary for clean PNG export on `file://`).
- **Clipped corners / notches**: [augmented-ui v2](https://augmented-ui.com), loaded from CDN.
- **PNG export**: [html-to-image](https://github.com/bubkoo/html-to-image) — clones the DOM into an SVG `foreignObject` so the browser does the actual rendering (correctly handling clip-path, gradients, box-shadow).
- **Persistence**: switched from cookies → `localStorage` because cookies don't work reliably on `file://` URLs.

## localStorage keys

- `commlink:state` — current dialog (messages, choices, meta, accent, FX, bg)
- `commlink:snapshots` — `{ name: snapshot }` map
- `commlink:contacts` — `[ { id, name, avatar } ]`
- `commlink:sideOpen` — `'1'` / `''` for sidebar open/closed
