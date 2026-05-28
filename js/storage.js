// COMMLINK storage layer: localStorage helpers + IndexedDB-backed image store.
// Pure utilities — no dependency on state, contacts, or DOM. Loaded as a
// classic <script>, so top-level const/let declarations are visible to
// every later script in the page (shared global lexical environment).

// ---------- Storage helpers (localStorage-backed) ----------
const STATE_KEY = 'commlink:state';
const SNAPSHOTS_KEY = 'commlink:snapshots';
const CONTACTS_KEY = 'commlink:contacts';
const BG_ORIGINAL_KEY = 'commlink:bgOriginal';
const OPEN_PANEL_KEY = 'commlink:openPanel';
const SEEDED_KEY = 'commlink:seeded';
const SHOW_EXAMPLES_KEY = 'commlink:showExamples';

function storageSet(key, value) {
  try { localStorage.setItem(key, value); return true; }
  catch (e) { return false; }
}
function storageGet(key) {
  try { return localStorage.getItem(key); }
  catch { return null; }
}
function storageDel(key) {
  try { localStorage.removeItem(key); } catch {}
}

// ---------- Image store (IndexedDB-backed, content-addressed) ----------
// Heavy image blobs (bg, bgOriginal, body images + their *Original) live in
// IndexedDB as Blobs keyed by SHA-256 of the data URL. State JSON stores
// only the small `idb:<hash>` reference, freeing localStorage quota.
// Dedup is automatic — same bytes → same hash → one IDB entry shared by
// every reference, including snapshots.
const IDB_NAME = 'commlink-images';
const IDB_VERSION = 1;
const IDB_STORE = 'images';
let _idbPromise = null;
function openImageDb() {
  if (_idbPromise) return _idbPromise;
  _idbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') { reject(new Error('no IDB')); return; }
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return _idbPromise;
}
function idbTx(mode) {
  return openImageDb().then(db => db.transaction(IDB_STORE, mode).objectStore(IDB_STORE));
}
function idbPut(id, blob) {
  return idbTx('readwrite').then(s => new Promise((res, rej) => {
    const r = s.put(blob, id);
    r.onsuccess = () => res(); r.onerror = () => rej(r.error);
  }));
}
function idbGet(id) {
  return idbTx('readonly').then(s => new Promise((res, rej) => {
    const r = s.get(id);
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  }));
}
function idbDelete(id) {
  return idbTx('readwrite').then(s => new Promise((res, rej) => {
    const r = s.delete(id);
    r.onsuccess = () => res(); r.onerror = () => rej(r.error);
  }));
}
function idbAllKeys() {
  return idbTx('readonly').then(s => new Promise((res, rej) => {
    const r = s.getAllKeys();
    r.onsuccess = () => res(r.result || []); r.onerror = () => rej(r.error);
  }));
}
async function sha256Hex(buf) {
  const h = await crypto.subtle.digest('SHA-256', buf);
  return [...new Uint8Array(h)].map(b => b.toString(16).padStart(2, '0')).join('');
}
function dataUrlToBlob(dataUrl) {
  const i = dataUrl.indexOf(',');
  const meta = dataUrl.slice(5, i); // strip "data:"
  const mime = meta.split(';')[0] || 'application/octet-stream';
  const isB64 = /;base64$/.test(meta);
  let bytes;
  if (isB64) {
    const s = atob(dataUrl.slice(i + 1));
    bytes = new Uint8Array(s.length);
    for (let k = 0; k < s.length; k++) bytes[k] = s.charCodeAt(k);
  } else {
    bytes = new TextEncoder().encode(decodeURIComponent(dataUrl.slice(i + 1)));
  }
  return new Blob([bytes], { type: mime });
}
function blobToDataUrl(blob) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = () => rej(r.error);
    r.readAsDataURL(blob);
  });
}
// hash → blob URL cache for the session
const _blobUrlCache = new Map();
function isImgRef(s) { return typeof s === 'string' && s.startsWith('idb:'); }
function refToId(s) { return s.slice(4); }
// Store a data URL (returns its idb:<hash> ref); pass-through for empty or
// already-stored refs.
async function storeImageDataUrl(dataUrl) {
  if (!dataUrl) return '';
  if (isImgRef(dataUrl)) return dataUrl;
  if (!dataUrl.startsWith('data:')) return dataUrl; // unknown shape — leave alone
  const blob = dataUrlToBlob(dataUrl);
  const hash = await sha256Hex(await blob.arrayBuffer());
  const existing = await idbGet(hash).catch(() => null);
  if (!existing) await idbPut(hash, blob);
  // Pre-warm cache for instant render after store.
  if (!_blobUrlCache.has(hash)) _blobUrlCache.set(hash, URL.createObjectURL(blob));
  return 'idb:' + hash;
}
// Resolve idb:<hash> → blob URL (cached). Pass-through for data: URLs and empties.
async function resolveImageRef(ref) {
  if (!ref) return '';
  if (!isImgRef(ref)) return ref;
  const id = refToId(ref);
  if (_blobUrlCache.has(id)) return _blobUrlCache.get(id);
  const blob = await idbGet(id).catch(() => null);
  if (!blob) return '';
  const url = URL.createObjectURL(blob);
  _blobUrlCache.set(id, url);
  return url;
}
// Synchronous display helper — returns the in-cache URL or the field as-is
// for data: URLs. Render code uses this after preload has run.
function displayUrl(field) {
  if (!field) return '';
  if (!isImgRef(field)) return field;
  return _blobUrlCache.get(refToId(field)) || '';
}
// Preload a set of idb refs into the cache so synchronous render finds them.
async function preloadImageRefs(refs) {
  const ids = new Set();
  refs.forEach(r => { if (isImgRef(r)) ids.add(refToId(r)); });
  await Promise.all([...ids].map(async id => {
    if (_blobUrlCache.has(id)) return;
    const blob = await idbGet(id).catch(() => null);
    if (blob) _blobUrlCache.set(id, URL.createObjectURL(blob));
  }));
}
// Walk a value (state or snapshot) and collect every idb:<hash> ref used.
function collectImageRefs(obj, out) {
  out = out || new Set();
  if (!obj) return out;
  if (isImgRef(obj.bg)) out.add(refToId(obj.bg));
  if (isImgRef(obj.bgOriginal)) out.add(refToId(obj.bgOriginal));
  (obj.messages || []).forEach(m => {
    if (m && isImgRef(m.bodyImage)) out.add(refToId(m.bodyImage));
    if (m && isImgRef(m.bodyImageOriginal)) out.add(refToId(m.bodyImageOriginal));
  });
  return out;
}
