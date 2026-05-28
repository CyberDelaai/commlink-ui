// COMMLINK snapshots layer: load/persist + render + load-into-state, plus
// the one-time seeding of bundled EXAMPLE_<lang> snapshots and default
// contacts. Loaded BEFORE the main inline script — function declarations
// hoist, function bodies look up state / DOM refs lazily.

// ---------- Snapshots ----------
function loadSnapshots() {
  const raw = storageGet(SNAPSHOTS_KEY);
  if (!raw) return {};
  try { return JSON.parse(raw) || {}; } catch { return {}; }
}
function persistSnapshots(snaps) {
  return storageSet(SNAPSHOTS_KEY, JSON.stringify(snaps));
}
function snapshotFromState() {
  // Strip `lang` (and anything else that marks a snapshot as a seeded EXAMPLE_*)
  // so user-saved snapshots aren't accidentally filtered out by the SHOW
  // EXAMPLES toggle.
  const { lang, ...slim } = clone(state);
  return {
    ...slim,
    contacts: loadContacts(),
    savedAt: Date.now()
  };
}
function renderSnapshots() {
  const snaps = loadSnapshots();
  const showExamples = storageGet(SHOW_EXAMPLES_KEY) !== '0';
  const names = Object.keys(snaps)
    .filter(name => showExamples || !snaps[name].lang)
    .sort((a, b) => (snaps[b].savedAt || 0) - (snaps[a].savedAt || 0));
  snapshotList.innerHTML = '';
  names.forEach((name) => {
    const item = document.createElement('div');
    item.className = 'snapshot-item';
    const date = new Date(snaps[name].savedAt || 0);
    const stamp = isNaN(date.getTime()) ? '' : date.toISOString().slice(5, 16).replace('T', ' ');
    // Seeded language examples (carry a `lang` field) are immutable.
    const isExample = !!snaps[name].lang;
    item.innerHTML = `
      <span class="name"></span>
      <span class="meta"></span>
      <button class="btn cyan icon" type="button" data-load>${t('btn.load')}</button>
      ${isExample ? '' : '<button class="btn danger icon" type="button" data-del aria-label="delete">✕</button>'}
    `;
    item.querySelector('.name').textContent = name;
    item.querySelector('.meta').textContent = stamp;
    item.querySelector('[data-load]').addEventListener('click', () => loadSnapshotInto(name));
    const delBtn = item.querySelector('[data-del]');
    if (delBtn) {
      delBtn.addEventListener('click', () => {
        if (!confirm(`Delete snapshot "${name}"?`)) return;
        const s = loadSnapshots();
        delete s[name];
        persistSnapshots(s);
        renderSnapshots();
        gcImages().catch(() => {});
        showToast(t('toast.snapshotDeleted', { name }));
      });
    }
    snapshotList.appendChild(item);
  });
  augmentButtons(snapshotList);
}
async function loadSnapshotInto(name) {
  const snaps = loadSnapshots();
  const snap = snaps[name];
  if (!snap) return;
  if (!confirm(`Load snapshot "${name}"? Your current dialog and contacts will be replaced.`)) return;
  state = {
    ...clone(defaultState),
    ...snap
  };
  delete state.savedAt;
  delete state.contacts;
  // `lang` is a marker for seeded EXAMPLE_* snapshots; once loaded into the
  // working state it no longer applies — strip it so re-saving doesn't make
  // the new snapshot look like an example.
  delete state.lang;
  state.messages = (state.messages || []).map(m => ({ type: 'normal', contactId: '', chainId: '', speaker: '', body: '', portrait: '', portraitOriginal: '', side: 'left', time: '', bodyImage: '', bodyImageOriginal: '', ...m }));
  if (!Array.isArray(state.choices)) state.choices = [];
  if (Array.isArray(snap.contacts)) {
    saveContacts(snap.contacts);
    renderContacts();
  }
  // Snapshot images live in IDB — preload refs into cache before rendering.
  const refs = [state.bg, state.bgOriginal].filter(isImgRef);
  (state.messages || []).forEach(m => {
    if (m && isImgRef(m.bodyImage)) refs.push(m.bodyImage);
    if (m && isImgRef(m.bodyImageOriginal)) refs.push(m.bodyImageOriginal);
  });
  await preloadImageRefs(refs);
  syncForm();
  renderPreview();
  saveState();
  showToast(t('toast.loaded', { name }));
}

