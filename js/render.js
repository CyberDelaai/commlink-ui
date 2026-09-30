// COMMLINK render layer: editor row + choice row + preview rendering, plus
// syncForm and stage dimensions readout. Loaded BEFORE the main inline
// script in the page so its function declarations are global at the time
// inline init calls them; function bodies look up state/DOM refs lazily.

// Default text/frame color of console messages (m.type === 'console');
// per-message override lives in m.consoleColor.
const CONSOLE_DEFAULT_COLOR = '#39ff88';
// Quick-pick presets shown left of the console color picker:
// phosphor green, amber CRT, alert red.
const CONSOLE_PRESET_COLORS = ['#39ff88', '#ffb000', '#ff3b5c'];

// Curated kaomoji set surfaced via the 顔 toolbar button on each message row.
// Inserted at the textarea cursor; popup closes on insert.
//
// Rendering: kaomoji substrings in message bodies are matched via
// KAOMOJI_REGEX and wrapped in <span class="kao"> so the CSS rule on .kao
// pins their font-family directly on the span — defeating the JetBrains
// Mono inheritance applied to .message.system .body.
const KAOMOJI = [
  '(´ ▽ `)', '(◕‿◕)', '(✿◠‿◠)', '(◜‿◝)', '(｡◕‿◕｡)',
  'ʕ•ᴥ•ʔ', '(≧◡≦)', '\\(^o^)/', '(⌒▽⌒)', '(*˘︶˘*)',
  '(╥﹏╥)', 'ಥ_ಥ', '(T_T)', '(´;ω;`)', '(；д；)',
  '(っ◞‸◟c)', 'ಠ_ಠ', '(╯°□°）╯︵ ┻━┻', '(¬_¬)', '(#`Д´)',
  'щ(゜ロ゜щ)', '(⌐■_■)', '($_$)', '( ͡° ͜ʖ ͡°)', '¬‿¬', '( ͡~ ͜ʖ ͡°)',
  '(⊙_⊙)', '(◎_◎;)', 'Σ(°△°|||)', '(°o°;)', '(⊙﹏⊙)',
  '¯\\_(ツ)_/¯', '┐(´∀｀)┌', '(シ_ _)シ', '┐(￣ヘ￣;)┌', '(♥ω♥*)',
  '(✿ ♡‿♡)', '(♡°▽°♡)', '(˃͈ દ ˂͈)', '(-_-) zzz', '(∪｡∪) zzz',
  '(╬ಠ益ಠ)', '◔̯◔', '(ó﹏ò｡)', '(ノ°益°)ノ', '(づ｡◕‿‿◕｡)づ',
  '✺◟( • ω • )◞✺'
];
// Longest-first so overlapping prefixes match the longest kaomoji.
const KAOMOJI_REGEX = new RegExp(
  [...KAOMOJI]
    .sort((a, b) => b.length - a.length)
    .map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|'),
  'g'
);
// Render a message body as HTML, wrapping any KAOMOJI substring in
// <span class="kao"> so the font-family override applies to it.
function renderBodyHtml(body) {
  body = String(body || '');
  let out = '';
  let last = 0;
  KAOMOJI_REGEX.lastIndex = 0;
  let m;
  while ((m = KAOMOJI_REGEX.exec(body)) !== null) {
    if (m.index > last) out += escapeHtml(body.slice(last, m.index));
    out += '<span class="kao">' + escapeHtml(m[0]) + '</span>';
    last = KAOMOJI_REGEX.lastIndex;
  }
  if (last < body.length) out += escapeHtml(body.slice(last));
  return out;
}

