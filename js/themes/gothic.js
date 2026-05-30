// GOTHIC theme — dark cathedral aesthetic with ornate avatar frames.
//
// Inherits the default theme's renderStage; the visual divergence comes
// entirely from `css/themes/gothic.css` (deep black palette, blood-red
// borders, cathedral-arch clipped avatars, serif body text).

(function registerGothicTheme() {
  if (typeof THEMES === 'undefined') return;
  THEMES.gothic = {
    label: 'GOTHIC',
    // Gothic silhouette: ornate compound clips at each corner of the stage,
    // tall vertical clips at the top of the dialog for a cathedral-window
    // feel + simpler clips at the bottom. Sizes set in css/themes/gothic.css.
    shapes: {
      stage: 'tl-2-clip-x tr-2-clip-x br-2-clip-x bl-2-clip-x border',
      dialog: 'tl-2-clip-y tr-2-clip-y br-clip bl-clip border'
    },
    renderStage(state) {
      // Run default's renderer first (populates messages/channels/signal bars)…
      if (THEMES.default && typeof THEMES.default.renderStage === 'function') {
        THEMES.default.renderStage(state);
      }
      // …then expose the lit-bar count as a data attribute so the gothic
      // CSS can swap in the matching graveyard SVG mask.
      const signalBars = document.getElementById('signalBars');
      if (signalBars) {
        const lit = signalBars.querySelectorAll('.bar.on').length;
        signalBars.dataset.signalLevel = Math.max(1, Math.min(5, lit));
      }
    }
  };
})();
