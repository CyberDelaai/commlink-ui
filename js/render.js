// COMMLINK render layer: editor row + choice row + preview rendering, plus
// syncForm and stage dimensions readout. Loaded BEFORE the main inline
// script in the page so its function declarations are global at the time
// inline init calls them; function bodies look up state/DOM refs lazily.

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
  'щ(゜ロ゜щ)', '(⌐■_■)', '( ͡° ͜ʖ ͡°)', '¬‿¬', '( ͡~ ͜ʖ ͡°)',
  '(⊙_⊙)', '(◎_◎;)', 'Σ(°△°|||)', '(°o°;)', '(⊙﹏⊙)',
  '¯\\_(ツ)_/¯', '┐(´∀｀)┌', '(シ_ _)シ', '┐(￣ヘ￣;)┌', '(♥ω♥*)',
  '(✿ ♡‿♡)', '(♡°▽°♡)', '(˃͈ દ ˂͈)', '(-_-) zzz', '(∪｡∪) zzz',
  '(╬ಠ益ಠ)', '◔̯◔', '(ó﹏ò｡)', '(ノ°益°)ノ', '(づ｡◕‿‿◕｡)づ'
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
    if (!row || !m || m.type === 'system') return;
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

    // ----- System message editor: simplified row -----
    if (m.type === 'system') {
      row.classList.add('system');
      row.innerHTML = `
        <div class="msg-row-left">
          <span class="msg-pip"></span>
          <span class="idx"><span class="idx-text">SYS ${String(i + 1).padStart(2, '0')}</span></span>
          <span class="vspace"></span>
          <button class="btn ghost reorder-btn" type="button" data-up aria-label="move up" ${i === 0 ? 'disabled' : ''}>↑</button>
          <button class="btn ghost reorder-btn" type="button" data-down aria-label="move down" ${i === state.messages.length - 1 ? 'disabled' : ''}>↓</button>
        </div>
        <div class="msg-row-divider"></div>
        <div class="msg-row-right">
          <div class="msg-row-head">
            <span class="sys-label">// SYSTEM MESSAGE</span>
            <span class="toolbar-spacer"></span>
            <button class="btn cyan icon" type="button" data-clone aria-label="clone" title="Clone">
              <svg class="mi" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
            </button>
            <button class="btn danger icon" type="button" aria-label="remove" data-remove>✕</button>
          </div>
          <textarea class="body-input" maxlength="200" placeholder="System message..."></textarea>
        </div>
      `;
      const sbd = row.querySelector('.body-input');
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
            <button class="btn cyan icon" type="button" data-kao-toggle title="Insert kaomoji">顔</button>
            <div class="img-popup kao-popup" hidden>
              <div class="kao-grid"></div>
            </div>
          </div>
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
          <span class="no-contact-badge">${t('badge.noContact')}</span>
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
        const start = bd.selectionStart;
        const end = bd.selectionEnd;
        const insert = k;
        bd.value = bd.value.substring(0, start) + insert + bd.value.substring(end);
        bd.selectionStart = bd.selectionEnd = start + insert.length;
        bd.focus();
        state.messages[i].body = bd.value;
        autoGrow(bd);
        renderPreview();
        saveState();
        kaoPopup.hidden = true;
      });
      kaoGrid.appendChild(b);
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
        if (!m || m.type === 'system') return;
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
  const slimBtn = document.getElementById('toggleSlim');
  if (slimBtn) slimBtn.setAttribute('data-pos', state.slim ? 'right' : 'left');
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
  // shows the previewed theme's structure. -----
  const activeThemeId = (typeof previewingThemeId !== 'undefined' && previewingThemeId)
    || (typeof appliedThemeId !== 'undefined' ? appliedThemeId : 'default');
  const theme = (typeof THEMES !== 'undefined' && THEMES[activeThemeId]) || (typeof THEMES !== 'undefined' && THEMES.default);
  if (theme && typeof theme.renderStage === 'function') theme.renderStage(state);

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