// ---------- Render ----------
function renderMessagesEditor() {
  // Remove any image popups that were portaled to <body>
  document.querySelectorAll('body > .img-popup').forEach(p => p.remove());
  messagesWrap.innerHTML = '';
  const initialContactIds = new Set(loadContacts().map(c => c.id));
  // Toggle the .no-contact class for a normal-type row based on whether
  // its message has a resolvable contact link. Pass a precomputed Set for
  // bulk paths; handlers omit it and we re-read the contacts list.
  function refreshNoContact(row, m, knownIds) {
    if (!row || !m || m.type === 'system' || m.type === 'console') return;
    const ids = knownIds || new Set(loadContacts().map(c => c.id));
    const linked = !!(m.contactId && ids.has(m.contactId));
    row.classList.toggle('no-contact', !linked);
    // While linked, speaker + avatar are locked. Save-as-contact is hidden
    // (the message is already linked, nothing to save).
    row.classList.toggle('linked', linked);
    const sp = row.querySelector('.speaker-input');
    if (sp) sp.disabled = linked;
  }
  state.messages.forEach((m, i) => {
    const row = document.createElement('div');
    row.className = 'msg-row';

    // ----- System / console message editor: simplified row -----
    // Console rows share the system row's layout (no speaker/avatar) and its
    // .system class; .console adds the green card + color picker.
    if (m.type === 'system' || m.type === 'console') {
      const isConsole = m.type === 'console';
      row.classList.add('system');
      row.classList.toggle('console', isConsole);
      row.innerHTML = `
        <div class="msg-row-left">
          <span class="msg-pip"></span>
          <span class="idx"><span class="idx-text">${isConsole ? 'CON' : 'SYS'} ${String(i + 1).padStart(2, '0')}</span></span>
          <span class="vspace"></span>
          <button class="btn ghost reorder-btn" type="button" data-up aria-label="move up" ${i === 0 ? 'disabled' : ''}>↑</button>
          <button class="btn ghost reorder-btn" type="button" data-down aria-label="move down" ${i === state.messages.length - 1 ? 'disabled' : ''}>↓</button>
        </div>
        <div class="msg-row-divider"></div>
        <div class="msg-row-right">
          <div class="msg-row-head">
            <span class="sys-label">${isConsole ? '// CONSOLE' : '// SYSTEM MESSAGE'}</span>
            <span class="toolbar-spacer"></span>
            ${isConsole ? CONSOLE_PRESET_COLORS.map(c => `<button class="swatch console-preset${(m.consoleColor || CONSOLE_DEFAULT_COLOR).toLowerCase() === c ? ' active' : ''}" type="button" data-console-preset="${c}" style="background:${c}; color:${c}" aria-label="console color ${c}" title="${c}"></button>`).join('') : ''}
            ${isConsole ? `<label class="swatch-pick-btn console-color-pick" title="Console color" data-augmented-ui="tl-clip br-clip border" style="color:${m.consoleColor || CONSOLE_DEFAULT_COLOR}">
              <input type="color" data-console-color value="${m.consoleColor || CONSOLE_DEFAULT_COLOR}" />
              <svg class="pick-icon" viewBox="0 -960 960 960" fill="currentColor" aria-hidden="true"><path d="M480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 32.5-156t88-127Q256-817 330-848.5T488-880q80 0 151 27.5t124.5 76q53.5 48.5 85 115T880-518q0 115-70 176.5T640-280h-74q-9 0-12.5 5t-3.5 11q0 12 15 34.5t15 51.5q0 50-27.5 74T480-80Zm0-400Zm-177 23q17-17 17-43t-17-43q-17-17-43-17t-43 17q-17 17-17 43t17 43q17 17 43 17t43-17Zm120-160q17-17 17-43t-17-43q-17-17-43-17t-43 17q-17 17-17 43t17 43q17 17 43 17t43-17Zm200 0q17-17 17-43t-17-43q-17-17-43-17t-43 17q-17 17-17 43t17 43q17 17 43 17t43-17Zm120 160q17-17 17-43t-17-43q-17-17-43-17t-43 17q-17 17-17 43t17 43q17 17 43 17t43-17ZM480-160q9 0 14.5-5t5.5-13q0-14-15-33t-15-57q0-42 29-67t71-25h70q66 0 113-38.5T800-518q0-121-92.5-201.5T488-800q-136 0-232 93t-96 227q0 133 93.5 226.5T480-160Z"/></svg>
            </label>` : ''}
            <button class="btn cyan icon" type="button" data-clone aria-label="clone" title="Clone">
              <svg class="mi" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
            </button>
            <button class="btn danger icon" type="button" aria-label="remove" data-remove>✕</button>
          </div>
          <textarea class="body-input" maxlength="${isConsole ? 1000 : 200}" placeholder="${isConsole ? '$ run --code...' : 'System message...'}" spellcheck="${!isConsole}"></textarea>
        </div>
      `;
      const sbd = row.querySelector('.body-input');
      const ccIn = row.querySelector('[data-console-color]');
      if (ccIn) {
        // Updates in place, no editor re-render: the picker's 'input' fires
        // while dragging, and a re-render would close the native picker.
        const setConsoleColor = (c) => {
          state.messages[i].consoleColor = c;
          ccIn.value = c;
          ccIn.parentElement.style.color = c;
          row.querySelectorAll('[data-console-preset]').forEach(b =>
            b.classList.toggle('active', b.dataset.consolePreset === c.toLowerCase()));
          renderPreview();
          saveState();
        };
        ccIn.addEventListener('input', () => setConsoleColor(ccIn.value));
        row.querySelectorAll('[data-console-preset]').forEach(b =>
          b.addEventListener('click', () => setConsoleColor(b.dataset.consolePreset)));
      }
      sbd.value = m.body;
      sbd.addEventListener('input', () => {
        state.messages[i].body = sbd.value;
        autoGrow(sbd);
        renderPreview();
        saveState();
      });
      row.querySelector('[data-up]').addEventListener('click', () => {
        if (i === 0) return;
        const [mm] = state.messages.splice(i, 1);
        state.messages.splice(i - 1, 0, mm);
        renderMessagesEditor();
        renderPreview();
        saveState();
      });
      row.querySelector('[data-down]').addEventListener('click', () => {
        if (i === state.messages.length - 1) return;
        const [mm] = state.messages.splice(i, 1);
        state.messages.splice(i + 1, 0, mm);
        renderMessagesEditor();
        renderPreview();
        saveState();
      });
      row.querySelector('[data-clone]').addEventListener('click', () => {
        if (state.messages.length >= 99) { showToast(t('toast.maxMessages')); return; }
        const copy = { ...state.messages[i] };
        state.messages.splice(i + 1, 0, copy);
        renderMessagesEditor();
        renderPreview();
        saveState();
      });
      row.querySelector('[data-remove]').addEventListener('click', () => {
        state.messages.splice(i, 1);
        renderMessagesEditor();
        renderPreview();
        saveState();
      });
      messagesWrap.appendChild(row);
      augmentButtons(row);
      requestAnimationFrame(() => autoGrow(sbd));
      return;
    }

    row.innerHTML = `
      <div class="msg-row-left">
        <span class="msg-pip"></span>
        <span class="idx"><span class="idx-text">MSG ${String(i + 1).padStart(2, '0')}</span></span>
        <span class="vspace"></span>
        <button class="btn ghost reorder-btn" type="button" data-up aria-label="move up" ${i === 0 ? 'disabled' : ''}>↑</button>
        <button class="btn ghost reorder-btn" type="button" data-down aria-label="move down" ${i === state.messages.length - 1 ? 'disabled' : ''}>↓</button>
      </div>
      <div class="msg-row-divider"></div>
      <div class="msg-row-right">
        <div class="msg-row-head">
          <div class="img-popup-wrap portrait-wrap">
            <div class="portrait-preview" data-portrait data-portrait-toggle title="Portrait options"></div>
            <input type="file" accept="image/*" class="portrait-file" id="portrait-file-${i}" />
            <div class="img-popup portrait-popup" hidden>
              <label class="btn cyan icon" for="portrait-file-${i}" title="Upload portrait">UPLOAD</label>
              <button class="btn cyan icon" type="button" data-paste-portrait title="Paste from clipboard">PASTE</button>
              <button class="btn danger icon" type="button" data-clear-portrait title="Clear portrait">CLEAR</button>
            </div>
          </div>
          <input type="text" class="speaker-input" maxlength="40" placeholder="Speaker" />
          <input type="text" class="time-input" maxlength="20" placeholder="time" />
          <button class="btn cyan icon" type="button" data-save-contact aria-label="save as contact" title="Save as contact">
            <svg class="mi" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>
          </button>
          <button class="btn danger icon" type="button" aria-label="remove" data-remove>✕</button>
        </div>
        <textarea class="body-input" maxlength="500" placeholder="Message text..."></textarea>
        <div class="msg-row-toolbar">
          <div class="img-popup-wrap kao-popup-wrap">
            <button class="btn cyan icon" type="button" data-kao-toggle title="Insert kaomoji">ツ</button>
            <div class="img-popup kao-popup" hidden>
              <div class="kao-grid"></div>
            </div>
          </div>
          <button class="btn cyan icon" type="button" data-insert-symbol="¥" title="Insert yen">¥</button>
          <button class="btn cyan icon" type="button" data-insert-symbol="€" title="Insert euro">€</button>
          <button class="btn cyan icon" type="button" data-insert-symbol="§" title="Insert eurodollar">§</button>
          <div class="img-popup-wrap">
            <button class="btn cyan icon img-toggle${m.bodyImage ? ' has-image' : ''}" type="button" data-img-toggle title="Image options">+ IMG</button>
            <div class="img-popup" hidden>
              <div class="body-img-preview" data-body-img></div>
              <input type="file" accept="image/*" class="body-img-file" id="body-img-${i}" />
              <label class="btn cyan icon body-img-upload" for="body-img-${i}" title="Upload image">UPLOAD</label>
              <button class="btn cyan icon" type="button" data-body-img-paste title="Paste image">PASTE</button>
              <button class="btn cyan icon" type="button" data-body-img-recrop title="Recrop current image">RECROP</button>
              <button class="btn danger icon" type="button" data-body-img-clear title="Remove image">CLEAR</button>
            </div>
          </div>
          <span class="toolbar-spacer"></span>
          <button class="btn cyan icon" type="button" data-clone aria-label="clone" title="Clone message">
            <svg class="mi" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
          </button>
          <button class="side-switch" type="button" data-side data-pos="${m.side === 'right' ? 'right' : 'left'}" aria-label="toggle side">
            <span class="thumb"></span>
            <span class="lab l">&lt;</span>
            <span class="lab r">&gt;</span>
          </button>
        </div>
      </div>
    `;
    const sp = row.querySelector('.speaker-input');
    const tm = row.querySelector('.time-input');
    const bd = row.querySelector('.body-input');
    const portraitEl = row.querySelector('[data-portrait]');
    const portraitInput = row.querySelector('.portrait-file');
    const resolved = resolveSpeaker(m);
    sp.value = resolved.name;
    tm.value = m.time || '';
    bd.value = m.body;
    // Lock the row's editable controls if it's linked to an existing contact.
    refreshNoContact(row, m, initialContactIds);
    if (resolved.avatar) {
      portraitEl.style.backgroundImage = `url("${resolved.avatar}")`;
      portraitEl.classList.add('has-image');
    }
    sp.addEventListener('input', () => {
      const cur = state.messages[i];
      // Was linked: inline the contact's avatar so the message keeps its
      // portrait when we clear the link.
      if (cur.contactId) {
        const c = loadContacts().find(x => x.id === cur.contactId);
        if (c) cur.portrait = c.avatar || '';
      }
      cur.speaker = sp.value;
      cur.contactId = '';
      cur.chainId = '';
      refreshNoContact(row, cur);
      renderPreview();
      saveState();
    });
    tm.addEventListener('input', () => { state.messages[i].time = tm.value; renderPreview(); saveState(); });
    bd.addEventListener('input', () => {
      state.messages[i].body = bd.value;
      autoGrow(bd);
      renderPreview();
      saveState();
    });
    // Drag-and-drop an image onto the message text field → attach it via the
    // same crop flow as +IMG → UPLOAD. Text drops fall through to the
    // textarea's default behavior (we only intercept when `Files` is in the
    // dataTransfer types list).
    bd.addEventListener('dragover', (e) => {
      if (!e.dataTransfer || !Array.from(e.dataTransfer.types || []).includes('Files')) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      bd.classList.add('dnd-target');
    });
    bd.addEventListener('dragleave', () => {
      bd.classList.remove('dnd-target');
    });
    bd.addEventListener('drop', (e) => {
      if (!e.dataTransfer || !e.dataTransfer.files || !e.dataTransfer.files.length) return;
      bd.classList.remove('dnd-target');
      e.preventDefault();
      e.stopPropagation();
      const f = e.dataTransfer.files[0];
      if (!f.type || f.type.indexOf('image/') !== 0) { showToast(t('toast.noImg')); return; }
      const r = new FileReader();
      r.onload = (ev) => openBodyImageCrop(ev.target.result);
      r.readAsDataURL(f);
    });

    // Shared cursor-insert used by kaomoji popup AND the currency-symbol
    // buttons below — substitutes selection with `insert`, then re-renders.
    const insertAtCursor = (insert) => {
      const start = bd.selectionStart;
      const end = bd.selectionEnd;
      bd.value = bd.value.substring(0, start) + insert + bd.value.substring(end);
      bd.selectionStart = bd.selectionEnd = start + insert.length;
      bd.focus();
      state.messages[i].body = bd.value;
      autoGrow(bd);
      renderPreview();
      saveState();
    };

    // Kaomoji popup — populate grid once per row, insert at cursor on click.
    const kaoToggle = row.querySelector('[data-kao-toggle]');
    const kaoPopup = row.querySelector('.kao-popup');
    const kaoGrid = row.querySelector('.kao-grid');
    KAOMOJI.forEach(k => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn cyan icon kao-cell';
      b.textContent = k;
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        insertAtCursor(k);
        kaoPopup.hidden = true;
      });
      kaoGrid.appendChild(b);
    });

    // Currency symbol buttons (¥/€/§) — same cursor-insert behaviour.
    row.querySelectorAll('[data-insert-symbol]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        insertAtCursor(btn.getAttribute('data-insert-symbol'));
      });
    });
    const positionKaoPopup = () => {
      const r = kaoToggle.getBoundingClientRect();
      const popupH = kaoPopup.offsetHeight || 280;
      const popupW = kaoPopup.offsetWidth || 280;
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      let top = r.bottom + 6;
      if (top + popupH > vh - 8) top = Math.max(8, r.top - popupH - 6);
      let left = r.left;
      if (left + popupW > vw - 8) left = Math.max(8, vw - popupW - 8);
      kaoPopup.style.left = left + 'px';
      kaoPopup.style.top = top + 'px';
    };
    kaoToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const opening = kaoPopup.hidden;
      document.querySelectorAll('.img-popup').forEach(p => { p.hidden = true; });
      if (opening) {
        if (kaoPopup.parentNode !== document.body) document.body.appendChild(kaoPopup);
        kaoPopup.hidden = false;
        positionKaoPopup();
      }
    });
    kaoPopup.addEventListener('click', (e) => e.stopPropagation());

    const portraitPopup = row.querySelector('.portrait-popup');
    const applyPortrait = (dataUrl) => {
      const cur = state.messages[i];
      // Was linked: inline the contact's name so the message keeps its
      // speaker when we clear the link.
      if (cur.contactId) {
        const c = loadContacts().find(x => x.id === cur.contactId);
        if (c) cur.speaker = c.name || '';
      }
      cur.portrait = dataUrl;
      cur.contactId = '';
      cur.chainId = '';
      portraitEl.style.backgroundImage = `url("${dataUrl}")`;
      portraitEl.classList.add('has-image');
      sp.value = cur.speaker;
      refreshNoContact(row, cur);
      renderPreview();
      saveState();
      showToast(t('toast.portraitLoaded'));
    };
    const openPortraitCrop = (dataUrl) => {
      openCrop(dataUrl, applyPortrait, AVATAR_CROP_OPTS);
    };
    portraitInput.addEventListener('change', (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = (ev) => openPortraitCrop(ev.target.result);
      reader.readAsDataURL(f);
      portraitInput.value = '';
    });
    row.querySelector('[data-paste-portrait]').addEventListener('click', () => {
      tryPasteImage(openPortraitCrop);
    });
    row.querySelector('[data-clear-portrait]').addEventListener('click', () => {
      const cur = state.messages[i];
      // Was linked: inline the contact's name so the speaker is preserved.
      if (cur.contactId) {
        const c = loadContacts().find(x => x.id === cur.contactId);
        if (c) cur.speaker = c.name || '';
      }
      cur.portrait = '';
      cur.portraitOriginal = '';
      cur.contactId = '';
      cur.chainId = '';
      portraitEl.style.backgroundImage = '';
      portraitEl.classList.remove('has-image');
      portraitInput.value = '';
      portraitPopup.hidden = true;
      sp.value = cur.speaker;
      refreshNoContact(row, cur);
      renderPreview();
      saveState();
    });
    // Portrait popup toggle
    const positionPortraitPopup = () => {
      const r = portraitEl.getBoundingClientRect();
      const popupW = portraitPopup.offsetWidth || 160;
      const popupH = portraitPopup.offsetHeight || 140;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const margin = 8;
      let left = r.right + 8;
      if (left + popupW > vw - margin) left = Math.max(margin, r.left - popupW - 8);
      let top = r.top;
      if (top + popupH > vh - margin) top = Math.max(margin, vh - popupH - margin);
      portraitPopup.style.left = left + 'px';
      portraitPopup.style.top = top + 'px';
    };
    portraitEl.style.cursor = 'pointer';
    portraitEl.addEventListener('click', (e) => {
      e.stopPropagation();
      // Locked while linked to a contact — speaker + avatar are read-only.
      if (state.messages[i].contactId) return;
      if (!state.messages[i].portrait) {
        portraitInput.click();
        return;
      }
      const opening = portraitPopup.hidden;
      document.querySelectorAll('.img-popup').forEach(p => { p.hidden = true; });
      if (opening) {
        if (portraitPopup.parentNode !== document.body) document.body.appendChild(portraitPopup);
        portraitPopup.hidden = false;
        positionPortraitPopup();
      }
    });
    portraitPopup.addEventListener('click', (e) => e.stopPropagation());
    // Drag-and-drop an image onto the portrait → same crop-then-apply flow
    // as UPLOAD/PASTE. Locked for rows linked to a saved contact (the
    // contact's avatar is the source of truth there).
    portraitEl.addEventListener('dragover', (e) => {
      if (state.messages[i].contactId) return;
      if (!e.dataTransfer || !Array.from(e.dataTransfer.types || []).includes('Files')) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      portraitEl.classList.add('dnd-target');
    });
    portraitEl.addEventListener('dragleave', () => {
      portraitEl.classList.remove('dnd-target');
    });
    portraitEl.addEventListener('drop', (e) => {
      portraitEl.classList.remove('dnd-target');
      if (state.messages[i].contactId) return;
      if (!e.dataTransfer || !e.dataTransfer.files || !e.dataTransfer.files.length) return;
      e.preventDefault();
      e.stopPropagation();
      const f = e.dataTransfer.files[0];
      if (!f.type || f.type.indexOf('image/') !== 0) { showToast(t('toast.noImg')); return; }
      const r = new FileReader();
      r.onload = (ev) => openPortraitCrop(ev.target.result);
      r.readAsDataURL(f);
    });

    // Body image controls (popup)
    const bodyImgPreview = row.querySelector('[data-body-img]');
    const bodyImgInput = row.querySelector('.body-img-file');
    const imgToggle = row.querySelector('[data-img-toggle]');
    const imgPopup = row.querySelector('.img-popup:not(.portrait-popup):not(.kao-popup)');
    if (m.bodyImage) {
      const u = displayUrl(m.bodyImage);
      bodyImgPreview.style.backgroundImage = `url("${u}")`;
      bodyImgPreview.classList.add('has-image');
      imgToggle.style.backgroundImage = `url("${u}")`;
    }
    const syncImgToggle = (dataUrl) => {
      if (dataUrl) {
        imgToggle.classList.add('has-image');
        imgToggle.style.backgroundImage = `url("${dataUrl}")`;
      } else {
        imgToggle.classList.remove('has-image');
        imgToggle.style.backgroundImage = '';
      }
    };
    const applyBodyImage = async (dataUrl) => {
      const ref = await storeImageDataUrl(dataUrl);
      state.messages[i].bodyImage = ref;
      const u = displayUrl(ref) || dataUrl;
      bodyImgPreview.style.backgroundImage = `url("${u}")`;
      bodyImgPreview.classList.add('has-image');
      syncImgToggle(u);
      renderPreview();
      saveState();
      showToast(t('toast.imgAttached'));
    };
    // Toggle popup open/close — portal to <body> so it escapes the panel's clip-path.
    // If the popup would spill past the bottom of the viewport (which happens on
    // the last message of a long list), flip it above the button instead.
    const positionPopup = () => {
      const r = imgToggle.getBoundingClientRect();
      const popupH = imgPopup.offsetHeight || 240;
      const vh = window.innerHeight;
      const margin = 8;
      let top = r.bottom + 6;
      if (top + popupH > vh - margin) {
        top = Math.max(margin, r.top - popupH - 6);
      }
      imgPopup.style.left = r.left + 'px';
      imgPopup.style.top = top + 'px';
    };
    imgToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      // No image yet → go straight to file picker
      if (!state.messages[i].bodyImage) {
        bodyImgInput.click();
        return;
      }
      const opening = imgPopup.hidden;
      document.querySelectorAll('.img-popup').forEach(p => { p.hidden = true; });
      if (opening) {
        if (imgPopup.parentNode !== document.body) document.body.appendChild(imgPopup);
        imgPopup.hidden = false;
        positionPopup();
      }
    });
    imgPopup.addEventListener('click', (e) => e.stopPropagation());
    // Crop modal in free mode — width and height resize independently
    const openBodyImageCrop = async (dataUrl, isOriginal) => {
      if (!isOriginal) {
        state.messages[i].bodyImageOriginal = await storeImageDataUrl(dataUrl);
        saveState();
      }
      // Crop modal needs a usable URL. If we got a data URL, use it; if the
      // caller passed an idb: ref (recrop path), resolve to a blob URL.
      const cropSrc = (typeof dataUrl === 'string' && dataUrl.startsWith('data:'))
        ? dataUrl
        : await resolveImageRef(dataUrl);
      if (!cropSrc) { applyBodyImage(dataUrl); return; }
      const probe = new Image();
      probe.onload = () => {
        const aspect = probe.naturalWidth / Math.max(1, probe.naturalHeight);
        openCrop(cropSrc, applyBodyImage, { aspect, free: true });
      };
      probe.onerror = () => applyBodyImage(cropSrc);
      probe.src = cropSrc;
    };
    bodyImgInput.addEventListener('change', (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = (ev) => openBodyImageCrop(ev.target.result);
      reader.readAsDataURL(f);
      bodyImgInput.value = '';
    });
    row.querySelector('[data-body-img-paste]').addEventListener('click', () => {
      tryPasteImage(openBodyImageCrop);
    });
    row.querySelector('[data-body-img-recrop]').addEventListener('click', () => {
      const src = state.messages[i].bodyImageOriginal || state.messages[i].bodyImage;
      if (!src) { showToast(t('toast.noImg')); return; }
      openBodyImageCrop(src, true);
    });
    row.querySelector('[data-body-img-clear]').addEventListener('click', () => {
      state.messages[i].bodyImage = '';
      state.messages[i].bodyImageOriginal = '';
      bodyImgPreview.style.backgroundImage = '';
      bodyImgPreview.classList.remove('has-image');
      syncImgToggle('');
      imgPopup.hidden = true;
      renderPreview();
      saveState();
      gcImages().catch(() => {});
    });

    row.querySelector('[data-up]').addEventListener('click', () => {
      if (i === 0) return;
      const [m] = state.messages.splice(i, 1);
      state.messages.splice(i - 1, 0, m);
      renderMessagesEditor();
      renderPreview();
      saveState();
    });
    row.querySelector('[data-down]').addEventListener('click', () => {
      if (i === state.messages.length - 1) return;
      const [m] = state.messages.splice(i, 1);
      state.messages.splice(i + 1, 0, m);
      renderMessagesEditor();
      renderPreview();
      saveState();
    });
    row.querySelector('[data-clone]').addEventListener('click', () => {
      if (state.messages.length >= 99) { showToast(t('toast.maxMessages')); return; }
      const src = state.messages[i];
      // Cloned messages chain-link to the source. If source isn't linked to
      // a contact and hasn't been chained yet, assign a fresh chainId to it
      // so both source and clone share membership.
      if (!src.contactId && !src.chainId) src.chainId = genId();
      const copy = { ...src };
      state.messages.splice(i + 1, 0, copy);
      renderMessagesEditor();
      renderPreview();
      saveState();
    });
    row.querySelector('[data-save-contact]').addEventListener('click', () => {
      const cur = state.messages[i];
      const name = (cur.speaker || '').trim();
      if (!name) { showToast(t('toast.speakerRequired')); return; }
      const list = loadContacts();
      if (list.find(c => c.name === name && (c.avatar || '') === (cur.portrait || ''))) {
        showToast(t('toast.alreadySaved', { name }));
        return;
      }
      const newId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      list.push({ id: newId, name, avatar: cur.portrait || '' });
      if (!saveContacts(list)) {
        showToast(t('toast.storageFull'));
        return;
      }
      // Link this message AND every message in its chain to the new contact.
      // The chain is defined by a shared chainId or a shared contactId.
      const anchor = state.messages[i];
      state.messages.forEach(m => {
        if (!m || m.type === 'system' || m.type === 'console') return;
        if (inSameChain(m, anchor)) {
          m.contactId = newId;
          m.speaker = '';
          m.portrait = '';
        }
      });
      saveState();
      renderContacts();
      renderMessagesEditor();
      renderPreview();
      showToast(t('toast.contactAdded', { name }));
    });
    row.querySelector('[data-side]').addEventListener('click', () => {
      const newSide = state.messages[i].side === 'right' ? 'left' : 'right';
      state.messages[i].side = newSide;
      row.querySelector('[data-side]').setAttribute('data-pos', newSide);
      renderPreview();
      saveState();
    });
    row.querySelector('[data-remove]').addEventListener('click', () => {
      state.messages.splice(i, 1);
      renderMessagesEditor();
      renderPreview();
      saveState();
    });
    messagesWrap.appendChild(row);
  });
  augmentButtons(messagesWrap);
  messagesWrap.querySelectorAll('.body-input').forEach(autoGrow);
}

