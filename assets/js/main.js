// Ad Astra — site interactions
//
// Two responsibilities:
//   1. Persisted dark/light theme toggle (button bottom-right of every page).
//   2. View page: open/close the acquisition-data slide-in rail.
//
// Kept tiny on purpose — Hugo bundles + fingerprints this file.

(() => {
  /* ---------------- Theme ---------------- */

  const STORAGE_KEY = 'aa_theme';
  const root = document.documentElement;

  function preferred() {
    return window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
  }

  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    const btn = document.querySelector('.aa-theme-toggle');
    if (btn) {
      btn.setAttribute('aria-pressed', t === 'dark' ? 'true' : 'false');
      const label = btn.querySelector('.aa-theme-toggle__label');
      if (label) label.textContent = t === 'dark' ? 'Dark' : 'Light';
    }
  }

  // Resolve at script-eval time so first paint is correct (this script is in
  // <head>, so we run before <body> is parsed).
  const stored = (() => {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  })();
  applyTheme(stored || preferred());

  // Wire the toggle once the DOM is ready.
  document.addEventListener('DOMContentLoaded', () => {
    applyTheme(root.getAttribute('data-theme'));

    const btn = document.querySelector('.aa-theme-toggle');
    if (btn) {
      btn.addEventListener('click', () => {
        const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        try { localStorage.setItem(STORAGE_KEY, next); } catch (e) {}
        applyTheme(next);
      });
    }

    /* ---------------- View-page rail ---------------- */

    const view = document.querySelector('.aa-view');
    if (view) {
      const setOpen = (open) => {
        view.setAttribute('data-rail-open', open ? 'true' : 'false');
      };
      view.querySelectorAll('[data-rail-open-btn]')
        .forEach((el) => el.addEventListener('click', () => setOpen(true)));
      view.querySelectorAll('[data-rail-close-btn]')
        .forEach((el) => el.addEventListener('click', () => setOpen(false)));

      // Esc closes the rail.
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && view.getAttribute('data-rail-open') === 'true') {
          setOpen(false);
        }
      });

      /* ---------------- Image fit/fill toggle ---------------- */

      const FIT_KEY = 'aa_image_fit';
      const labelEl = view.querySelector('[data-fit-label]');
      const imgEl   = view.querySelector('[data-fit-img]');
      const imgBox  = view.querySelector('.aa-view__image');

      // Compute the scale needed to take object-fit:contain (the base) up to
      // cover. Depends on the image's aspect ratio vs the container's, so we
      // measure on image load and on container resize. The CSS variable is
      // read by both .aa-view__image-el (transform) so the animation just
      // follows whatever's current.
      const recomputeScale = () => {
        if (!imgEl || !imgBox) return;
        const nw = imgEl.naturalWidth, nh = imgEl.naturalHeight;
        const bw = imgBox.clientWidth,  bh = imgBox.clientHeight;
        if (!nw || !nh || !bw || !bh) return;
        const rImg = nw / nh, rBox = bw / bh;
        const scale = Math.max(rImg / rBox, rBox / rImg);
        view.style.setProperty('--cover-scale', scale.toFixed(4));
      };

      if (imgEl) {
        if (imgEl.complete) recomputeScale();
        imgEl.addEventListener('load', recomputeScale);
      }
      if (imgBox && 'ResizeObserver' in window) {
        new ResizeObserver(recomputeScale).observe(imgBox);
      } else {
        window.addEventListener('resize', recomputeScale);
      }

      const applyFit = (mode) => {
        view.setAttribute('data-fit', mode);
        if (labelEl) labelEl.textContent = mode === 'cover' ? 'Fit' : 'Fill';
      };
      const storedFit = (() => {
        try { return localStorage.getItem(FIT_KEY); } catch (e) { return null; }
      })();
      applyFit(storedFit === 'contain' ? 'contain' : 'cover');

      view.querySelectorAll('[data-fit-toggle]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const next = view.getAttribute('data-fit') === 'cover' ? 'contain' : 'cover';
          try { localStorage.setItem(FIT_KEY, next); } catch (e) {}
          applyFit(next);
        });
      });
    }
  });
})();
