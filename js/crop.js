// COMMLINK crop modal: openCrop / closeCrop / doCrop, the drag-and-resize
// handlers for the crop frame, plus the clipboard paste helper used by
// every image input across the app. Loaded in <body> AFTER the modal
// markup, BEFORE the main inline script — so the DOM refs at the top of
// this file resolve at load time, and openCrop is defined when inline
// init wires event handlers that call it.

// ---------- Crop modal + clipboard paste ----------
const cropModal = document.getElementById('cropModal');
const cropImg = document.getElementById('cropImg');
const cropStage = document.getElementById('cropStage');
const cropFrame = document.getElementById('cropFrame');
const cropHandle = document.getElementById('cropHandle');
const cropConfirmBtn = document.getElementById('cropConfirm');
const cropCancelBtn = document.getElementById('cropCancel');
const cropMaxBtn = document.getElementById('cropMax');
let cropOnConfirm = null;
let cropAspect = 1;     // width / height
let cropFree = false;   // true → resize w/h independently
let cropOutW = 256;
let cropOutH = 256;
let cropMime = 'image/png';
let cropQuality = 0.92;

function openCrop(dataUrl, onConfirm, opts) {
  opts = opts || {};
  cropAspect = opts.aspect || 1;
  cropFree = !!opts.free;
  cropOutW = opts.outWidth || 256;
  cropOutH = opts.outHeight || 256;
  cropMime = opts.mime || 'image/png';
  cropQuality = typeof opts.quality === 'number' ? opts.quality : 0.92;
  cropOnConfirm = onConfirm;
  // Close any image popup so it doesn't overlay the crop modal
  document.querySelectorAll('.img-popup').forEach(p => { p.hidden = true; });
  cropImg.onload = () => {
    requestAnimationFrame(() => {
      const stageRect = cropStage.getBoundingClientRect();
      const imgRect = cropImg.getBoundingClientRect();
      const sx = imgRect.left - stageRect.left;
      const sy = imgRect.top - stageRect.top;
      let w, h;
      if (imgRect.width / imgRect.height > cropAspect) {
        h = imgRect.height * 0.6;
        w = h * cropAspect;
      } else {
        w = imgRect.width * 0.6;
        h = w / cropAspect;
      }
      cropFrame.style.width = w + 'px';
      cropFrame.style.height = h + 'px';
      cropFrame.style.left = (sx + (imgRect.width - w) / 2) + 'px';
      cropFrame.style.top = (sy + (imgRect.height - h) / 2) + 'px';
    });
  };
  cropImg.src = dataUrl;
  cropModal.hidden = false;
}
function closeCrop() {
  cropModal.hidden = true;
  cropOnConfirm = null;
  cropImg.src = '';
  // Also close any open image popup
  document.querySelectorAll('.img-popup').forEach(p => { p.hidden = true; });
}
function doCrop() {
  const imgRect = cropImg.getBoundingClientRect();
  const frameRect = cropFrame.getBoundingClientRect();
  const scaleX = cropImg.naturalWidth / imgRect.width;
  const scaleY = cropImg.naturalHeight / imgRect.height;
  // 2px cyan border drawn inside (box-sizing: border-box) → visible
  // selection is the area inset by the border thickness.
  const B = 2;
  const sx = Math.max(0, (frameRect.left + B - imgRect.left) * scaleX);
  const sy = Math.max(0, (frameRect.top + B - imgRect.top) * scaleY);
  let sw = Math.max(1, (frameRect.width - 2 * B) * scaleX);
  let sh = Math.max(1, (frameRect.height - 2 * B) * scaleY);
  sw = Math.min(cropImg.naturalWidth - sx, sw);
  sh = Math.min(cropImg.naturalHeight - sy, sh);
  let outW = cropOutW;
  let outH = cropOutH;
  if (cropFree) {
    // Output matches the crop frame's own aspect, capped to a max edge
    const MAX = 800;
    const a = sw / Math.max(1, sh);
    if (sw >= sh) {
      outW = Math.min(MAX, Math.round(sw));
      outH = Math.max(1, Math.round(outW / a));
    } else {
      outH = Math.min(MAX, Math.round(sh));
      outW = Math.max(1, Math.round(outH * a));
    }
  }
  const c = document.createElement('canvas');
  c.width = outW;
  c.height = outH;
  const ctx = c.getContext('2d');
  ctx.drawImage(cropImg, sx, sy, sw, sh, 0, 0, outW, outH);
  return c.toDataURL(cropMime, cropQuality);
}
cropConfirmBtn.addEventListener('click', () => {
  const result = doCrop();
  const cb = cropOnConfirm;
  closeCrop();
  if (cb) cb(result);
});
cropCancelBtn.addEventListener('click', closeCrop);
cropMaxBtn.addEventListener('click', () => {
  const stageRect = cropStage.getBoundingClientRect();
  const imgRect = cropImg.getBoundingClientRect();
  const sx = imgRect.left - stageRect.left;
  const sy = imgRect.top - stageRect.top;
  if (cropFree) {
    cropFrame.style.left = sx + 'px';
    cropFrame.style.top = sy + 'px';
    cropFrame.style.width = imgRect.width + 'px';
    cropFrame.style.height = imgRect.height + 'px';
  } else {
    let w, h;
    if (imgRect.width / Math.max(1, imgRect.height) > cropAspect) {
      h = imgRect.height;
      w = h * cropAspect;
    } else {
      w = imgRect.width;
      h = w / cropAspect;
    }
    cropFrame.style.width = w + 'px';
    cropFrame.style.height = h + 'px';
    cropFrame.style.left = (sx + (imgRect.width - w) / 2) + 'px';
    cropFrame.style.top = (sy + (imgRect.height - h) / 2) + 'px';
  }
});
cropModal.addEventListener('click', (e) => { if (e.target === cropModal) closeCrop(); });