function renderChoicesEditor() {
  choicesWrap.innerHTML = '';
  state.choices.forEach((c, i) => {
    const row = document.createElement('div');
    row.className = 'row choice-edit-row' + (c.chosen ? ' chosen' : '');
    row.innerHTML = `
      <button class="choice-pip" type="button" data-pip aria-label="mark as chosen"></button>
      <span class="idx">[${i + 1}]</span>
      <input type="text" maxlength="120" value="" />
      <div class="reorder-stack">
        <button class="btn ghost reorder-btn" type="button" data-up aria-label="move up" ${i === 0 ? 'disabled' : ''}>↑</button>
        <button class="btn ghost reorder-btn" type="button" data-down aria-label="move down" ${i === state.choices.length - 1 ? 'disabled' : ''}>↓</button>
      </div>
      <button class="btn danger icon" type="button" aria-label="remove" data-remove>✕</button>
    `;
    const input = row.querySelector('input');
    input.value = c.text;
    input.addEventListener('input', () => {
      state.choices[i].text = input.value;
      renderPreview();
      saveState();
    });
    row.querySelector('[data-pip]').addEventListener('click', () => {
      state.choices[i].chosen = !state.choices[i].chosen;
      renderChoicesEditor();
      renderPreview();
      saveState();
    });
    row.querySelector('[data-up]').addEventListener('click', () => {
      if (i === 0) return;
      const [cc] = state.choices.splice(i, 1);
      state.choices.splice(i - 1, 0, cc);
      renderChoicesEditor();
      renderPreview();
      saveState();
    });
    row.querySelector('[data-down]').addEventListener('click', () => {
      if (i === state.choices.length - 1) return;
      const [cc] = state.choices.splice(i, 1);
      state.choices.splice(i + 1, 0, cc);
      renderChoicesEditor();
      renderPreview();
      saveState();
    });
    row.querySelector('[data-remove]').addEventListener('click', () => {
      state.choices.splice(i, 1);
      renderChoicesEditor();
      renderPreview();
      saveState();
    });
    choicesWrap.appendChild(row);
  });
  augmentButtons(choicesWrap);
}

