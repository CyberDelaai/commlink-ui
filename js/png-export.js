// COMMLINK PNG export: html-to-image based, with glitch-filter cloning into
// the captured tree so the displacement-map reference resolves; captures
// .stage-wrap to include floating signal-bars, then crops off .stage-meta;
// pads result with a 15px black border. Loaded AFTER the inline script.

exportBtn.addEventListener('click', async () => {
  exportBtn.disabled = true;
  const prevText = exportBtn.textContent;
  exportBtn.textContent = 'RENDERING...';
  let clonedFilterSvg = null;
  try {
    // Glitch and chromatic effects use `filter: url(#...)` referencing SVG
    // filters defined at the body level. html-to-image captures only the
    // stage subtree, so we clone the filter SVG into the stage so the
    // url(#...) refs resolve inside the snapshot.
    const filterSvg = document.getElementById('glitch-slices')?.closest('svg');
    if (filterSvg && (stage.classList.contains('glitch') || stage.classList.contains('chromatic'))) {
      clonedFilterSvg = filterSvg.cloneNode(true);
      clonedFilterSvg.style.position = 'absolute';
      clonedFilterSvg.style.width = '0';
      clonedFilterSvg.style.height = '0';
      clonedFilterSvg.style.pointerEvents = 'none';
      stage.insertBefore(clonedFilterSvg, stage.firstChild);
    }

    // Make sure web fonts are loaded; otherwise SVG falls back to
    // wider system fonts and text wraps differently than on screen.
    if (document.fonts) {
      await Promise.all([
        document.fonts.load('11px "JetBrains Mono"'),
        document.fonts.load('13px "JetBrains Mono"'),
        document.fonts.load('15px "Tektur"'),
        document.fonts.load('500 17px "Tektur"'),
        document.fonts.load('700 17px "Tektur"'),
        // Theme fonts — embedded base64 so they're available offline. Force
        // load so PNG export picks them up even if the user has never
        // activated the gothic theme this session.
        document.fonts.load('17px "Oswald"'),
        document.fonts.load('17px "Cousine"'),
        document.fonts.load('17px "Cousine"', 'Я'), // Cyrillic face
        document.fonts.ready
      ]);
    }
    // Two frames so any reflow settles before we snapshot
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

    // Capture .stage-wrap (so the signal-bars sibling is included), then
    // crop off the .stage-meta header band above the stage itself.
    const stageWrap = stage.parentNode;
    const wrapRect = stageWrap.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    const PIXEL_RATIO = 2;
    const PAD_CSS = 15;
    const innerDataUrl = await htmlToImage.toPng(stageWrap, {
      width: wrapRect.width,
      height: wrapRect.height,
      pixelRatio: PIXEL_RATIO,
      backgroundColor: '#000',
      // Zero the cloned root's margin: html-to-image inlines USED margins,
      // so a `margin: 0 auto`-centered capture (NEO_AZTEC's snapped width)
      // would render shifted right and lose its right edge in the canvas.
      style: { margin: '0' },
      // cacheBust appends ?t=… to image URLs, which corrupts blob: URLs
      // used by IDB-stored body images. Disabled.
      cacheBust: false,
      skipFonts: false
    });

    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = innerDataUrl; });

    // Crop out everything above the stage's top edge (stage-meta + gap).
    const cropTopPx = Math.max(0, (stageRect.top - wrapRect.top) * PIXEL_RATIO);
    const cropped = document.createElement('canvas');
    cropped.width = img.width;
    cropped.height = Math.max(1, img.height - cropTopPx);
    const cctx = cropped.getContext('2d');
    cctx.drawImage(img, 0, -cropTopPx);

    // Pad with a black border around the result
    const padPx = PAD_CSS * PIXEL_RATIO;
    const padded = document.createElement('canvas');
    padded.width = cropped.width + padPx * 2;
    padded.height = cropped.height + padPx * 2;
    const ctx = padded.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, padded.width, padded.height);
    ctx.drawImage(cropped, padPx, padPx);
    const dataUrl = padded.toDataURL('image/png');

    const link = document.createElement('a');
    link.download = `commlink_dialog_${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    showToast(t('toast.pngExported'));
  } catch (err) {
    console.error(err);
    showToast(t('toast.exportFailed'));
  } finally {
    if (clonedFilterSvg) clonedFilterSvg.remove();
    exportBtn.disabled = false;
    exportBtn.textContent = prevText;
  }
});
