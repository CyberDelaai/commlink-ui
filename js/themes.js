// COMMLINK themes: registry + apply/preview + side-panel renderer.
//
// A theme is a set of CSS-variable overrides applied via `:root[data-theme=X]`.
// `default` is the baseline (no overrides — vars from the regular `:root`).
//
// Lifecycle:
//   - On script load, restore saved theme (data-theme attribute set on <html>).
//   - applyTheme(id): persistent — writes localStorage + re-renders the list.
//   - previewTheme(id): transient hover preview — swaps data-theme + triggers
//     the heavy glitch overlay on the stage. Does not touch localStorage.
//   - endThemePreview(): unhover — restores data-theme to the applied theme.

const THEME_KEY = 'commlink:theme';

const THEMES = {
  default: { label: 'DEFAULT' }
};

let appliedThemeId = storageGet(THEME_KEY) || 'default';
// Apply at script load so the CSS vars take effect before first paint.
// Validity check is deferred to init (in the inline script) because
// non-default themes register from separate files that load AFTER this one;
// validating here would discard them.
document.documentElement.dataset.theme = appliedThemeId;

let previewingThemeId = null;
let previewGlitchTimer = null;

// Apply a theme's `shapes` map by rewriting `data-augmented-ui` on the
// listed element IDs. Augmented-ui v2 re-derives its clip-path from the
// attribute via CSS attribute selectors, so no extra re-render needed.
// Safe to call before elements exist (getElementById returns null).
//
// Also clears any inline `--aug-*` CSS vars on the targeted elements before
// setting the new attr — bubblegum's renderStage writes dynamic inset vars
// inline, and those would otherwise persist into the next theme and warp
// its shape computation.
//
// Falls back to the default theme's shapes when the target theme provides
// none, so prior themes' attributes never stick around silently.
function applyThemeShapes(themeId) {
  const theme = THEMES[themeId];
  const shapes = (theme && theme.shapes)
    || (THEMES.default && THEMES.default.shapes);
  if (!shapes) return;
  Object.entries(shapes).forEach(([id, shape]) => {
    const el = document.getElementById(id);
    if (!el) return;
    for (let i = el.style.length - 1; i >= 0; i--) {
      const prop = el.style[i];
      if (prop && prop.indexOf('--aug-') === 0) {
        el.style.removeProperty(prop);
      }
    }
    el.setAttribute('data-augmented-ui', shape);
  });
}

// ---- Per-theme color memory -------------------------------------------
// Each theme remembers its own accent / choices colors (presets + custom
// swatches). On switch we snapshot the outgoing theme's colors and restore
// the incoming theme's saved set, so e.g. NEO_AZTEC can keep a gold accent
// while the default theme keeps cyan. Colors live in `state`, persisted via
// saveState; the snapshots live in state.themeColors[themeId].
const THEME_COLOR_FIELDS = ['accent', 'choicesColor', 'customAccent', 'customChoicesColor'];

function rememberThemeColors(themeId) {
  if (typeof state === 'undefined' || !themeId) return;
  if (!state.themeColors) state.themeColors = {};
  const snap = {};
  THEME_COLOR_FIELDS.forEach((f) => { snap[f] = state[f]; });
  state.themeColors[themeId] = snap;
}
function restoreThemeColors(themeId) {
  if (typeof state === 'undefined') return;
  const saved = state.themeColors && state.themeColors[themeId];
  if (!saved) return; // unseen theme — keep the current colors as its seed
  THEME_COLOR_FIELDS.forEach((f) => {
    if (saved[f] !== undefined) state[f] = saved[f];
  });
}

function applyTheme(themeId) {
  if (!THEMES[themeId]) return;
  // If applied mid-hover, the live state holds PREVIEW colors — revert to the
  // real applied-theme colors first so the outgoing snapshot is correct.
  if (previewColorBackup) {
    THEME_COLOR_FIELDS.forEach((f) => { state[f] = previewColorBackup[f]; });
    previewColorBackup = null;
  }
  // Snapshot the outgoing theme's colors, then load the incoming theme's.
  rememberThemeColors(appliedThemeId);
  appliedThemeId = themeId;
  previewingThemeId = null;
  document.documentElement.dataset.theme = themeId;
  storageSet(THEME_KEY, themeId);
  restoreThemeColors(themeId);
  if (typeof saveState === 'function') saveState();
  applyThemeShapes(themeId);
  if (typeof renderThemes === 'function') renderThemes();
  // Re-paint the stage so the new theme's renderStage + restored colors take
  // over (renderPreview also refreshes the accent/choices palette UI).
  if (typeof renderPreview === 'function') renderPreview();
}

