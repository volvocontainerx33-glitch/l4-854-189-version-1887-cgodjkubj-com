(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
    initImages();
  });

  function initMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-nav]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function initHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      if (slides.length > 1) {
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5000);
      }
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    var panel = document.querySelector('[data-filter-panel]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card-list] .movie-card, [data-card-list] .list-card'));
    if (!panel || !cards.length) {
      return;
    }

    var input = panel.querySelector('[data-filter-input]');
    var year = panel.querySelector('[data-filter-year]');
    var region = panel.querySelector('[data-filter-region]');
    var type = panel.querySelector('[data-filter-type]');
    var category = panel.querySelector('[data-filter-category]');
    var reset = panel.querySelector('[data-filter-reset]');
    var params = new URLSearchParams(window.location.search);

    if (input && params.get('q')) {
      input.value = params.get('q');
    }
    if (year && params.get('year')) {
      year.value = params.get('year');
    }
    if (region && params.get('region')) {
      region.value = params.get('region');
    }
    if (type && params.get('type')) {
      type.value = params.get('type');
    }
    if (category && params.get('category')) {
      category.value = params.get('category');
    }

    function includes(value, query) {
      return String(value || '').toLowerCase().indexOf(query) !== -1;
    }

    function apply() {
      var q = input ? input.value.trim().toLowerCase() : '';
      var y = year ? year.value : '';
      var r = region ? region.value : '';
      var t = type ? type.value : '';
      var c = category ? category.value : '';

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre')
        ].join(' ').toLowerCase();

        var ok = true;
        if (q && !includes(text, q)) {
          ok = false;
        }
        if (y && card.getAttribute('data-year') !== y) {
          ok = false;
        }
        if (r && card.getAttribute('data-region') !== r) {
          ok = false;
        }
        if (t && card.getAttribute('data-type') !== t) {
          ok = false;
        }
        if (c && card.getAttribute('data-category') !== c) {
          ok = false;
        }
        card.hidden = !ok;
      });
    }

    [input, year, region, type, category].forEach(function (control) {
      if (!control) {
        return;
      }
      control.addEventListener('input', apply);
      control.addEventListener('change', apply);
    });

    if (reset) {
      reset.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        [year, region, type, category].forEach(function (control) {
          if (control) {
            control.value = '';
          }
        });
        apply();
      });
    }

    apply();
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));
    players.forEach(function (shell) {
      var video = shell.querySelector('video');
      var overlay = shell.querySelector('.player-overlay');
      var buttons = Array.prototype.slice.call(shell.querySelectorAll('[data-play]'));
      var stream = shell.getAttribute('data-stream');
      var loaded = false;
      var hls = null;

      if (!video || !stream) {
        return;
      }

      function attach() {
        if (loaded) {
          return;
        }
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          video.load();
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          return;
        }
        video.src = stream;
        video.load();
      }

      function play() {
        attach();
        video.controls = true;
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            if (overlay) {
              overlay.classList.remove('is-hidden');
            }
          });
        }
      }

      buttons.forEach(function (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          play();
        });
      });

      if (overlay) {
        overlay.addEventListener('click', play);
      }

      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });

      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });

      video.addEventListener('pause', function () {
        if (overlay && video.currentTime === 0) {
          overlay.classList.remove('is-hidden');
        }
      });

      window.addEventListener('pagehide', function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  }

  function initImages() {
    Array.prototype.slice.call(document.querySelectorAll('img')).forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('image-missing');
      }, { once: true });
    });
  }
})();
