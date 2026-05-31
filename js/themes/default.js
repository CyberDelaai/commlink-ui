// DEFAULT theme — paints the cyberpunk dialog inside .stage.
//
// Scope: everything inside `#stage` that is **theme-owned** — channel
// labels, dialog frame, message bubbles, choice list, signal bars, accent
// CSS vars, slim toggle. Universal concerns (FX overlays, background image,
// brightness, FX param updates) stay in `renderPreview` and apply over any
// theme's stage output.
//
// Other themes mirror this shape: register a `renderStage(state)` on their
// THEMES entry and operate on the same stage element.

(function registerDefaultTheme() {
  if (typeof THEMES === 'undefined' || !THEMES.default) return;

  // Augmented-ui shapes per element — mirrors the values authored directly
  // in index.html so switching FROM another theme BACK to default restores
  // the original cyberpunk clipped silhouette.
  THEMES.default.shapes = {
    stage: 'tl-clip tr-clip-x br-clip bl-clip-x border',
    dialog: 'tl-clip tr-clip-x br-clip bl-clip-x t-clip-x b-clip-x border'
  };

  THEMES.default.renderStage = function renderDefaultStage(state) {
    pMeta.textContent = state.meta || '';
    pMetaRight.textContent = state.metaRight || '';

    pMessages.innerHTML = '';
    const contactsCache = loadContacts();
    state.messages.forEach((m) => {
      if (m.type === 'system') {
        if (!m.body.trim()) return;
        const sysEl = document.createElement('div');
        sysEl.className = 'message system';
        sysEl.innerHTML = '<hr class="sys-rule"/><p class="body"></p><hr class="sys-rule"/>';
        sysEl.querySelector('.body').innerHTML = renderBodyHtml(m.body);
        pMessages.appendChild(sysEl);
        return;
      }
      const resolved = resolveSpeaker(m, contactsCache);
      if (!resolved.name.trim() && !m.body.trim() && !resolved.avatar && !(m.time && m.time.trim()) && !m.bodyImage) return;
      const el = document.createElement('div');
      const side = m.side === 'right' ? 'right' : 'left';
      el.className = 'message ' + side + (resolved.avatar ? ' has-portrait' : '');
      el.innerHTML = (resolved.avatar ? '<div class="portrait"></div>' : '') +
        '<div class="content"><div class="meta-line"><span class="name"></span><span class="time"></span></div><p class="body"></p></div>';
      if (resolved.avatar) {
        el.querySelector('.portrait').style.backgroundImage = `url("${resolved.avatar}")`;
      }
      el.querySelector('.name').textContent = resolved.name || '—';
      el.querySelector('.time').textContent = (m.time || '').trim();
      const bodyEl = el.querySelector('.body');
      bodyEl.innerHTML = renderBodyHtml(m.body || '');
      // When FRAMES is on AND the default theme is active, paint each body
      // with an augmented-ui clip silhouette (one chip per side, mirrored).
      // Other themes opt out so their own frame look wins.
      const activeTheme = (typeof previewingThemeId !== 'undefined' && previewingThemeId)
        || (typeof appliedThemeId !== 'undefined' ? appliedThemeId : 'default');
      if (state.frames && activeTheme === 'default') {
        bodyEl.setAttribute('data-augmented-ui',
          side === 'right'
            ? 'tl-clip br-clip border'
            : 'tr-clip bl-clip border');
      } else {
        bodyEl.removeAttribute('data-augmented-ui');
      }
      if (m.bodyImage) {
        const img = document.createElement('img');
        img.className = 'body-image';
        img.src = displayUrl(m.bodyImage) || m.bodyImage;
        img.alt = '';
        // Image goes INSIDE the body (the framed element) so when FRAMES is
        // on it sits within the bubble's clip silhouette. Theme-agnostic —
        // every theme's frame style targets .body, so this works everywhere.
        bodyEl.appendChild(img);
      }
      pMessages.appendChild(el);
    });

    pChoices.innerHTML = '';
    pChoices.hidden = !!state.hideChoices;
    if (!state.hideChoices) {
      state.choices.forEach((c, i) => {
        if (!c.text.trim()) return;
        const row = document.createElement('div');
        row.className = 'choice' + (c.chosen ? ' chosen' : '');
        row.innerHTML = `
          <span class="num">[${i + 1}]</span>
          <span class="arrow">&gt;</span>
          <span class="choice-text">${escapeHtml(c.text)}</span>
        `;
        pChoices.appendChild(row);
      });
    }

    const choicesColor = state.choicesColor || state.accent || '#fcee0a';
    stage.style.setProperty('--choices-color', choicesColor);
    dialog.style.setProperty('--accent', state.accent);
    stage.style.setProperty('--accent', state.accent);
    const sb = document.getElementById('signalBars');
    if (sb) sb.style.setProperty('--accent', state.accent);

    stage.classList.toggle('frames', !!state.frames);

    // Signal bars: when glitch is off, full signal; otherwise scale by slider.
    // Reads the same glitch-amount control that the universal layer uses.
    const gAmt = (typeof state.glitchAmount === 'number') ? state.glitchAmount : 38;
    const maxG = parseFloat(glitchAmountInput.max) || 80;
    const effectiveGlitch = state.glitch ? gAmt : 0;
    const litCount = Math.max(1, Math.round(5 * (1 - effectiveGlitch / maxG)));
    const signalBars = document.getElementById('signalBars');
    if (signalBars) {
      signalBars.querySelectorAll('.bar').forEach((bar, i) => {
        bar.classList.toggle('on', i < litCount);
      });
      // Align signal bars to the dialog's top-right corner (inside the notch).
      requestAnimationFrame(() => {
        const dRect = dialog.getBoundingClientRect();
        const wRect = signalBars.parentNode.getBoundingClientRect();
        signalBars.style.top = (dRect.top - wRect.top - 4) + 'px';
        signalBars.style.right = Math.max(0, wRect.right - dRect.right + 5) + 'px';
      });
    }
  };
})();