// ---------- One-time defaults seeding ----------
function makeInitialAvatar(letter, color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="${color}"/><text x="32" y="44" text-anchor="middle" font-family="monospace" font-size="34" font-weight="700" fill="#0b0b10">${letter}</text></svg>`;
  return 'data:image/svg+xml;base64,' + btoa(svg);
}
function makeDefaultBg() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0a0014"/><stop offset="1" stop-color="#001a2e"/></linearGradient><radialGradient id="g1" cx="0.22" cy="0.28" r="0.55"><stop offset="0" stop-color="#fcee0a" stop-opacity="0.32"/><stop offset="1" stop-color="#fcee0a" stop-opacity="0"/></radialGradient><radialGradient id="g2" cx="0.82" cy="0.75" r="0.5"><stop offset="0" stop-color="#ff003c" stop-opacity="0.38"/><stop offset="1" stop-color="#ff003c" stop-opacity="0"/></radialGradient><radialGradient id="g3" cx="0.55" cy="0.45" r="0.65"><stop offset="0" stop-color="#00f0ff" stop-opacity="0.28"/><stop offset="1" stop-color="#00f0ff" stop-opacity="0"/></radialGradient></defs><rect width="100%" height="100%" fill="url(#b)"/><rect width="100%" height="100%" fill="url(#g1)"/><rect width="100%" height="100%" fill="url(#g2)"/><rect width="100%" height="100%" fill="url(#g3)"/></svg>`;
  return 'data:image/svg+xml;base64,' + btoa(svg);
}
// Build a full snapshot-ready message list from the locale's example template.
function buildExampleMessagesFor(lang) {
  const tr = window.I18N && window.I18N[lang];
  if (!tr || !tr.example) return [];
  return tr.example.messages.map(m => {
    if (m.type === 'system') {
      return { type: 'system', contactId: '', speaker: '', body: m.body, portrait: '', portraitOriginal: '', side: 'left', time: '', bodyImage: '', bodyImageOriginal: '' };
    }
    const color = m.speaker === 'JOHNNY' ? '#fcee0a' : '#00f0ff';
    const letter = (m.speaker[0] || '?').toUpperCase();
    // Link example messages to the seeded default contacts so the
    // contactId chain works out of the box. Linked messages skip the
    // cached speaker/portrait fields — they resolve live from the contact.
    const CONTACT_IDS = { JOHNNY: 'def-johnny', V: 'def-v' };
    const linkedId = CONTACT_IDS[m.speaker] || '';
    return {
      type: 'normal',
      contactId: linkedId,
      speaker: linkedId ? '' : m.speaker,
      body: m.body,
      portrait: linkedId ? '' : makeInitialAvatar(letter, color),
      portraitOriginal: '',
      side: m.side,
      time: m.time,
      bodyImage: '',
      bodyImageOriginal: ''
    };
  });
}

function seedDefaults() {
  const SEED_VERSION = '17';
  if (storageGet(SEEDED_KEY) === SEED_VERSION) return;
  // One-time cleanup: strip portraitOriginal (dead since avatar-recrop was
  // removed) from any existing saved snapshots to reclaim localStorage.
  const existingSnaps = loadSnapshots();
  let snapsChanged = false;
  Object.keys(existingSnaps).forEach(name => {
    const snap = existingSnaps[name];
    if (!snap || !Array.isArray(snap.messages)) return;
    snap.messages = snap.messages.map(m => {
      if (!m || !m.portraitOriginal) return m;
      snapsChanged = true;
      return { ...m, portraitOriginal: '' };
    });
  });
  if (snapsChanged) persistSnapshots(existingSnaps);
  const defaultContacts = [
    { id: 'def-johnny', name: 'JOHNNY', avatar: makeInitialAvatar('J', '#fcee0a') },
    { id: 'def-v', name: 'V', avatar: makeInitialAvatar('V', '#00f0ff') },
    { id: 'def-alt', name: 'ALT', avatar: makeInitialAvatar('A', '#c800ff') },
    { id: 'def-takemura', name: 'TAKEMURA', avatar: makeInitialAvatar('T', '#ff8800') }
  ];
  // Default contacts (only if user has none)
  if (loadContacts().length === 0) {
    saveContacts(defaultContacts);
  }
  // Rewrite example snapshots — one per supported language, each tagged
  // with `lang` so the SHOW EXAMPLES toggle can filter them.
  // Snapshot-key suffix uses the dropdown's display code (zh→CN), not the
  // ISO-639-1 lang code, so users see EXAMPLE_CN / EXAMPLE_JP-style names.
  const LANG_SUFFIX = { zh: 'CN' };
  const snaps = loadSnapshots();
  delete snaps['EXAMPLE // wake up samurai'];
  delete snaps['EXAMPLE'];
  delete snaps['EXAMPLE_ZH']; // migrate older seed naming
  SUPPORTED_LANGS.forEach(lang => {
    const tr = window.I18N && window.I18N[lang];
    if (!tr || !tr.example) return;
    const suffix = LANG_SUFFIX[lang] || lang.toUpperCase();
    const key = `EXAMPLE_${suffix}`;
    snaps[key] = {
      ...clone(defaultState),
      meta: tr.example.meta || defaultState.meta,
      messages: buildExampleMessagesFor(lang),
      choices: tr.example.choices.slice(),
      contacts: defaultContacts,
      lang: lang,
      savedAt: Date.now()
    };
  });
  persistSnapshots(snaps);
  storageSet(SEEDED_KEY, SEED_VERSION);
}
