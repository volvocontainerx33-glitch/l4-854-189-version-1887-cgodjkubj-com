(() => {
  const ready = (fn) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  };

  const uniqueSorted = (cards, attr) => {
    const values = new Set();
    cards.forEach((card) => {
      const value = card.getAttribute(attr);
      if (value) values.add(value);
    });
    return Array.from(values).sort((a, b) => String(b).localeCompare(String(a), 'zh-Hans-CN'));
  };

  const initMobileMenu = () => {
    const button = document.querySelector('[data-mobile-button]');
    const menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) return;
    button.addEventListener('click', () => {
      menu.classList.toggle('open');
      button.textContent = menu.classList.contains('open') ? '×' : '☰';
    });
  };

  const initHero = () => {
    const hero = document.querySelector('[data-hero]');
    if (!hero) return;
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    if (!slides.length) return;
    let index = 0;
    let timer = null;
    const show = (nextIndex) => {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        slide.classList.toggle('opacity-100', i === index);
        slide.classList.toggle('opacity-0', i !== index);
      });
      dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    };
    const start = () => {
      stop();
      timer = window.setInterval(() => show(index + 1), 5200);
    };
    const stop = () => {
      if (timer) window.clearInterval(timer);
      timer = null;
    };
    dots.forEach((dot, i) => dot.addEventListener('click', () => {
      show(i);
      start();
    }));
    if (prev) prev.addEventListener('click', () => {
      show(index - 1);
      start();
    });
    if (next) next.addEventListener('click', () => {
      show(index + 1);
      start();
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  };

  const fillSelect = (select, values) => {
    if (!select) return;
    values.forEach((value) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  };

  const initLocalFilters = () => {
    const panels = Array.from(document.querySelectorAll('[data-local-filters]'));
    panels.forEach((panel) => {
      const root = panel.closest('main') || document;
      const cards = Array.from(root.querySelectorAll('.movie-card-wrap'));
      const searchInput = panel.querySelector('[data-local-search]');
      const regionSelect = panel.querySelector('[data-filter-region]');
      const typeSelect = panel.querySelector('[data-filter-type]');
      const yearSelect = panel.querySelector('[data-filter-year]');
      const categorySelect = panel.querySelector('[data-filter-category]');
      const empty = root.querySelector('[data-empty-state]');

      fillSelect(regionSelect, uniqueSorted(cards, 'data-region'));
      fillSelect(typeSelect, uniqueSorted(cards, 'data-type'));
      fillSelect(yearSelect, uniqueSorted(cards, 'data-year'));

      const params = new URLSearchParams(window.location.search);
      const q = params.get('q') || '';
      if (q && searchInput) searchInput.value = q;

      const apply = () => {
        const keyword = (searchInput?.value || '').trim().toLowerCase();
        const region = regionSelect?.value || '';
        const type = typeSelect?.value || '';
        const year = yearSelect?.value || '';
        const category = categorySelect?.value || '';
        let visible = 0;

        cards.forEach((card) => {
          const text = card.getAttribute('data-search') || '';
          const okKeyword = !keyword || text.includes(keyword);
          const okRegion = !region || card.getAttribute('data-region') === region;
          const okType = !type || card.getAttribute('data-type') === type;
          const okYear = !year || card.getAttribute('data-year') === year;
          const okCategory = !category || card.getAttribute('data-category') === category;
          const ok = okKeyword && okRegion && okType && okYear && okCategory;
          card.classList.toggle('hidden-by-filter', !ok);
          if (ok) visible += 1;
        });

        if (empty) empty.classList.toggle('show', visible === 0);
      };

      [searchInput, regionSelect, typeSelect, yearSelect, categorySelect].forEach((input) => {
        if (!input) return;
        input.addEventListener('input', apply);
        input.addEventListener('change', apply);
      });
      apply();
    });
  };

  const setupVideo = (video) => {
    const stream = video.getAttribute('data-stream');
    if (!stream || video.dataset.ready === '1') return Promise.resolve();
    video.dataset.ready = '1';

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      return Promise.resolve();
    }

    video.src = stream;
    return Promise.resolve();
  };

  const initPlayers = () => {
    const shells = Array.from(document.querySelectorAll('[data-player-shell]'));
    shells.forEach((shell) => {
      const video = shell.querySelector('video');
      const button = shell.querySelector('.player-play');
      if (!video || !button) return;

      const play = () => {
        setupVideo(video).then(() => {
          const attempt = video.play();
          if (attempt && typeof attempt.catch === 'function') {
            attempt.catch(() => {});
          }
          shell.classList.add('playing');
        });
      };

      button.addEventListener('click', play);
      video.addEventListener('play', () => shell.classList.add('playing'));
      video.addEventListener('pause', () => {
        if (video.currentTime === 0 || video.ended) shell.classList.remove('playing');
      });
      video.addEventListener('click', () => {
        if (video.paused) play();
      });
    });
  };

  ready(() => {
    initMobileMenu();
    initHero();
    initLocalFilters();
    initPlayers();
  });
})();
