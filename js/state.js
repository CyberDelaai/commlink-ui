// COMMLINK state model: defaultState, state helpers (clone, genId,
// inSameChain, resolveSpeaker), persistence (loadState, saveState),
// and the IDB image migration / GC helpers that operate on state +
// snapshots.
//
// Loaded AFTER snapshots.js because defaultState evaluates
// makeInitialAvatar / makeDefaultBg at load time.
// The mutable `let state = loadState();` declaration itself stays in
// the inline script (where it's adjacent to currentLang) so its TDZ
// resolves cleanly relative to other inline top-level lets.

// GC: remove IDB entries no longer referenced anywhere (state + snapshots).
async function gcImages() {
  const live = collectImageRefs(state);
  const snaps = loadSnapshots();
  Object.keys(snaps).forEach(name => collectImageRefs(snaps[name], live));
  let keys;
  try { keys = await idbAllKeys(); } catch { return; }
  await Promise.all(keys.filter(k => !live.has(k)).map(k => {
    const url = _blobUrlCache.get(k);
    if (url) { URL.revokeObjectURL(url); _blobUrlCache.delete(k); }
    return idbDelete(k).catch(() => {});
  }));
}
// Migrate any inline data: URLs in state to IDB refs. Returns true if
// anything changed (caller should saveState).
async function migrateStateImagesToIdb() {
  let changed = false;
  if (state.bg && state.bg.startsWith('data:')) { state.bg = await storeImageDataUrl(state.bg); changed = true; }
  if (state.bgOriginal && state.bgOriginal.startsWith('data:')) { state.bgOriginal = await storeImageDataUrl(state.bgOriginal); changed = true; }
  for (const m of state.messages || []) {
    if (m.bodyImage && m.bodyImage.startsWith('data:')) { m.bodyImage = await storeImageDataUrl(m.bodyImage); changed = true; }
    if (m.bodyImageOriginal && m.bodyImageOriginal.startsWith('data:')) { m.bodyImageOriginal = await storeImageDataUrl(m.bodyImageOriginal); changed = true; }
  }
  return changed;
}
// Same migration for stored snapshots (one-time pass).
async function migrateSnapshotsImagesToIdb() {
  const snaps = loadSnapshots();
  let changed = false;
  for (const name of Object.keys(snaps)) {
    const s = snaps[name];
    if (s.bg && s.bg.startsWith('data:')) { s.bg = await storeImageDataUrl(s.bg); changed = true; }
    if (s.bgOriginal && s.bgOriginal.startsWith('data:')) { s.bgOriginal = await storeImageDataUrl(s.bgOriginal); changed = true; }
    for (const m of s.messages || []) {
      if (m.bodyImage && m.bodyImage.startsWith('data:')) { m.bodyImage = await storeImageDataUrl(m.bodyImage); changed = true; }
      if (m.bodyImageOriginal && m.bodyImageOriginal.startsWith('data:')) { m.bodyImageOriginal = await storeImageDataUrl(m.bodyImageOriginal); changed = true; }
    }
  }
  if (changed) persistSnapshots(snaps);
  return changed;
}

// ---------- State ----------
const defaultState = {
  meta: '//ENCRYPTED',
  metaRight: '',
  messages: [
    { type: 'normal', speaker: 'JOHNNY', body: 'Wake the fuck up, samurai. We have a city to burn.', portrait: makeInitialAvatar('J', '#fcee0a'), side: 'left', time: '04:20', bodyImage: '' },
    { type: 'normal', speaker: 'V', body: 'Give me a sec. Head\'s still ringing.', portrait: makeInitialAvatar('V', '#00f0ff'), side: 'right', time: '04:21', bodyImage: '' },
    { type: 'normal', speaker: 'JOHNNY', body: 'Sending you the schematics — don\'t open them on public net.', portrait: makeInitialAvatar('J', '#fcee0a'), side: 'left', time: '04:22', bodyImage: '' },
    { type: 'system', body: 'FILE TRANSFERRED', speaker: '', portrait: '', side: 'left', time: '', bodyImage: '' },
    { type: 'normal', speaker: 'V', body: 'Got it. Heading to the drop now.', portrait: makeInitialAvatar('V', '#00f0ff'), side: 'right', time: '04:23', bodyImage: '' }
  ],
  choices: [
    "Who am I meeting at the drop?",
    "Stay in my head, Silverhand."
  ],
  accent: '#fcee0a',
  customAccent: '#00aaff',
  glitch: false,
  glitchAmount: 38,
  scanlines: true,
  scanlinesAmount: 0.18,
  chromatic: false,
  chromaticAmount: 2,
  slim: false,
  bg: makeDefaultBg(),
  bgOriginal: '',
  bgBrightness: 0.55
};



