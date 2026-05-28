// COMMLINK JSON state IO: export current dialog + contacts to a self-
// contained .json (inlines IDB image refs back to data: URLs); import
// from JSON, re-extracts data URLs back into IDB. Loaded after inline.

// Export state + contacts as JSON
// Replace any idb:<hash> ref in a state-shaped object with the inlined data
// URL so the JSON is self-contained when imported on another device.
async function inlineIdbRefs(obj) {
  if (!obj) return obj;
  async function resolve(ref) {
    if (!ref || !isImgRef(ref)) return ref;
    const blob = await idbGet(refToId(ref)).catch(() => null);
    return blob ? await blobToDataUrl(blob) : '';
  }
  obj.bg = await resolve(obj.bg);
  obj.bgOriginal = await resolve(obj.bgOriginal);
  if (Array.isArray(obj.messages)) {
    for (const m of obj.messages) {
      if (!m) continue;
      m.bodyImage = await resolve(m.bodyImage);
      m.bodyImageOriginal = await resolve(m.bodyImageOriginal);
    }
  }
  return obj;
}
exportStateBtn.addEventListener('click', async () => {
  try {
    const payload = {
      app: 'commlink',
      version: APP_VERSION,
      exportedAt: Date.now(),
      state: await inlineIdbRefs(clone(state)),
      contacts: loadContacts()
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `commlink_state_${Date.now()}.json`;
    link.href = url;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast(t('toast.stateExported'));
  } catch (err) {
    console.error(err);
    showToast(t('toast.exportFailed'));
  }
});

// Import state + contacts from JSON
importStateFile.addEventListener('change', (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const proceed = confirm(t('confirm.import'));
  if (!proceed) {
    importStateFile.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const data = JSON.parse(reader.result);
      if (!data || typeof data !== 'object' || !data.state || typeof data.state !== 'object') {
        throw new Error('Missing state');
      }
      const merged = { ...clone(defaultState), ...data.state };
      if (!Array.isArray(merged.messages)) merged.messages = [];
      merged.messages = merged.messages.map(m => ({
        type: 'normal', speaker: '', body: '', portrait: '', portraitOriginal: '',
        side: 'left', time: '', bodyImage: '', bodyImageOriginal: '', ...m
      }));
      if (!Array.isArray(merged.choices)) merged.choices = [];
      state = merged;
      // Imported JSON has inlined data: URLs. Re-extract them to IDB so the
      // session uses idb: refs (same model as local storage).
      await migrateStateImagesToIdb();
      // Preload the freshly-imported refs so the first render hits cache.
      const refs = [state.bg, state.bgOriginal].filter(isImgRef);
      (state.messages || []).forEach(m => {
        if (m && isImgRef(m.bodyImage)) refs.push(m.bodyImage);
        if (m && isImgRef(m.bodyImageOriginal)) refs.push(m.bodyImageOriginal);
      });
      await preloadImageRefs(refs);
      if (Array.isArray(data.contacts)) {
        saveContacts(data.contacts);
        renderContacts();
      }
      saveState();
      gcImages().catch(() => {});
      syncForm();
      renderPreview();
      showToast(t('toast.stateImported'));
    } catch (err) {
      console.error(err);
      showToast(t('toast.importFailed'));
    } finally {
      importStateFile.value = '';
    }
  };
  reader.onerror = () => {
    showToast(t('toast.importFailed'));
    importStateFile.value = '';
  };
  reader.readAsText(file);
});
