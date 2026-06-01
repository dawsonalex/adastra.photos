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
         Hybrid CSS + JS: first paint uses CSS object-fit: cover so there's
         no measurement on load. The first click hands off to JS, which
         switches the <img> to object-fit: fill and drives explicit
         width/height/left/top so the transition between cover and contain
         is actually animatable (object-fit itself isn't).

         No persistence — every page load starts on cover. */

      const fitButtons = view.querySelectorAll('[data-fit-toggle]');
      const fitContainer = view.querySelector('.aa-view__image');
      const fitImg = view.querySelector('[data-fit-img]');

      if (fitButtons.length && fitContainer && fitImg) {
        const TRANSITION =
          'width .45s cubic-bezier(.4,0,.2,1),' +
          'height .45s cubic-bezier(.4,0,.2,1),' +
          'left .45s cubic-bezier(.4,0,.2,1),' +
          'top .45s cubic-bezier(.4,0,.2,1)';

        let mode = 'cover';     // matches the CSS default
        let handedOff = false;  // has JS taken over geometry?
        let coverRect = null;
        let containRect = null;

        // Compute the two target rects from container size + naturals.
        // Both preserve image aspect ratio, so independent width/height
        // transitions stay aspect-correct at every intermediate frame —
        // which is why object-fit: fill doesn't distort.
        const computeRects = () => {
          const cw = fitContainer.clientWidth;
          const ch = fitContainer.clientHeight;
          const iw = fitImg.naturalWidth;
          const ih = fitImg.naturalHeight;
          if (!cw || !ch || !iw || !ih) return false;
          const sC = Math.min(cw / iw, ch / ih);
          const sV = Math.max(cw / iw, ch / ih);
          containRect = { w: iw * sC, h: ih * sC, l: (cw - iw * sC) / 2, t: (ch - ih * sC) / 2 };
          coverRect   = { w: iw * sV, h: ih * sV, l: (cw - iw * sV) / 2, t: (ch - ih * sV) / 2 };
          return true;
        };

        const applyRect = (rect, animate) => {
          fitImg.style.transition = animate ? TRANSITION : 'none';
          fitImg.style.width  = rect.w + 'px';
          fitImg.style.height = rect.h + 'px';
          fitImg.style.left   = rect.l + 'px';
          fitImg.style.top    = rect.t + 'px';
          if (!animate) fitImg.getBoundingClientRect(); // flush so the next change animates from here
        };

        const syncPressed = (m) => {
          fitButtons.forEach((b) => b.setAttribute('aria-pressed', m === 'contain' ? 'true' : 'false'));
        };

        const setButtonsEnabled = (on) => {
          fitButtons.forEach((b) => { b.disabled = !on; });
        };

        // Disabled until decode — naturalWidth/Height are 0 before then,
        // and a snap-toggle would defeat the animation we're enabling.
        setButtonsEnabled(false);
        const onReady = () => {
          if (fitImg.naturalWidth && fitImg.naturalHeight) setButtonsEnabled(true);
        };
        if (fitImg.complete) onReady();
        else fitImg.addEventListener('load', onReady, { once: true });

        const handoff = () => {
          if (handedOff) return false;
          if (!computeRects()) return false;
          // Override the stylesheet's inset:0 + object-fit:cover with
          // explicit geometry that's pixel-identical to the cover state.
          fitImg.style.objectFit = 'fill';
          fitImg.style.right = 'auto';
          fitImg.style.bottom = 'auto';
          applyRect(coverRect, false);
          handedOff = true;
          return true;
        };

        const setMode = (next, animate) => {
          mode = next;
          root.setAttribute('data-fit', next); // drives icon + label CSS
          applyRect(next === 'cover' ? coverRect : containRect, animate);
          syncPressed(next);
        };

        fitButtons.forEach((btn) => {
          btn.addEventListener('click', () => {
            if (!handedOff) {
              if (!handoff()) return;
              // Two rAFs so the snap commits before the animation starts —
              // otherwise the browser collapses snap + animate into one
              // style change and there's nothing to transition from.
              requestAnimationFrame(() => {
                requestAnimationFrame(() => setMode('contain', true));
              });
              return;
            }
            setMode(mode === 'cover' ? 'contain' : 'cover', true);
          });
        });

        // Recompute on container resize so the rects track viewport
        // changes. CSS handles layout until handoff, so this is a no-op
        // before the first click.
        if (typeof ResizeObserver !== 'undefined') {
          const ro = new ResizeObserver(() => {
            if (!handedOff) return;
            if (!computeRects()) return;
            applyRect(mode === 'cover' ? coverRect : containRect, false);
          });
          ro.observe(fitContainer);
        }
      }
    }
  });
})();
