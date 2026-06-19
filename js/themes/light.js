// LIGHT theme — an "electronic ink" inversion: dark ink printed on a pale
// paper-white stage, the opposite of every other (dark) theme. The look is
// mostly a CSS-variable / color treatment (css/themes/light.css) that recolors
// the inherited DEFAULT stage rendering to dark-on-light. Deliberately
// monochrome (the e-ink look), so it stays readable whatever accent the user
// has picked; the user's accent still tints the speaker names / chosen choice.
//
// The one piece of JS is renderStage: renderPreview paints a DARK default
// gradient (+ a darkening brightness filter) onto #stageBg whenever the user
// has no background of their own — wrong for a light theme — so we run the
// default renderer and then, only when there's no user bg, swap in a pale
// e-ink default page instead. A user-selected background is left untouched.

(function registerLightTheme() {
  if (typeof THEMES === 'undefined') return;

  // Pale "e-paper" default background, shown only when the user hasn't picked
  // their own bg. A soft center-lit warm-paper wash; css/themes/light.css's
  // #stageBg::after lays a faint grain + vignette over it.
  const EINK_DEFAULT_BG =
    'radial-gradient(ellipse at 50% 22%, #f6f4ee 0%, #ece9e1 48%, #ddd9cf 100%)';

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
      // Replace renderPreview's dark default bg with the pale e-ink page —
      // but ONLY when the user has no background of their own. With a user bg,
      // renderPreview has already set their image + brightness; leave it be.
      const bg = document.getElementById('stageBg');
      if (bg && !state.bg) {
        bg.style.backgroundImage = 'none';
        bg.style.background = EINK_DEFAULT_BG;
        bg.style.filter = 'none'; // don't darken the paper (overrides the 0.55)
      }
    }
  };
})();
