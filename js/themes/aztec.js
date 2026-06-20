// AZTEC theme — stone-and-gold codex aesthetic with a geometric tile frame.
//
// Frame design (source tiles in ~/Documents/frame, art inlined below):
//   top-right-corner   — the corner tile; mirrored for the other corners:
//                        TR as drawn · TL = mirror-X · BR = mirror-Y · BL = both
//   right-middle       — the MEDALLION: used exactly 4 times, once at the
//                        middle of each side: right as drawn, left rotated
//                        180°, top rotated 90°, bottom rotated 270°
//   right-below-middle — the FILL tile. Every edge is symmetric about its
//                        medallion: vertical sides — tiles BELOW the middle
//                        as drawn, tiles ABOVE mirrored vertically; top and
//                        bottom edges — tiles RIGHT of the middle as
//                        rotated, tiles LEFT of it mirrored horizontally.
//
// Tiles are painted as accent-colored data-URI SVG background layers on the
// stage. CSS consumes them via --az-* variables scoped to
// :root[data-theme="aztec"], so nothing leaks into other themes.
//
// STEP SIZING: the medallion must sit dead-center replacing exactly one fill
// tile, with an equal whole number of fill tiles on either side, so each
// edge run is an ODD multiple of one tile (33px):
//   side = 2*CORNER + (2k+1)*TILE  =  BASE + k*PAIR   (117 + k*66 px)
// The snapped values are published as --az-w / --az-h. The half-runs can't be
// CSS repeats (the two halves of an edge differ), so they're generated as
// stacked k-tile SVGs whenever the count or accent changes, with run lengths
// published as --az-runv / --az-runh.
// KEEP THE CONSTANTS IN SYNC with css/themes/aztec.css.

