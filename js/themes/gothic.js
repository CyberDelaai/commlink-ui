// GOTHIC theme — dark cathedral aesthetic with ornate avatar frames.
//
// Inherits the neon theme's renderStage and adds the signal-bars
// graveyard: 5 SVG variants painted as a background-image with the user's
// accent color baked in. background-image (instead of mask-image) is what
// lets the stage glitch/chromatic filters actually distort the crosses —
// the filter has real strokes/edges to displace, not a uniform color box.

(function registerGothicTheme() {
  if (typeof THEMES === 'undefined') return;

  // Per-level SVG content (inner of <svg>). `{C}` placeholders are replaced
  // at render time with the URL-encoded accent stroke color.
  const GRAVEYARD = {
    1: "<line x1='8' y1='29' x2='92' y2='29' stroke='{C}' stroke-width='3.2'/><g transform='rotate(25 50 28)'><line x1='50' y1='17' x2='50' y2='28' stroke='{C}'/><line x1='46' y1='20' x2='54' y2='20' stroke='{C}'/></g>",
    2: "<line x1='8' y1='29' x2='92' y2='29' stroke='{C}' stroke-width='3.2'/><g transform='rotate(-4 42 28)'><line x1='42' y1='16' x2='42' y2='28' stroke='{C}'/><line x1='38' y1='19' x2='46' y2='19' stroke='{C}'/></g><g transform='rotate(3 58 28)'><line x1='58' y1='14' x2='58' y2='28' stroke='{C}'/><line x1='54' y1='17' x2='62' y2='17' stroke='{C}'/></g>",
    3: "<line x1='8' y1='29' x2='92' y2='29' stroke='{C}' stroke-width='3.2'/><g transform='rotate(-3 32 28)'><line x1='32' y1='17' x2='32' y2='28' stroke='{C}'/><line x1='28' y1='20' x2='36' y2='20' stroke='{C}'/></g><g transform='rotate(1 50 28)'><line x1='50' y1='10' x2='50' y2='28' stroke='{C}'/><line x1='45' y1='14' x2='55' y2='14' stroke='{C}'/></g><g transform='rotate(5 68 28)'><line x1='68' y1='15' x2='68' y2='28' stroke='{C}'/><line x1='64' y1='18' x2='72' y2='18' stroke='{C}'/></g>",
    4: "<line x1='8' y1='29' x2='92' y2='29' stroke='{C}' stroke-width='3.2'/><g transform='rotate(-5 27 28)'><line x1='27' y1='16' x2='27' y2='28' stroke='{C}'/><line x1='23' y1='19' x2='31' y2='19' stroke='{C}'/></g><g transform='rotate(2 41 28)'><line x1='41' y1='12' x2='41' y2='28' stroke='{C}'/><line x1='37' y1='15' x2='45' y2='15' stroke='{C}'/></g><g transform='rotate(-2 59 28)'><line x1='59' y1='15' x2='59' y2='28' stroke='{C}'/><line x1='55' y1='18' x2='63' y2='18' stroke='{C}'/></g><g transform='rotate(4 73 28)'><line x1='73' y1='13' x2='73' y2='28' stroke='{C}'/><line x1='69' y1='16' x2='77' y2='16' stroke='{C}'/></g>",
    5: "<line x1='8' y1='29' x2='92' y2='29' stroke='{C}' stroke-width='3.2'/><line x1='24' y1='16' x2='24' y2='28' stroke='{C}'/><line x1='20' y1='19' x2='28' y2='19' stroke='{C}'/><line x1='37' y1='12' x2='37' y2='28' stroke='{C}'/><line x1='33' y1='15' x2='41' y2='15' stroke='{C}'/><line x1='50' y1='8' x2='50' y2='28' stroke='{C}'/><line x1='45' y1='12' x2='55' y2='12' stroke='{C}'/><line x1='63' y1='12' x2='63' y2='28' stroke='{C}'/><line x1='59' y1='15' x2='67' y2='15' stroke='{C}'/><line x1='76' y1='16' x2='76' y2='28' stroke='{C}'/><line x1='72' y1='19' x2='80' y2='19' stroke='{C}'/>"
  };

  function graveyardBackgroundImage(level, accent) {
    const body = GRAVEYARD[level] || GRAVEYARD[1];
    // `#` in the accent color must be URL-encoded to %23 so the data URL
    // doesn't break on the fragment separator; SVG attribute parsing then
    // sees the decoded `#xxxxxx` color.
    const c = encodeURIComponent(accent || '#000000');
    const svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 32' fill='none' stroke-width='2.6' stroke-linecap='round'>"
      + body.replace(/\{C\}/g, c)
      + "</svg>";
    return "url(\"data:image/svg+xml;utf8," + svg + "\")";
  }

  THEMES.gothic = {
    label: 'GOTHIC',
    shapes: {
      stage: 'tl-2-clip-x tr-2-clip-x br-2-clip-x bl-2-clip-x border',
      dialog: 'tl-2-clip-y tr-2-clip-y br-clip bl-clip border'
    },
    renderStage(state) {
      if (THEMES.neon && typeof THEMES.neon.renderStage === 'function') {
        THEMES.neon.renderStage(state);
      }
      const signalBars = document.getElementById('signalBars');
      if (signalBars) {
        const lit = signalBars.querySelectorAll('.bar.on').length;
        const level = Math.max(1, Math.min(5, lit));
        signalBars.dataset.signalLevel = level;
        // Paint the graveyard as a background-image (NOT mask-image) so the
        // FX filters chain (#glitch-slices, #chromatic-aberration) actually
        // distorts the strokes. The accent color is encoded into the SVG.
        signalBars.style.backgroundImage = graveyardBackgroundImage(level, state.accent);
      }
    }
  };
})();