function renderPreview() {
  // ----- Universal FX layer: overlays + filter params that sit OVER any
  // theme's stage output. The theme is responsible for the dialog/channels
  // /messages/choices; this code handles the things the user toggles in the
  // FX panel and the background image — they apply regardless of theme. -----
  toggleHideChoicesBtn.setAttribute('data-pos', state.hideChoices ? 'right' : 'left');
  const choicesActive = state.choices.filter(c => c.text.trim()).length;
  choicesCount.textContent = choicesActive ? `(${choicesActive})` : '';
  const gAmt = (typeof state.glitchAmount === 'number') ? state.glitchAmount : 38;
  glitchDisplacement.setAttribute('scale', gAmt);
  // Soft glitch (used by gothic graveyard signal-bars) tracks the same slider
  // at ~60% magnitude so its strokes stay readable even at max.
  const softGlitch = document.getElementById('glitchDisplacementSoft');
  if (softGlitch) softGlitch.setAttribute('scale', Math.round(gAmt * 0.6));
  // Strong variant for attached message images — overdriven so body-image
  // distortion reads heavier than the dialog text it sits among.
  const strongGlitch = document.getElementById('glitchDisplacementStrong');
  if (strongGlitch) strongGlitch.setAttribute('scale', Math.round(gAmt * 1.8));
  const sAmt = (typeof state.scanlinesAmount === 'number') ? state.scanlinesAmount : 0.18;
  stage.style.setProperty('--scanline-alpha', sAmt);
  const cAmt = (typeof state.chromaticAmount === 'number') ? state.chromaticAmount : 2;
  chromaOffsetR.setAttribute('dx', -cAmt);
  chromaOffsetB.setAttribute('dx', cAmt);
  const vAmt = (typeof state.vignetteAmount === 'number') ? state.vignetteAmount : 0.6;
  stage.style.setProperty('--vignette-alpha', vAmt);
  const fxFilters = [];
  if (state.chromatic) fxFilters.push('url(#chromatic-aberration)');
  if (state.glitch) fxFilters.push('url(#glitch-slices)');
  stage.style.setProperty('--stage-filter', fxFilters.length ? fxFilters.join(' ') : 'none');
  stage.classList.toggle('glitch', state.glitch);
  stage.classList.toggle('scanlines', state.scanlines);
  stage.classList.toggle('chromatic', state.chromatic);
  stage.classList.toggle('vignette', state.vignette);
  toggleGlitchBtn.setAttribute('data-pos', state.glitch ? 'right' : 'left');
  toggleScanlinesBtn.setAttribute('data-pos', state.scanlines ? 'right' : 'left');
  toggleChromaticBtn.setAttribute('data-pos', state.chromatic ? 'right' : 'left');
  toggleVignetteBtn.setAttribute('data-pos', state.vignette ? 'right' : 'left');
  const framesBtn = document.getElementById('toggleFrames');
  if (framesBtn) framesBtn.setAttribute('data-pos', state.frames ? 'right' : 'left');
  if (state.bg) {
    const bgUrl = displayUrl(state.bg) || state.bg;
    stageBg.style.backgroundImage = `url("${bgUrl}")`;
  } else {
    stageBg.style.backgroundImage = 'none';
    stageBg.style.background = 'linear-gradient(135deg, #1a0030 0%, #001530 50%, #300018 100%)';
  }
  const bright = (typeof state.bgBrightness === 'number') ? state.bgBrightness : 0.55;
  stageBg.style.filter = `brightness(${bright}) contrast(1.05) saturate(1.1)`;
  const visibleMessages = state.messages.filter(m => m.speaker.trim() || m.body.trim() || m.portrait);
  const totalChars = visibleMessages.reduce((s, m) => s + (m.body || '').length, 0);
  charCount.textContent = `${totalChars} chars / ${visibleMessages.length} msgs`;
  updateStageDims();

  // ----- Theme-owned stage rendering. Each theme paints the dialog/channels
  // /messages/choices/signal-bars/accent into the stage. While the user is
  // hovering a theme item, `previewingThemeId` wins so the hover preview
  // shows the previewed theme's structure. Themes that only diverge in CSS
  // can omit `renderStage` and inherit the neon theme's renderer. -----
  const activeThemeId = (typeof previewingThemeId !== 'undefined' && previewingThemeId)
    || (typeof appliedThemeId !== 'undefined' ? appliedThemeId : 'neon');
  const theme = (typeof THEMES !== 'undefined' && THEMES[activeThemeId]) || (typeof THEMES !== 'undefined' && THEMES.neon);
  const renderFn = (theme && theme.renderStage)
    || (typeof THEMES !== 'undefined' && THEMES.neon && THEMES.neon.renderStage);
  if (renderFn) renderFn(state);

  // Saved custom swatch — shown only when the user has picked one, behaves like presets
  const savedSwatch = accentsWrap.querySelector('[data-saved-accent]');
  if (savedSwatch) {
    if (state.customAccent) {
      savedSwatch.hidden = false;
      savedSwatch.dataset.color = state.customAccent;
      savedSwatch.style.background = state.customAccent;
      savedSwatch.style.color = state.customAccent;
    } else {
      savedSwatch.hidden = true;
    }
  }
  // Highlight active swatch
  accentsWrap.querySelectorAll('.swatch').forEach(sw => {
    sw.classList.toggle('active', sw.dataset.color === state.accent);
  });
  const savedChoicesSwatch = choicesPaletteWrap.querySelector('[data-saved-choices-color]');
  if (savedChoicesSwatch) {
    if (state.customChoicesColor) {
      savedChoicesSwatch.hidden = false;
      savedChoicesSwatch.dataset.color = state.customChoicesColor;
      savedChoicesSwatch.style.background = state.customChoicesColor;
      savedChoicesSwatch.style.color = state.customChoicesColor;
    } else {
      savedChoicesSwatch.hidden = true;
    }
  }
  choicesPaletteWrap.querySelectorAll('.swatch').forEach(sw => {
    sw.classList.toggle('active', sw.dataset.color === state.choicesColor);
  });
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
}

