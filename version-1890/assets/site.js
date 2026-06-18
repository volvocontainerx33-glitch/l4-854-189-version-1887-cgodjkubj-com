(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('is-hidden');
    });
  });

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  var searchInput = document.querySelector('[data-search-input]');
  var clearSearch = document.querySelector('[data-clear-search]');
  var searchEmpty = document.querySelector('[data-search-empty]');
  var scope = document.querySelector('[data-card-scope]') || document;
  var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));

  function filterCards() {
    var query = normalize(searchInput && searchInput.value);
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-meta'),
        card.textContent
      ].join(' '));
      var matched = !query || text.indexOf(query) !== -1;
      card.classList.toggle('is-hidden', !matched);
      if (matched) {
        visible += 1;
      }
    });

    if (searchEmpty) {
      searchEmpty.classList.toggle('is-visible', visible === 0 && query.length > 0);
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterCards);
  }

  if (clearSearch && searchInput) {
    clearSearch.addEventListener('click', function () {
      searchInput.value = '';
      filterCards();
      searchInput.focus();
    });
  }

  function setupPlayer(player) {
    var video = player.querySelector('video');
    var playButtons = Array.prototype.slice.call(player.querySelectorAll('[data-player-play]'));
    var muteButton = player.querySelector('[data-player-mute]');
    var fullscreenButton = player.querySelector('[data-player-fullscreen]');
    var cover = player.querySelector('.player-cover');
    var message = player.querySelector('[data-player-message]');

    if (!video) {
      return;
    }

    var stream = video.getAttribute('data-stream');
    var hlsInstance = null;

    function setMessage(text) {
      if (message) {
        message.textContent = text || '';
      }
    }

    function attachStream() {
      if (!stream) {
        setMessage('视频加载失败');
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            setMessage('视频加载失败');
            if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
            }
          }
        });
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        return;
      }

      video.src = stream;
    }

    function playVideo() {
      attachStream.once = attachStream.once || false;
      if (!attachStream.once) {
        attachStream();
        attachStream.once = true;
      }

      var promise = video.paused ? video.play() : video.pause();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          setMessage('点击播放按钮继续观看');
        });
      }
    }

    playButtons.forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        playVideo();
      });
    });

    if (muteButton) {
      muteButton.addEventListener('click', function () {
        video.muted = !video.muted;
        muteButton.textContent = video.muted ? '取消静音' : '静音';
      });
    }

    if (fullscreenButton) {
      fullscreenButton.addEventListener('click', function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (player.requestFullscreen) {
          player.requestFullscreen();
        }
      });
    }

    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
      setMessage('');
    });

    video.addEventListener('pause', function () {
      if (cover && video.currentTime === 0) {
        cover.classList.remove('is-hidden');
      }
    });

    video.addEventListener('error', function () {
      setMessage('视频加载失败');
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.querySelectorAll('[data-player]').forEach(setupPlayer);
})();
