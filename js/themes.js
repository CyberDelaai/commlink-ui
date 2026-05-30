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

function applyTheme(themeId) {
  if (!THEMES[themeId]) return;
  appliedThemeId = themeId;
  previewingThemeId = null;
  document.documentElement.dataset.theme = themeId;
  storageSet(THEME_KEY, themeId);
  applyThemeShapes(themeId);
  if (typeof renderThemes === 'function') renderThemes();
  // Re-paint the stage so the new theme's renderStage takes over.
  if (typeof renderPreview === 'function') renderPreview();
}

function previewTheme(themeId) {
  if (!THEMES[themeId]) return;
  previewingThemeId = themeId;
  document.documentElement.dataset.theme = themeId;
  applyThemeShapes(themeId);
  if (typeof glitchDisplacement !== 'undefined' && glitchDisplacement) {
    glitchDisplacement.setAttribute('scale', 80);
  }
  if (typeof stage !== 'undefined' && stage) {
    stage.classList.add('theme-previewing');
  }
  // Re-render so the previewed theme's renderStage runs (structural changes,
  // not just CSS-variable swaps, take effect during hover).
  if (typeof renderPreview === 'function') renderPreview();
}

function endThemePreview() {
  if (previewingThemeId === null) return;
  previewingThemeId = null;
  document.documentElement.dataset.theme = appliedThemeId;
  applyThemeShapes(appliedThemeId);
  if (typeof glitchDisplacement !== 'undefined' && glitchDisplacement) {
    const gAmt = (typeof state !== 'undefined' && typeof state.glitchAmount === 'number') ? state.glitchAmount : 38;
    glitchDisplacement.setAttribute('scale', gAmt);
  }
  if (typeof stage !== 'undefined' && stage) {
    stage.classList.remove('theme-previewing');
  }
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
