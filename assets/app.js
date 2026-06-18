
(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var hero = document.querySelector(".hero-slider");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
        dot.setAttribute("aria-current", dotIndex === current ? "true" : "false");
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });
    show(0);
    restart();
  }

  function setupFilters() {
    var sections = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    sections.forEach(function (section) {
      var search = section.querySelector(".js-search");
      var type = section.querySelector(".js-type-filter");
      var empty = section.querySelector(".empty-state");
      var items = Array.prototype.slice.call(section.querySelectorAll(".movie-card, .compact-item, .ranking-item"));
      if (!items.length || (!search && !type)) {
        return;
      }

      function update() {
        var query = search ? search.value.trim().toLowerCase() : "";
        var selected = type ? type.value : "all";
        var visible = 0;
        items.forEach(function (item) {
          var content = ((item.getAttribute("data-title") || "") + " " + (item.getAttribute("data-meta") || "")).toLowerCase();
          var itemType = item.getAttribute("data-type") || "";
          var matchesQuery = !query || content.indexOf(query) !== -1;
          var matchesType = selected === "all" || itemType.indexOf(selected) !== -1;
          var show = matchesQuery && matchesType;
          item.classList.toggle("is-hidden-card", !show);
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      if (search) {
        search.addEventListener("input", update);
      }
      if (type) {
        type.addEventListener("change", update);
      }
      update();
    });
  }

  window.initPlayer = function (sourceUrl) {
    var video = document.getElementById("moviePlayer");
    var cover = document.getElementById("playCover");
    if (!video || !cover || !sourceUrl) {
      return;
    }
    var loaded = false;
    var hls = null;

    function attachSource() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
    }

    function start() {
      attachSource();
      cover.classList.add("is-hidden");
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          video.controls = true;
        });
      }
    }

    cover.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      cover.classList.add("is-hidden");
    });
    window.addEventListener("beforeunload", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
