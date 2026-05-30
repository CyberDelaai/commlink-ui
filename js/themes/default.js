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
      el.querySelector('.body').innerHTML = renderBodyHtml(m.body || '');
      if (m.bodyImage) {
        const img = document.createElement('img');
        img.className = 'body-image';
        img.src = displayUrl(m.bodyImage) || m.bodyImage;
        img.alt = '';
        el.querySelector('.content').appendChild(img);
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

    stage.classList.toggle('slim', !!state.slim);

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
