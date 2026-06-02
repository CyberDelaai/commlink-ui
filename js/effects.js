// COMMLINK effects layer: header tag glitch animation, version-hover morph,
// and the GitHub commit-count fetch that powers the morph target.
// Loaded AFTER the main inline script so it can reference state-derived
// constants (currentLang, APP_VERSION) that the inline script declares.


// ---------- Commit count ("// changes: N" suffix in the header tag) ----------
// Reads via GitHub API. Uses the Link: rel="last" trick — asking for
// per_page=1 makes the last page number equal the total commit count.
// Caches the result for an hour in localStorage to dodge rate limiting.
async function fetchCommitCount() {
  const CACHE_KEY = 'commlink:commitCount';
  const CACHE_AT  = 'commlink:commitCountAt';
  const TTL = 60 * 60 * 1000; // 1h
  const cached = storageGet(CACHE_KEY);
  const at = parseInt(storageGet(CACHE_AT) || '0', 10);
  if (cached && (Date.now() - at) < TTL) return cached;
  try {
    const r = await fetch(`https://api.github.com/repos/${GH_REPO}/commits?per_page=1`);
    if (!r.ok) return cached || '';
    const link = r.headers.get('Link');
    if (link) {
      const m = link.match(/<[^>]*[?&]page=(\d+)>;\s*rel="last"/);
      if (m) {
        const count = m[1];
        storageSet(CACHE_KEY, count);
        storageSet(CACHE_AT, String(Date.now()));
        return count;
      }
    }
    // Fallback when there's only one page — count the array.
    const arr = await r.json().catch(() => null);
    if (Array.isArray(arr)) {
      const count = String(arr.length);
      storageSet(CACHE_KEY, count);
      storageSet(CACHE_AT, String(Date.now()));
      return count;
    }
  } catch (e) { /* offline / blocked — fall through */ }
  return cached || '';
}

// Pre-fetch the commit count so hovering the version morphs cleanly. If
// the call is still pending the first hover is a no-op; subsequent hovers
// (after the cache fills) will animate.
let _commitCountCache = '';
fetchCommitCount().then(count => { if (count) _commitCountCache = count; });

// Hover the version to morph it into "// changes: N" and back.
(function setupVersionMorph() {
  const meta = document.getElementById('tagMeta');
  if (!meta) return;
  const SCRAMBLE_CHARS = '!@#$%&*<>{}[]/|01ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const SCRAMBLE_KANA  = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンッー';
  const SCRAMBLE_HAN   = '数据网络代码系统终端连接信号传输零一二三四五六七八九';
  function alpha() {
    if (currentLang === 'ja') return SCRAMBLE_KANA;
    if (currentLang === 'zh') return SCRAMBLE_HAN;
    return SCRAMBLE_CHARS;
  }
  const versionText = () => ` // v${APP_VERSION}`;
  let timer = null;
  function morphTo(target) {
    if (timer) { clearInterval(timer); timer = null; }
    const start = meta.textContent;
    const maxLen = Math.max(start.length, target.length);
    const steps = 7;
    let step = 0;
    const chars = alpha();
    timer = setInterval(() => {
      step++;
      const revealed = Math.floor((step / steps) * target.length);
      let out = '';
      for (let i = 0; i < maxLen; i++) {
        if (i >= target.length) { out += ' '; continue; }
        if (i < revealed) { out += target[i]; continue; }
        out += chars[Math.floor(Math.random() * chars.length)];
      }
      meta.textContent = out;
      if (step >= steps) {
        clearInterval(timer); timer = null;
        meta.textContent = target;
      }
    }, 28);
  }
  meta.addEventListener('mouseenter', () => {
    if (!_commitCountCache) return; // not yet loaded — leave version
    morphTo(` // changes: ${_commitCountCache}`);
  });
  meta.addEventListener('mouseleave', () => {
    morphTo(versionText());
  });
})();

// Occasionally glitch the app tag <-> the "glitch" alias and back.
// ORIGINAL/TARGET are read fresh on each cycle so language changes apply.
(function startTagGlitch() {
  const el = document.getElementById('tagWord');
  if (!el) return;
  const CHARS_LATIN = '!@#$%&*<>{}[]/|01ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const CHARS_KANA  = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンッー!@#$%0123456789';
  const CHARS_HAN   = '数据网络代码系统终端连接信号传输零一二三四五六七八九!@#$%';
  function scrambleAlphabet() {
    if (currentLang === 'ja') return CHARS_KANA;
    if (currentLang === 'zh') return CHARS_HAN;
    return CHARS_LATIN;
  }

  function scrambleFrame(target, revealed, maxLen) {
    const chars = scrambleAlphabet();
    let out = '';
    for (let i = 0; i < maxLen; i++) {
      if (i >= target.length) { out += ' '; continue; }
      if (i < revealed) { out += target[i]; continue; }
      out += chars[Math.floor(Math.random() * chars.length)];
    }
    return out;
  }

  function runScramble(target, maxLen, onDone) {
    const steps = 8;
    let step = 0;
    const id = setInterval(() => {
      step++;
      const revealed = Math.floor((step / steps) * target.length);
      el.textContent = scrambleFrame(target, revealed, maxLen);
      if (step >= steps) {
        clearInterval(id);
        el.textContent = target + ' '.repeat(maxLen - target.length);
        onDone();
      }
    }, 40);
  }

  function runGlitch() {
    const ORIGINAL = t('tag.app');
    const TARGET = t('tag.glitch');
    const maxLen = Math.max(ORIGINAL.length, TARGET.length);
    el.classList.add('glitching');
    runScramble(TARGET, maxLen, () => {
      setTimeout(() => {
        runScramble(ORIGINAL, maxLen, () => {
          el.classList.remove('glitching');
          el.textContent = ORIGINAL;
          scheduleNext();
        });
      }, 700);
    });
  }

  function scheduleNext() {
    setTimeout(runGlitch, 14000 + Math.random() * 18000);
  }

  setTimeout(runGlitch, 8000 + Math.random() * 6000);
})();

// ---------- Tool-switcher menu (ported from chronos) ----------
// The COMMLINK logo opens an augmented-ui dropdown of cyberdeck.tools apps.
(function setupAppMenu() {
  const btn = document.getElementById('logoBtn');
  const menu = document.getElementById('appMenu');
  if (!btn || !menu) return;
  const open = () => { menu.hidden = false; btn.setAttribute('aria-expanded', 'true'); };
  const close = () => { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); };
  btn.addEventListener('click', (e) => { e.stopPropagation(); menu.hidden ? open() : close(); });
  // Close on outside click or Escape
  document.addEventListener('click', (e) => {
    if (!menu.hidden && !menu.contains(e.target) && e.target !== btn) close();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
})();
