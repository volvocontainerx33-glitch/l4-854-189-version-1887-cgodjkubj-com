(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initNavigation() {
    var toggle = document.querySelector('.nav-toggle');
    var panel = document.querySelector('.nav-panel');

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener('click', function () {
      var opened = panel.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  function initImages() {
    var images = document.querySelectorAll('.poster-img, .hero-image');

    images.forEach(function (image) {
      image.addEventListener('error', function () {
        var frame = image.closest('.poster-frame, .side-poster, .hero-slide');

        if (frame) {
          frame.classList.add('is-empty');
        }

        image.remove();
      });
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var previous = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    if (slides.length <= 1) {
      return;
    }

    function show(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        start();
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);

    show(0);
    start();
  }

  function initCatalogFilter() {
    var grid = document.getElementById('catalog-grid');
    var search = document.getElementById('movie-search');
    var region = document.getElementById('region-filter');
    var type = document.getElementById('type-filter');
    var year = document.getElementById('year-filter');
    var count = document.getElementById('result-count');

    if (!grid || !search) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (query) {
      search.value = query;
    }

    function valueOf(select, fallback) {
      return select ? select.value : fallback;
    }

    function applyFilter() {
      var keyword = (search.value || '').trim().toLowerCase();
      var regionValue = valueOf(region, 'all');
      var typeValue = valueOf(type, 'all');
      var yearValue = valueOf(year, 'all');
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchRegion = regionValue === 'all' || card.getAttribute('data-region') === regionValue;
        var matchType = typeValue === 'all' || card.getAttribute('data-type') === typeValue;
        var matchYear = yearValue === 'all' || card.getAttribute('data-year') === yearValue;
        var show = matchKeyword && matchRegion && matchType && matchYear;

        card.style.display = show ? '' : 'none';

        if (show) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = String(visible);
      }
    }

    [search, region, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  }

  function initPlayers() {
    var wrappers = document.querySelectorAll('.js-player-wrapper');

    wrappers.forEach(function (wrapper) {
      var video = wrapper.querySelector('video');
      var overlay = wrapper.querySelector('.player-overlay');
      var message = wrapper.querySelector('.player-message');
      var source = wrapper.getAttribute('data-video-src');
      var hlsInstance = null;

      if (!video || !source) {
        return;
      }

      function setMessage(text) {
        if (message) {
          message.textContent = text || '';
        }
      }

      function hideOverlay() {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      }

      function showOverlay() {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      }

      function setupSource() {
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });

          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
            if (data && data.fatal) {
              setMessage('视频加载失败，请检查播放源或稍后重试。');
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else {
          setMessage('当前浏览器暂时无法播放该视频。');
        }
      }

      function playVideo() {
        setupSource.once = setupSource.once || false;

        if (!setupSource.once) {
          setupSource();
          setupSource.once = true;
        }

        hideOverlay();

        var promise = video.play();

        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            showOverlay();
            setMessage('播放未开始，请再次点击播放器。');
          });
        }
      }

      if (overlay) {
        overlay.addEventListener('click', playVideo);
      }

      video.addEventListener('play', hideOverlay);
      video.addEventListener('pause', showOverlay);
      video.addEventListener('ended', showOverlay);
      video.addEventListener('error', function () {
        setMessage('视频加载失败，请检查播放源或稍后重试。');
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    initNavigation();
    initImages();
    initHero();
    initCatalogFilter();
    initPlayers();
  });
})();
