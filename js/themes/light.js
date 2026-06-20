// LIGHT theme — an "electronic ink" inversion: dark ink printed on a pale
// paper-white stage, the opposite of every other (dark) theme. The look is
// mostly a CSS-variable / color treatment (css/themes/light.css) that recolors
// the inherited DEFAULT stage rendering to dark-on-light. Deliberately
// monochrome (the e-ink look), so it stays readable whatever accent the user
// has picked; the user's accent still tints the speaker names / chosen choice.
//
// The one piece of JS is renderStage: renderPreview paints the bundled DARK
// default background (makeDefaultBg) — and darkens any bg with a brightness
// filter — which is wrong for a light theme. So we run the default renderer
// and then swap in a pale e-ink page whenever the stage is showing the
// DEFAULT background (either no bg at all, or the bundled makeDefaultBg one
// that ships with the seeded examples). A background the USER explicitly
// picked is left untouched under renderPreview's normal brightness handling.

(function registerLightTheme() {
  if (typeof THEMES === 'undefined') return;

  // Pale "e-paper" default background, shown in place of the bundled dark
  // default. A soft center-lit warm-paper wash; css/themes/light.css's
  // #stageBg::after lays a faint grain + vignette over it.
  const EINK_DEFAULT_BG =
    'radial-gradient(ellipse at 50% 22%, #f6f4ee 0%, #ece9e1 48%, #ddd9cf 100%)';

  // Cache of the bundled default background's idb:<hash> ref. makeDefaultBg()
  // is a fixed SVG, so its content-addressed ref is constant; we compute it
  // once (async — hashing is async) and re-render when it lands. Until then,
  // `null` means "unknown" and a default-looking bg paints normally for one
  // frame before swapping to the e-ink page.
  let defaultBgRef = null;
  let defaultBgPending = false;

  // True when #stageBg is showing the BUNDLED default background (so the
  // light theme should override it), false for a user-chosen background.
  function isDefaultBg(bgRef) {
    if (!bgRef) return true;                       // no bg → default
    if (typeof makeDefaultBg === 'function' && bgRef === makeDefaultBg()) {
      return true;                                 // pre-IDB-migration data URL
    }
    if (defaultBgRef) return bgRef === defaultBgRef;
    // Compute the default ref once, then re-render so the swap applies.
    if (!defaultBgPending
        && typeof storeImageDataUrl === 'function'
        && typeof makeDefaultBg === 'function') {
      defaultBgPending = true;
      storeImageDataUrl(makeDefaultBg())
        .then(ref => {
          defaultBgRef = ref;
          defaultBgPending = false;
          if (typeof renderPreview === 'function') renderPreview();
        })
        .catch(() => { defaultBgPending = false; });
    }
    return false;
  }

  THEMES.light = {
    label: 'LIGHT',
    // Soft rounded corners on all four sides — reads like an e-reader screen /
    // printed card rather than the default theme's angular cyberpunk clips.
    // (Radii come from the --aug-tl/tr/br/bl values; light.css enlarges them
    // for a more pronounced, device-like curve.)
    shapes: {
      stage: 'tl-round tr-round br-round bl-round border',
      dialog: 'tl-round tr-round br-round bl-round border'
    },
    renderStage(state) {
      // Inherit the default theme's stage rendering (messages, choices,
      // channels, signal bars, accent vars). light.css recolors all of it.
      if (THEMES.default && typeof THEMES.default.renderStage === 'function') {
        THEMES.default.renderStage(state);
      }
      // Replace the bundled dark default bg with the pale e-ink page — but
      // ONLY when the stage is showing the DEFAULT background (no bg, or the
      // bundled makeDefaultBg one). With a background the user picked,
      // renderPreview has already set their image + brightness; leave it be.
      const bg = document.getElementById('stageBg');
      if (bg && isDefaultBg(state.bg)) {
        bg.style.backgroundImage = 'none';
        bg.style.background = EINK_DEFAULT_BG;
        bg.style.filter = 'none'; // don't darken the paper (overrides the 0.55)
      }
    }
  };
})();