// Stop the brief "downloading" glitch flash without ending the preview
// itself — restores glitchDisplacement to the user's slider value and
// removes the `theme-previewing` class. Used both by the timer and by
// endThemePreview (so unhovering mid-flash kills the glitch immediately).
function stopPreviewGlitch() {
  if (previewGlitchTimer) {
    clearTimeout(previewGlitchTimer);
    previewGlitchTimer = null;
  }
  if (typeof glitchDisplacement !== 'undefined' && glitchDisplacement) {
    const gAmt = (typeof state !== 'undefined' && typeof state.glitchAmount === 'number') ? state.glitchAmount : 38;
    glitchDisplacement.setAttribute('scale', gAmt);
  }
  if (typeof stage !== 'undefined' && stage) {
    stage.classList.remove('theme-previewing');
  }
}

// While hovering, the live (applied-theme) colors are stashed here so the
// preview can show the hovered theme's remembered colors, then revert.
let previewColorBackup = null;

function previewTheme(themeId) {
  if (!THEMES[themeId]) return;
  previewingThemeId = themeId;
  document.documentElement.dataset.theme = themeId;
  applyThemeShapes(themeId);
  // Show the hovered theme's remembered colors (no persistence). Back up the
  // live colors once per hover-sequence so endThemePreview can restore them.
  if (typeof state !== 'undefined') {
    if (!previewColorBackup) {
      previewColorBackup = {};
      THEME_COLOR_FIELDS.forEach((f) => { previewColorBackup[f] = state[f]; });
    }
    const saved = themeId !== appliedThemeId && state.themeColors && state.themeColors[themeId];
    THEME_COLOR_FIELDS.forEach((f) => {
      state[f] = (saved && saved[f] !== undefined) ? saved[f] : previewColorBackup[f];
    });
  }
  if (previewGlitchTimer) clearTimeout(previewGlitchTimer);
  if (typeof stage !== 'undefined' && stage) {
    stage.classList.add('theme-previewing');
  }
  // Re-render so the previewed theme's renderStage runs (structural changes,
  // not just CSS-variable swaps, take effect during hover).
  if (typeof renderPreview === 'function') renderPreview();
  // Boost the glitch displacement scale AFTER renderPreview — its universal
  // FX layer unconditionally writes state.glitchAmount onto the displacement
  // node, which would otherwise clobber our 80-burst.
  if (typeof glitchDisplacement !== 'undefined' && glitchDisplacement) {
    glitchDisplacement.setAttribute('scale', 80);
  }
  // 0.3s flash — reads as the theme "downloading" rather than a continuous
  // distortion that obscures the preview.
  previewGlitchTimer = setTimeout(stopPreviewGlitch, 300);
}

function endThemePreview() {
  if (previewingThemeId === null) return;
  previewingThemeId = null;
  document.documentElement.dataset.theme = appliedThemeId;
  applyThemeShapes(appliedThemeId);
  // Restore the live colors stashed at hover start.
  if (typeof state !== 'undefined' && previewColorBackup) {
    THEME_COLOR_FIELDS.forEach((f) => { state[f] = previewColorBackup[f]; });
    previewColorBackup = null;
  }
  // Always kill the flash on unhover, even if mid-burst.
  stopPreviewGlitch();
  if (typeof renderPreview === 'function') renderPreview();
}

function renderThemes() {
  const list = typeof themeList !== 'undefined' ? themeList : document.getElementById('themeList');
  if (!list) return;
  list.innerHTML = '';
  Object.entries(THEMES).forEach(([id, theme]) => {
    const localized = (typeof t === 'function' ? t('theme.' + id) : '') || theme.label;
    const item = document.createElement('div');
    item.className = 'theme-item' + (id === appliedThemeId ? ' active' : '');
    item.dataset.themeId = id;
    item.innerHTML = `
      <span class="theme-pip"></span>
      <span class="theme-name"></span>
    `;
    item.querySelector('.theme-name').textContent = localized;
    item.addEventListener('mouseenter', () => previewTheme(id));
    item.addEventListener('mouseleave', () => endThemePreview());
    item.addEventListener('click', () => applyTheme(id));
    list.appendChild(item);
  });
}
