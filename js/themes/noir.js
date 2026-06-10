// NOIR theme — high-contrast black & white film-noir look where the user's
// accent color is the ONLY color left in the frame (selective "spot color",
// Sin City style). Everything else — background image, portraits, attached
// images — is desaturated to grayscale; the accent survives on the speaker
// names, the chosen choice, the lit signal bars and the channel marker.
//
// "Bad signal" → RAIN. The signal meter already degrades as the glitch
// amount climbs (fewer lit bars = worse signal), so noir reuses that: the
// fewer bars are lit, the heavier the rain that falls across the stage. With
// a clean signal (glitch off, 5 bars) the night stays dry. The rain itself
// is a CSS-animated overlay (`#stageRain`) defined in css/themes/noir.css;
// renderStage only decides whether it shows and how hard it comes down.

(function registerNoirTheme() {
  if (typeof THEMES === 'undefined') return;

  // lit signal bars → rain opacity. 5/4 bars = clear night (no rain); the
  // signal has to actually drop before the weather turns.
  const RAIN_ALPHA = { 1: 1, 2: 0.66, 3: 0.34 };
  // Heavier rain falls faster (shorter animation cycle).
  const RAIN_SPEED = { 1: '0.5s', 2: '0.7s', 3: '0.95s' };

  // ---- Signal meter: a single cigarette --------------------------------
  // The "signal bars" become one cigarette burning down: 5 bars = a fresh,
  // full-length smoke; as the signal drops the ember recedes toward the
  // filter (shorter cigarette), the cherry glows the accent color, and ash
  // accumulates — both a grey tip and a pile of fallen flakes laid along the
  // frame beneath the already-burned span. Painted as a background-image SVG
  // (accent baked in, same approach as gothic's graveyard / aztec's grail) so
  // it sits above the inner frame and the holes/rain read through cleanly.
  // Geometry lives in a 150x48 viewBox; the element is anchored bottom so the
  // ash rests on the dialog's top edge.
  // Geometry is authored left-to-right (filter at left, ember at right) and
  // then MIRRORED as a whole so the cigarette ends — filter-first — at the
  // dialog's top-right corner and burns leftward (inward). Filter is flush to
  // the SVG's left edge (x0) so, after the mirror, it lands flush against the
  // frame's right corner where the element's right edge is anchored.
  const CIG_START = 134;   // ember x at full signal (level 5)
  const CIG_MIN = 50;      // ember x at worst signal (level 1) — a short stub
  const FILTER_X0 = 0, FILTER_X1 = 24, Y0 = 18, Y1 = 28, CY = 23;

  // Fallen ash flakes scattered along the bottom, under the burned-away span
  // (emberX..CIG_START). Deterministic positions (no Math.random) so the pile
  // doesn't jitter on every re-render.
  function ashFlakes(emberX) {
    let s = '';
    const e = (cx, cy, r, fill, o) =>
      "<ellipse cx='" + cx.toFixed(1) + "' cy='" + cy.toFixed(1) + "' rx='" + r.toFixed(2) + "' ry='" + (r * 0.65).toFixed(2) + "' fill='" + fill + "' opacity='" + o + "'/>";
    // Dense flakes packed along the burned span, each a small mound resting on
    // the frame, plus the odd flake still falling between cigarette and pile.
    for (let x = emberX + 4; x <= CIG_START; x += 6) {
      const j = ((x * 7) % 5) - 2;          // pseudo-jitter -2..2
      const baseY = 41 - ((x * 5) % 3);     // 39..41 resting line (sits on the frame)
      // mound: a few stacked flakes of varied tone
      s += e(x + j,     baseY,       1.9 + (x % 3) * 0.5,   '%23c2c2c6', 0.92);
      s += e(x + j + 3, baseY + 1.2, 1.4 + (x % 2) * 0.5,   '%236e6e72', 0.88);
      s += e(x + j - 2, baseY + 1.6, 1.2 + ((x + 1) % 3) * 0.4, '%238f8f93', 0.82);
      s += e(x + j + 1, baseY - 2.4, 1.1 + (x % 2) * 0.45,  '%23d4d4d8', 0.8);  // mound crest
      s += e(x + j - 4, baseY + 0.4, 1.0 + ((x + 2) % 2) * 0.4, '%23a3a3a7', 0.8);
      // a flake mid-fall on alternating steps
      if ((x % 12) < 6) s += e(x + j, 31 + ((x * 3) % 7), 1.0, '%23a9a9ad', 0.55);
    }
    return s;
  }

  function cigaretteBackgroundImage(level, accent) {
    const a = encodeURIComponent(accent || '#fcee0a');
    const emberX = Math.round(CIG_MIN + ((level - 1) / 4) * (CIG_START - CIG_MIN));
    const paperEnd = emberX - 5;
    // smoke wisp rising off the ember
    const smoke = "<path d='M" + emberX + " 17 q -6 -4 -1 -9 q 5 -5 -1 -9' fill='none' stroke='rgba(225,225,230,0.28)' stroke-width='1.3' stroke-linecap='round'/>";
    // cork filter (warm-grey) with paper joint + two band lines
    const filter =
      "<rect x='" + FILTER_X0 + "' y='" + Y0 + "' width='" + (FILTER_X1 - FILTER_X0) + "' height='" + (Y1 - Y0) + "' rx='2' fill='%239a948a'/>" +
      "<rect x='" + (FILTER_X1 - 2) + "' y='" + Y0 + "' width='2' height='" + (Y1 - Y0) + "' fill='%235f5b54'/>" +
      "<rect x='" + (FILTER_X0 + 5) + "' y='" + Y0 + "' width='0.8' height='" + (Y1 - Y0) + "' fill='rgba(0,0,0,0.25)'/>" +
      "<rect x='" + (FILTER_X0 + 9) + "' y='" + Y0 + "' width='0.8' height='" + (Y1 - Y0) + "' fill='rgba(0,0,0,0.25)'/>";
    // white paper from the joint to just shy of the ember
    const paper = "<rect x='" + FILTER_X1 + "' y='" + Y0 + "' width='" + Math.max(0, paperEnd - FILTER_X1) + "' height='" + (Y1 - Y0) + "' rx='1.5' fill='%23ededf0'/>";
    // grey ash cap right at the burning tip
    const ashCap = "<rect x='" + (emberX + 2) + "' y='" + (Y0 + 1.5) + "' width='5' height='" + (Y1 - Y0 - 3) + "' rx='1.5' fill='%23a9a9ad' opacity='0.9'/>";
    // glowing accent cherry (layered translucent discs = soft glow) + hot core
    const ember =
      "<circle cx='" + emberX + "' cy='" + CY + "' r='11' fill='" + a + "' opacity='0.16'/>" +
      "<circle cx='" + emberX + "' cy='" + CY + "' r='7' fill='" + a + "' opacity='0.34'/>" +
      "<circle cx='" + emberX + "' cy='" + CY + "' r='4' fill='" + a + "'/>" +
      "<circle cx='" + emberX + "' cy='" + CY + "' r='1.6' fill='rgba(255,255,255,0.85)'/>";
    const body = smoke + filter + paper + ashCap + ember + ashFlakes(emberX);
    const svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 150 48'>" +
      "<g transform='translate(150,0) scale(-1,1)'>" + body + "</g></svg>";
    return "url(\"data:image/svg+xml;utf8," + svg + "\")";
  }

  THEMES.noir = {
    label: 'NOIR',
    // Stark, minimal silhouette: a plain rectangular stage (border drawn in
    // CSS, augmented-ui off) and a dialog with just two opposite clipped
    // corners — a single graphic flourish on an otherwise clean slab.
    shapes: {
      stage: 'none',
      dialog: 'tl-clip br-clip border'
    },
    renderStage(state) {
      // Inherit the default theme's stage rendering (messages, choices,
      // channels, accent vars, and — crucially — the lit signal-bar count
      // that we read below to drive the rain).
      if (THEMES.default && typeof THEMES.default.renderStage === 'function') {
        THEMES.default.renderStage(state);
      }

      // Desaturate the background. renderPreview has already written the
      // universal `brightness(...) contrast(...) saturate(...)` inline filter
      // by the time a theme's renderStage runs, so we override it here and
      // re-apply grayscale; switching to any other theme lets renderPreview's
      // normal (colored) filter take back over on the next paint.
      const bg = document.getElementById('stageBg');
      if (bg) {
        const bright = (typeof state.bgBrightness === 'number') ? state.bgBrightness : 0.55;
        bg.style.filter = `grayscale(1) brightness(${bright}) contrast(1.55)`;
      }

      // Signal meter → cigarette. The default renderStage just toggled the
      // `.bar.on` classes; count them and treat that as the burn level.
      const signalBars = document.getElementById('signalBars');
      const lit = signalBars ? signalBars.querySelectorAll('.bar.on').length : 5;
      if (signalBars) {
        const level = Math.max(1, Math.min(5, lit));
        signalBars.style.backgroundImage = cigaretteBackgroundImage(level, state.accent);
      }
      // Rain intensity from the same signal level.
      const alpha = RAIN_ALPHA[lit] || 0;
      if (typeof stage !== 'undefined' && stage) {
        stage.classList.toggle('rain', alpha > 0);
        stage.style.setProperty('--rain-alpha', alpha);
        stage.style.setProperty('--rain-speed', RAIN_SPEED[lit] || '0.95s');
      }

      // Notched bubble frames: when FRAMES is on, clip a SINGLE top corner of
      // each message bubble — the inner one, facing the center of the dialog
      // (top-right for left messages, top-left for right) — and let
      // augmented-ui draw the white border around that silhouette. default.js
      // strips the attribute for non-default themes, so we (re)apply it here.
      if (typeof pMessages !== 'undefined' && pMessages) {
        pMessages.querySelectorAll('.message:not(.system)').forEach((el) => {
          const body = el.querySelector('.body');
          if (!body) return;
          if (state.frames) {
            body.setAttribute('data-augmented-ui',
              el.classList.contains('right') ? 'tl-clip border' : 'tr-clip border');
          } else {
            body.removeAttribute('data-augmented-ui');
          }
        });
      }
    }
  };
})();