// Drag + resize for the crop frame
let cropDrag = null;
cropFrame.addEventListener('mousedown', (e) => {
  const isHandle = e.target === cropHandle;
  cropDrag = {
    mode: isHandle ? 'resize' : 'move',
    x: e.clientX,
    y: e.clientY,
    left: cropFrame.offsetLeft,
    top: cropFrame.offsetTop,
    w: cropFrame.offsetWidth,
    h: cropFrame.offsetHeight
  };
  e.preventDefault();
});
document.addEventListener('mousemove', (e) => {
  if (!cropDrag) return;
  const dx = e.clientX - cropDrag.x;
  const dy = e.clientY - cropDrag.y;
  const stageRect = cropStage.getBoundingClientRect();
  const imgRect = cropImg.getBoundingClientRect();
  const imgX0 = imgRect.left - stageRect.left;
  const imgY0 = imgRect.top - stageRect.top;
  const imgX1 = imgX0 + imgRect.width;
  const imgY1 = imgY0 + imgRect.height;
  if (cropDrag.mode === 'move') {
    let l = cropDrag.left + dx;
    let t = cropDrag.top + dy;
    l = Math.max(imgX0, Math.min(imgX1 - cropFrame.offsetWidth, l));
    t = Math.max(imgY0, Math.min(imgY1 - cropFrame.offsetHeight, t));
    cropFrame.style.left = l + 'px';
    cropFrame.style.top = t + 'px';
  } else if (cropFree) {
    // Free resize: width and height change independently
    const maxW = imgX1 - cropDrag.left;
    const maxH = imgY1 - cropDrag.top;
    const newW = Math.max(32, Math.min(maxW, (cropDrag.w || cropDrag.size) + dx));
    const newH = Math.max(32, Math.min(maxH, (cropDrag.h || cropDrag.size) + dy));
    cropFrame.style.width = newW + 'px';
    cropFrame.style.height = newH + 'px';
  } else {
    // Resize preserving cropAspect (width / height)
    const wDelta = dx;
    const hDelta = dy * cropAspect;
    const delta = Math.max(wDelta, hDelta);
    const startW = cropDrag.w || cropDrag.size;
    const newW = Math.max(32, startW + delta);
    const newH = newW / cropAspect;
    const maxW = imgX1 - cropDrag.left;
    const maxH = imgY1 - cropDrag.top;
    let finalW = Math.min(newW, maxW);
    let finalH = finalW / cropAspect;
    if (finalH > maxH) {
      finalH = maxH;
      finalW = finalH * cropAspect;
    }
    cropFrame.style.width = finalW + 'px';
    cropFrame.style.height = finalH + 'px';
  }
});
document.addEventListener('mouseup', () => { cropDrag = null; });

async function tryPasteImage(onLoad) {
  try {
    const items = await navigator.clipboard.read();
    for (const item of items) {
      for (const type of item.types) {
        if (type.startsWith('image/')) {
          const blob = await item.getType(type);
          const reader = new FileReader();
          reader.onload = (e) => onLoad(e.target.result);
          reader.readAsDataURL(blob);
          return;
        }
      }
    }
    showToast(t('toast.noImageClipboard'));
  } catch (err) {
    console.warn(err);
    showToast(t('toast.clipboardBlocked'));
  }
}