function loadState() {
  const raw = storageGet(STATE_KEY);
  if (!raw) {
    const fresh = clone(defaultState);
    // First load: replace English defaults with the current locale's example,
    // so a brand-new user sees the dialog in their detected/chosen language.
    const tr = window.I18N && window.I18N[currentLang];
    if (tr && tr.example && typeof buildExampleMessagesFor === 'function') {
      fresh.messages = buildExampleMessagesFor(currentLang);
      fresh.choices = tr.example.choices.slice();
      if (tr.example.meta) fresh.meta = tr.example.meta;
    }
    fresh.bgOriginal = storageGet(BG_ORIGINAL_KEY) || '';
    return fresh;
  }
  try {
    const parsed = JSON.parse(raw);
    const merged = { ...clone(defaultState), ...parsed };
    // Backfill empty customAccent with the default so the saved-swatch
    // shows up for users created before this field had a default.
    if (!merged.customAccent) merged.customAccent = defaultState.customAccent;
    // Migrate old shape (speaker + body) → messages[]
    if ((!Array.isArray(merged.messages) || merged.messages.length === 0) && (parsed.speaker || parsed.body)) {
      merged.messages = [{ speaker: parsed.speaker || '', body: parsed.body || '' }];
    }
    if (!Array.isArray(merged.messages)) merged.messages = [];
    merged.messages = merged.messages.map(m => ({ type: 'normal', contactId: '', chainId: '', speaker: '', body: '', portrait: '', portraitOriginal: '', side: 'left', time: '', bodyImage: '', bodyImageOriginal: '', ...m }));
    // bgOriginal lives in its own key (too large for the main state JSON).
    // Migrate from old shape (when bgOriginal was inside state JSON).
    const separateBg = storageGet(BG_ORIGINAL_KEY);
    if (separateBg) {
      merged.bgOriginal = separateBg;
    } else if (parsed.bgOriginal) {
      merged.bgOriginal = parsed.bgOriginal;
      storageSet(BG_ORIGINAL_KEY, parsed.bgOriginal);
    } else {
      merged.bgOriginal = '';
    }
    return merged;
  } catch {
    return clone(defaultState);
  }
}

function clone(o) { return JSON.parse(JSON.stringify(o)); }

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
// Two messages share a chain if they're linked to the same contact OR they
// carry the same chainId. Messages with empty contactId AND empty chainId
// are standalone.
function inSameChain(a, b) {
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.contactId && a.contactId === b.contactId) return true;
  if (a.chainId && a.chainId === b.chainId) return true;
  return false;
}

// Resolve a message's display speaker + portrait. If the message is linked
// to a contact (m.contactId), live values from the contact win; otherwise
// the cached m.speaker / m.portrait fields are used as inline storage.
function resolveSpeaker(m, contactsList) {
  if (m && m.contactId) {
    const list = contactsList || loadContacts();
    const c = list.find(x => x.id === m.contactId);
    if (c) return { name: c.name || '', avatar: c.avatar || '' };
  }
  return { name: (m && m.speaker) || '', avatar: (m && m.portrait) || '' };
}

function saveState() {
  const { bgOriginal, ...slim } = state;
  // Avatar recrop was removed → portraitOriginal is dead weight.
  // Also: messages linked to a contact don't need cached speaker/portrait
  // (those resolve live). Strip both for compactness.
  if (Array.isArray(slim.messages)) {
    const contactIds = new Set(loadContacts().map(c => c.id));
    slim.messages = slim.messages.map(m => {
      if (!m) return m;
      let copy = null;
      if (m.portraitOriginal) {
        copy = copy || { ...m };
        copy.portraitOriginal = '';
      }
      if (m.contactId && contactIds.has(m.contactId) && (m.speaker || m.portrait)) {
        copy = copy || { ...m };
        copy.speaker = '';
        copy.portrait = '';
      }
      return copy || m;
    });
  }
  storageSet(STATE_KEY, JSON.stringify(slim));
  if (bgOriginal) {
    storageSet(BG_ORIGINAL_KEY, bgOriginal);
  } else {
    storageDel(BG_ORIGINAL_KEY);
  }
}