(function registerAztecTheme() {
  if (typeof THEMES === 'undefined') return;

  // ---- geometry (px) — mirror of the constants in css/themes/aztec.css ----
  const SCALE = 3;
  const CORNER = 14 * SCALE;        // 42px corner tile (14x14 units)
  const TILE = 11 * SCALE;          // 33px fill/medallion length along an edge
  const PAIR = 2 * TILE;            // 66px (keeps the run an odd tile count)
  const BASE = 2 * CORNER + TILE;   // 117px smallest valid side

  // ---- source tile art (SVG rects; fill inherits from the <svg> wrapper) ----
  // top-right corner, 14x14 units
  const CORNER_ART =
    "<rect x='0' y='0' width='14' height='0.949'/>" +
    "<rect x='13.047' y='0.949' width='0.953' height='13.051'/>" +
    "<g transform='matrix(1.004461,0,0,1.363503,-0.053533,-0.727006)'><rect x='1.049' y='2' width='10.951' height='0.733'/></g>" +
    "<rect x='0' y='10' width='2' height='0.937'/>" +
    "<rect x='1' y='3' width='1' height='7'/>" +
    "<rect x='0' y='12' width='2' height='1'/>" +
    "<rect x='1' y='13' width='1' height='1'/>" +
    "<rect x='3' y='12' width='1' height='2'/>" +
    "<rect x='4' y='12' width='8' height='0.947'/>" +
    "<rect x='11' y='3' width='1' height='9'/>" +
    "<rect x='3' y='4' width='7' height='1'/>" +
    "<rect x='5' y='6' width='1' height='3'/>" +
    "<rect x='6' y='8' width='2' height='1'/>" +
    "<rect x='7' y='6' width='1' height='2'/>" +
    "<rect x='6' y='6' width='1' height='1'/>" +
    "<rect x='3' y='5' width='1' height='6'/>" +
    "<rect x='4' y='10' width='6' height='1'/>" +
    "<g transform='matrix(1,0,0,1.001147,0,0.041238)'><rect x='9' y='4.953' width='1' height='4.994'/></g>";

  // right-middle (MEDALLION), 13x11 units
  const MEDALLION_ART =
    "<rect x='0' y='0' width='1' height='11'/>" +
    "<rect x='2' y='10' width='9' height='1'/>" +
    "<rect x='10' y='0' width='1' height='10'/>" +
    "<rect x='2' y='0' width='8' height='0.963'/>" +
    "<rect x='12' y='0' width='1' height='11'/>" +
    "<rect x='2' y='1.996' width='7' height='1.004'/>" +
    "<rect x='8.008' y='3' width='0.992' height='6'/>" +
    "<rect x='2.03' y='3' width='0.97' height='6'/>" +
    "<rect x='3' y='7.997' width='5.008' height='1.003'/>" +
    "<rect x='4.004' y='4.004' width='0.998' height='2.949'/>" +
    "<rect x='5.002' y='4.004' width='1.997' height='0.987'/>" +
    "<rect x='4.968' y='6.007' width='2.031' height='0.98'/>" +
    "<rect x='6.001' y='5.036' width='0.998' height='0.964'/>";

  // right-below-middle (FILL), 13x11 units
  const FILL_ART =
    "<rect x='2' y='10' width='9' height='1'/>" +
    "<rect x='10' y='1' width='1' height='9'/>" +
    "<rect x='4' y='1' width='6' height='1'/>" +
    "<rect x='4' y='2' width='1' height='5'/>" +
    "<rect x='5' y='6' width='2' height='1'/>" +
    "<rect x='6' y='3' width='1' height='3'/>" +
    "<rect x='7' y='3' width='2' height='1'/>" +
    "<rect x='8' y='4' width='1' height='5'/>" +
    "<rect x='2' y='8' width='6' height='1'/>" +
    "<rect x='2' y='0' width='1' height='8'/>" +
    "<rect x='0' y='0' width='1' height='11'/>" +
    "<g transform='matrix(1,0,0,1.1,0,-1.1)'><rect x='12' y='1' width='1' height='10'/></g>";

  // ---- transforms for a 13x11 edge tile ----
  // 180° stays 13x11; 90°/270° land in an 11x13 box; mirY flips vertically.
  const r180 = (art) => "<g transform='rotate(180 6.5 5.5)'>" + art + "</g>";
  const r90  = (art) => "<g transform='translate(11,0) rotate(90)'>" + art + "</g>";
  const r270 = (art) => "<g transform='translate(0,13) rotate(-90)'>" + art + "</g>";
  const mirY = (art) => "<g transform='translate(0,11) scale(1,-1)'>" + art + "</g>";  // flip a 13x11 tile vertically
  const mirX = (art) => "<g transform='translate(11,0) scale(-1,1)'>" + art + "</g>";  // flip an 11x13 tile horizontally
  const mirY13 = (art) => "<g transform='translate(0,13) scale(1,-1)'>" + art + "</g>"; // flip an 11x13 tile vertically

  // Static tiles (size never changes): corners, medallions, top/bottom fills.
  const ART = {
    cTR: { art: CORNER_ART, w: 14, h: 14 },
    cTL: { art: "<g transform='translate(14,0) scale(-1,1)'>" + CORNER_ART + "</g>", w: 14, h: 14 },
    cBR: { art: "<g transform='translate(0,14) scale(1,-1)'>" + CORNER_ART + "</g>", w: 14, h: 14 },
    cBL: { art: "<g transform='translate(14,14) scale(-1,-1)'>" + CORNER_ART + "</g>", w: 14, h: 14 },
    mR: { art: MEDALLION_ART, w: 13, h: 11 },
    mL: { art: r180(MEDALLION_ART), w: 13, h: 11 },
    mT: { art: mirY13(r90(MEDALLION_ART)), w: 11, h: 13 },
    mB: { art: mirY13(r270(MEDALLION_ART)), w: 11, h: 13 }
  };

  // Vertical half-run base art (stacked k times in setVRuns):
  const V_FILL = {
    fRb: FILL_ART,             // right, below the medallion — as drawn
    fRa: mirY(FILL_ART),       // right, above — mirrored vertically
    fLa: r180(FILL_ART),       // left, above — rotated 180
    fLb: mirY(r180(FILL_ART))  // left, below — 180 + vertical mirror
  };

  // Horizontal half-run base art (stacked n times in setHRuns).
  // The whole top/bottom rows are mirrored vertically (mirY13) so the
  // motif's outer side faces the frame edge.
  const H_FILL = {
    fTl: mirY13(r90(FILL_ART)),        // top, left of the medallion
    fTr: mirY13(mirX(r90(FILL_ART))),  // top, right — mirrored horizontally
    fBr: mirY13(r270(FILL_ART)),       // bottom, right
    fBl: mirY13(mirX(r270(FILL_ART)))  // bottom, left — mirrored horizontally
  };

  // Accent-colored data-URI for one tile (same encoding trick as gothic.js:
  // only the `#` of the color needs escaping in a utf8 data URL).
  function svgUrl(inner, w, h, color) {
    const c = encodeURIComponent(color || '#fcee0a');
    const svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 " + w + " " + h + "' fill='" + c + "'>" + inner + "</svg>";
    return "url(\"data:image/svg+xml;utf8," + svg + "\")";
  }

  // A vertical stack of `count` copies of a 13x11 tile (one half-run).
  function stackUrlV(art, count, color) {
    let body = '';
    for (let i = 0; i < count; i++) {
      body += "<g transform='translate(0," + (i * 11) + ")'>" + art + "</g>";
    }
    return svgUrl(body, 13, count * 11, color);
  }

  // A horizontal row of `count` copies of an 11x13 tile (one half-run).
  function stackUrlH(art, count, color) {
    let body = '';
    for (let i = 0; i < count; i++) {
      body += "<g transform='translate(" + (i * 11) + ",0)'>" + art + "</g>";
    }
    return svgUrl(body, count * 11, 13, color);
  }

  // ---- signal grail ----------------------------------------------------
  // The signal meter is a sacrificial chalice: blood level = signal level.
  // Blocky, stepped construction to match the frame tiles. viewBox 0 0 24 30:
  // y0-4 reserved for the level-5 overflow crest, rim at y4, stepped bowl,
  // stem, and a stepped-pyramid foot ending flush at y30.
  const GRAIL_ART =
    "<rect x='3' y='4' width='18' height='2'/>" +    // rim
    "<rect x='3' y='6' width='2' height='6'/>" +     // bowl wall L
    "<rect x='19' y='6' width='2' height='6'/>" +    // bowl wall R
    "<rect x='5' y='12' width='2' height='3'/>" +    // bowl step L
    "<rect x='17' y='12' width='2' height='3'/>" +   // bowl step R
    "<rect x='7' y='15' width='10' height='2'/>" +   // bowl bottom
    "<rect x='11' y='17' width='2' height='6'/>" +   // stem
    "<rect x='8' y='23' width='8' height='2'/>" +    // foot step 1
    "<rect x='5' y='25' width='14' height='2'/>" +   // foot step 2
    "<rect x='3' y='27' width='18' height='3'/>";    // foot base

  // Liquid per signal level (1 = dregs … 5 = overflowing down the sides).
  const LIQUID = {
    1: "<rect x='7' y='13.8' width='10' height='1.2'/>",
    2: "<rect x='7' y='12' width='10' height='3'/>",
    3: "<rect x='7' y='12' width='10' height='3'/>" +
       "<rect x='5' y='9.5' width='14' height='2.5'/>",
    4: "<rect x='7' y='12' width='10' height='3'/>" +
       "<rect x='5' y='6.2' width='14' height='5.8'/>",
    5: "<rect x='7' y='12' width='10' height='3'/>" +
       "<rect x='5' y='6.2' width='14' height='5.8'/>" +
       "<rect x='4' y='2.8' width='16' height='2'/>" +     // spill over the rim
       "<rect x='7' y='1.5' width='10' height='1.5'/>" +   // crest
       "<rect x='1.8' y='5' width='1.4' height='23.5'/>" + // stream, left, down to the pool
       "<rect x='20.8' y='5' width='1.4' height='23.5'/>"  // stream, right, down to the pool
  };

  // Level-5 only: blood pooling across the niche floor — painted AFTER the
  // grail so it covers the foot and reads as flooding the notch.
  const OVERFLOW_POOL =
    "<rect x='0.5' y='28.2' width='23' height='1.8'/>" +  // pool filling the niche floor
    "<rect x='6' y='27.4' width='5' height='0.8'/>" +     // splashes creeping up the foot
    "<rect x='14' y='27.4' width='4' height='0.8'/>";

  function grailBackgroundImage(level, accent) {
    const a = encodeURIComponent(accent || '#fcee0a');
    const blood = '%23a10f1e';
    const svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 30'>"
      + "<g fill='" + blood + "'>" + (LIQUID[level] || LIQUID[1]) + "</g>"
      + "<g fill='" + a + "'>" + GRAIL_ART + "</g>"
      + (level >= 5 ? "<g fill='" + blood + "'>" + OVERFLOW_POOL + "</g>" : "")
      + "</svg>";
    return "url(\"data:image/svg+xml;utf8," + svg + "\")";
  }

  let lastAccent = null;
  let lastVCount = -1;
  let lastHCount = -1;

  // Publish the static frame layers (corners, medallions, top/bottom fills).
  function setFrameVars(accent) {
    if (accent === lastAccent) return;
    lastAccent = accent;
    lastVCount = -1; // half-runs bake the color in — force both rebuilds
    lastHCount = -1;
    const root = document.documentElement.style;
    Object.keys(ART).forEach((k) => {
      root.setProperty('--az-' + k, svgUrl(ART[k].art, ART[k].w, ART[k].h, accent));
    });
  }

  // Publish the vertical half-runs for k tiles per half (+ their length).
  function setVRuns(k) {
    if (k === lastVCount) return;
    lastVCount = k;
    const root = document.documentElement.style;
    root.setProperty('--az-runv', (k * TILE) + 'px');
    Object.keys(V_FILL).forEach((key) => {
      root.setProperty('--az-' + key, k > 0 ? stackUrlV(V_FILL[key], k, lastAccent) : 'none');
    });
  }

  // Publish the horizontal half-runs for n tiles per half (+ their length).
  function setHRuns(n) {
    if (n === lastHCount) return;
    lastHCount = n;
    const root = document.documentElement.style;
    root.setProperty('--az-runh', (n * TILE) + 'px');
    Object.keys(H_FILL).forEach((key) => {
      root.setProperty('--az-' + key, n > 0 ? stackUrlH(H_FILL[key], n, lastAccent) : 'none');
    });
  }

  // Snap stage width/height so each edge run is an odd number of tiles:
  // side = BASE + n*PAIR (117 + n*66).
  //
  // Runs TWO passes: the height snap can grow the page enough that the
  // window scrollbar appears, which shrinks the column AFTER the width was
  // measured — the fixed-width capture would then overflow and get its
  // right edge clipped by the page's overflow-x:hidden. The second pass
  // re-measures with the scrollbar in place and settles on the final size.
  function snapStage() {
    const cap = document.getElementById('stageCapture');
    const stage = document.getElementById('stage');
    if (!cap || !stage || !cap.parentElement) return;
    const root = document.documentElement.style;
    let n = -1;
    let m = -1;
    for (let pass = 0; pass < 2; pass++) {
      // Width: largest valid width that fits the column (small slack so a
      // flush fit / sub-pixel shave can't clip the frame's outer border).
      const avail = cap.parentElement.clientWidth - 4;
      n = Math.max(0, Math.floor((avail - BASE) / PAIR));
      root.setProperty('--az-w', (BASE + n * PAIR) + 'px');
      // Height: measure natural content height at that width, then snap UP.
      // (offsetHeight forces a reflow, so pass 2 sees the new scrollbar.)
      root.setProperty('--az-h', 'auto');
      const h = stage.offsetHeight;
      m = Math.max(0, Math.ceil((h - BASE) / PAIR));
      root.setProperty('--az-h', (BASE + m * PAIR) + 'px');
    }
    // Half-runs: n fill tiles left/right of the top & bottom medallions,
    // m fill tiles above/below the side medallions.
    setHRuns(n);
    setVRuns(m);
  }

  THEMES.aztec = {
    label: 'AZTEC',
    // Stage stays a plain rectangle (the tile frame is the outer frame).
    // Dialog: double-stepped corners (stepped-pyramid silhouette echoing the
    // tiles' stepped fret) + rectangular "temple doorway" niches centered on
    // the top and bottom edges.
    shapes: {
      stage: 'none',
      dialog: 'tl-2-clip-x tr-2-clip-x br-2-clip-x bl-2-clip-x t-rect b-rect border'
    },
    renderStage(state) {
      if (THEMES.neon && typeof THEMES.neon.renderStage === 'function') {
        THEMES.neon.renderStage(state);
      }
      setFrameVars(state.accent || '#fcee0a');
      // Signal grail (same pattern as gothic's graveyard): blood level
      // follows the number of lit bars.
      const signalBars = document.getElementById('signalBars');
      if (signalBars) {
        const lit = signalBars.querySelectorAll('.bar.on').length;
        const level = Math.max(1, Math.min(5, lit));
        signalBars.style.backgroundImage = grailBackgroundImage(level, state.accent || '#fcee0a');
      }
      requestAnimationFrame(snapStage);
    }
  };

  // Re-snap on window resize while aztec is the active theme.
  window.addEventListener('resize', () => {
    if (document.documentElement.dataset.theme === 'aztec') snapStage();
  });
})();
