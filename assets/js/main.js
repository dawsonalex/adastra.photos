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

      /* ---------------- Image fit/fill toggle ----------------
         The active mode lives in html[data-fit] — set pre-paint by an
         inline script in head.html, so the CSS object-fit value (cover by
         default, contain when html[data-fit="contain"]) is already correct
         on first paint. No measurement or animation logic needed. */

      const FIT_KEY = 'aa_image_fit';

      // aria-pressed reflects whether the toggle is in its "on" (non-default)
      // state — true when data-fit is "contain" (letterboxed), false when
      // "cover". Sync it to the pre-paint value on load, then on every click.
      const fitButtons = view.querySelectorAll('[data-fit-toggle]');
      const syncPressed = (mode) => {
        fitButtons.forEach((b) => b.setAttribute('aria-pressed', mode === 'contain' ? 'true' : 'false'));
      };
      syncPressed(root.getAttribute('data-fit'));

      fitButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const next = root.getAttribute('data-fit') === 'cover' ? 'contain' : 'cover';
          try { localStorage.setItem(FIT_KEY, next); } catch (e) {}
          root.setAttribute('data-fit', next);
          syncPressed(next);
        });
      });
    }
  });
})();
