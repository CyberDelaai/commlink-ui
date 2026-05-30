// Y2K BUBBLEGUM theme — chrome + hot pink + baby blue glossy variant.
//
// Currently CSS-only divergence: no `renderStage` defined here, so
// `renderPreview` falls back to `THEMES.default.renderStage`. The visual
// differences come from `css/themes/bubblegum.css`, scoped via the
// `:root[data-theme="bubblegum"]` selector so only the stage area diverges
// from the cyberpunk look.
//
// If structural changes are needed later (different DOM, repositioned
// elements), attach `THEMES.bubblegum.renderStage = function(state) { ... }`.

(function registerBubblegumTheme() {
  if (typeof THEMES === 'undefined') return;
  THEMES.bubblegum = {
    label: 'BUBBLEGUM',
    // Three corners get curved scoop-x notches (tl, tr, br); the bottom-left
    // stays a smooth round for a lopsided Y2K-bubblegum silhouette.
    // Sizes live in css/themes/bubblegum.css.
    shapes: {
      stage: 'tl-scoop-x tr-scoop-x br-scoop-x bl-round border',
      dialog: 'tl-scoop-x tr-scoop-x br-scoop-x bl-round border'
    },
    // Inherit the default theme's stage rendering, then fit the dialog's
    // top-left scoop width to the channel-top label so the niche stretches
    // to match whatever the user typed.
    renderStage(state) {
      if (THEMES.default && typeof THEMES.default.renderStage === 'function') {
        THEMES.default.renderStage(state);
      }
      // Measure after layout settles, then size the top-left and bottom-right
      // scoops to hug their respective channel labels. Both `tl-scoop-x` and
      // `br-scoop-x` use `--aug-*-inset1` (default 2 * --aug-*) as the
      // horizontal extent; we override per render to match text width.
      requestAnimationFrame(() => {
        // Minimum 28px = augmented-ui's default for tl-/br-scoop-x
        // (`calc(--aug-* * 2)` with --aug-* = 14px), matching the
        // untouched top-right corner's visual width.
        const wTop = pMeta.offsetWidth;
        dialog.style.setProperty('--aug-tl-inset1', Math.max(28, wTop + 30) + 'px');
        const wBot = pMetaRight.offsetWidth;
        dialog.style.setProperty('--aug-br-inset1', Math.max(28, wBot + 30) + 'px');
      });
    }
  };
})();