function syncForm() {
  metaInput.value = state.meta;
  metaRightInput.value = state.metaRight || '';
  const bright = (typeof state.bgBrightness === 'number') ? state.bgBrightness : 0.55;
  bgBrightnessInput.value = bright;
  bgBrightnessVal.textContent = Math.round(bright * 100) + '%';
  const gAmt = (typeof state.glitchAmount === 'number') ? state.glitchAmount : 38;
  glitchAmountInput.value = gAmt;
  glitchAmountVal.textContent = String(gAmt);
  const sAmt = (typeof state.scanlinesAmount === 'number') ? state.scanlinesAmount : 0.18;
  scanlinesAmountInput.value = sAmt;
  scanlinesAmountVal.textContent = Math.round(sAmt * 100) + '%';
  const cAmt = (typeof state.chromaticAmount === 'number') ? state.chromaticAmount : 2;
  chromaticAmountInput.value = cAmt;
  chromaticAmountVal.textContent = cAmt + 'px';
  const vAmt = (typeof state.vignetteAmount === 'number') ? state.vignetteAmount : 0.6;
  vignetteAmountInput.value = vAmt;
  vignetteAmountVal.textContent = Math.round(vAmt * 100) + '%';
  renderMessagesEditor();
  renderChoicesEditor();
}

function updateStageDims() {
  const r = stage.getBoundingClientRect();
  stageDims.textContent = `${Math.round(r.width)}×${Math.round(r.height)} (×2 = ${Math.round(r.width * 2)}×${Math.round(r.height * 2)})`;
  const sb = document.getElementById('signalBars');
  if (sb) {
    const dRect = dialog.getBoundingClientRect();
    const wRect = sb.parentNode.getBoundingClientRect();
    sb.style.top = (dRect.top - wRect.top - 4) + 'px';
    sb.style.right = Math.max(0, wRect.right - dRect.right + 5) + 'px';
  }
}
window.addEventListener('resize', () => requestAnimationFrame(updateStageDims));
