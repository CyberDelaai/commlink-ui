// COMMLINK contacts layer: list load/save, add-message-from-contact, plus
// the contact-card render with inline edit (pencil <-> save) and delete.
// Loaded BEFORE the main inline script — function declarations hoist,
// references to state / DOM refs / openCrop resolve at call time.

// ---------- Contacts (sidebar) ----------
let newAvatarData = '';

function loadContacts() {
  const raw = storageGet(CONTACTS_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) || []; } catch { return []; }
}
function saveContacts(list) {
  return storageSet(CONTACTS_KEY, JSON.stringify(list));
}
function addMessageFromContact(c) {
  if (state.messages.length >= 99) { showToast(t('toast.maxMessages')); return; }
  // contactId resolves to live speaker/avatar at render time; leave the
  // cached fields empty so we don't duplicate the contact's avatar bytes.
  state.messages.push({
    type: 'normal',
    contactId: c.id || '',
    speaker: '',
    body: '',
    portrait: '',
    portraitOriginal: '',
    side: 'left',
    time: '',
    bodyImage: '',
    bodyImageOriginal: ''
  });
  renderMessagesEditor();
  renderPreview();
  saveState();
  showToast(t('toast.contactSelected', { name: c.name || 'contact' }));
}
function renderContacts() {
  const contacts = loadContacts();
  contactList.innerHTML = '';
  contacts.forEach((c) => {
    const item = document.createElement('div');
    item.className = 'contact';
    item.dataset.contactId = c.id;
    item.innerHTML = `
      <div class="contact-avatar"></div>
      <span class="contact-name"></span>
      <input class="contact-name-input" type="text" maxlength="40" />
      <button class="btn cyan icon" type="button" data-edit aria-label="edit contact" title="Edit contact">
        <svg class="mi icon-edit" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
        <svg class="mi icon-save" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>
      </button>
      <button class="btn danger icon" type="button" data-del aria-label="delete">✕</button>
    `;
    if (c.avatar) item.querySelector('.contact-avatar').style.backgroundImage = `url("${c.avatar}")`;
    item.querySelector('.contact-name').textContent = c.name || '—';
    const nameInput = item.querySelector('.contact-name-input');
    nameInput.value = c.name || '';
    // Edit avatar — held in closure until SAVE is clicked.
    let pendingAvatar = null;
    item.addEventListener('click', (e) => {
      if (e.target.closest('[data-del]')) return;
      if (e.target.closest('[data-edit]')) return;
      if (item.classList.contains('editing')) {
        // In edit mode: avatar click opens crop, input click focuses input.
        if (e.target.closest('.contact-avatar')) {
          const onPick = (dataUrl) => {
            if (!dataUrl) return;
            const onCropped = (out) => {
              pendingAvatar = out;
              item.querySelector('.contact-avatar').style.backgroundImage = `url("${out}")`;
            };
            openCrop(dataUrl, onCropped, AVATAR_CROP_OPTS);
          };
          // Trigger file picker
          const fp = document.createElement('input');
          fp.type = 'file';
          fp.accept = 'image/*';
          fp.addEventListener('change', () => {
            const f = fp.files && fp.files[0];
            if (!f) return;
            const r = new FileReader();
            r.onload = (ev) => onPick(ev.target.result);
            r.readAsDataURL(f);
          });
          fp.click();
        }
        return;
      }
      addMessageFromContact(c);
    });
    item.querySelector('[data-edit]').addEventListener('click', (e) => {
      e.stopPropagation();
      const isEditing = item.classList.contains('editing');
      if (!isEditing) {
        // Enter edit mode.
        item.classList.add('editing');
        nameInput.focus();
        nameInput.select();
        return;
      }
      // Commit edit: persist new name + avatar (if changed).
      const list = loadContacts();
      const target = list.find(x => x.id === c.id);
      if (target) {
        const newName = (nameInput.value || '').trim() || target.name || '';
        target.name = newName;
        if (pendingAvatar) target.avatar = pendingAvatar;
        saveContacts(list);
      }
      renderContacts();
      renderPreview();
      renderMessagesEditor();
    });
    nameInput.addEventListener('click', (e) => e.stopPropagation());
    nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        item.querySelector('[data-edit]').click();
      }
    });
    item.querySelector('[data-del]').addEventListener('click', (e) => {
      e.stopPropagation();
      if (!confirm(`Delete contact "${c.name}"?`)) return;
      // Inline the contact's data into any messages that referenced it so
      // the display survives the contact removal. Preserve the chain by
      // assigning a shared chainId across the freshly-detached messages.
      let touched = false;
      const sharedChainId = genId();
      state.messages.forEach(m => {
        if (m && m.contactId === c.id) {
          m.speaker = c.name || '';
          m.portrait = c.avatar || '';
          m.contactId = '';
          if (!m.chainId) m.chainId = sharedChainId;
          touched = true;
        }
      });
      const updated = loadContacts().filter(x => x.id !== c.id);
      saveContacts(updated);
      if (touched) { saveState(); renderPreview(); renderMessagesEditor(); }
      renderContacts();
    });
    contactList.appendChild(item);
  });
  augmentButtons(contactList);
}
