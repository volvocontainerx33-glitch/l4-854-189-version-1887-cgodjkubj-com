(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var button = document.querySelector(".menu-toggle");
        var menu = document.querySelector(".mobile-menu");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            var open = menu.classList.toggle("is-open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function initCarousel() {
        var hero = document.querySelector("[data-carousel]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
        var prev = hero.querySelector(".hero-prev");
        var next = hero.querySelector(".hero-next");
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initFilters() {
        var input = document.getElementById("page-search");
        var type = document.getElementById("type-filter");
        var year = document.getElementById("year-filter");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-card"));
        var empty = document.querySelector(".no-results");
        if (!cards.length || (!input && !type && !year)) {
            return;
        }

        function getValue(element) {
            return element ? element.value.trim().toLowerCase() : "";
        }

        function apply() {
            var keyword = getValue(input);
            var typeValue = getValue(type);
            var yearValue = getValue(year);
            var visible = 0;
            cards.forEach(function (card) {
                var text = (card.getAttribute("data-search") || "").toLowerCase();
                var cardType = (card.getAttribute("data-type") || "").toLowerCase();
                var cardYear = (card.getAttribute("data-year") || "").toLowerCase();
                var ok = true;
                if (keyword && text.indexOf(keyword) === -1) {
                    ok = false;
                }
                if (typeValue && cardType.indexOf(typeValue) === -1 && text.indexOf(typeValue) === -1) {
                    ok = false;
                }
                if (yearValue && cardYear !== yearValue) {
                    ok = false;
                }
                card.style.display = ok ? "" : "none";
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        [input, type, year].forEach(function (element) {
            if (element) {
                element.addEventListener("input", apply);
                element.addEventListener("change", apply);
            }
        });
        apply();
    }

    window.initMoviePlayer = function (streamUrl, videoId, layerId) {
        var video = document.getElementById(videoId);
        var layer = document.getElementById(layerId);
        var started = false;
        var hls = null;
        if (!video || !streamUrl) {
            return;
        }

        function attach() {
            if (started) {
                return;
            }
            started = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }

        function play() {
            attach();
            if (layer) {
                layer.classList.add("is-hidden");
            }
            var action = video.play();
            if (action && typeof action.catch === "function") {
                action.catch(function () {});
            }
        }

        if (layer) {
            layer.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            if (layer) {
                layer.classList.add("is-hidden");
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    };

    ready(function () {
        initMenu();
        initCarousel();
        initFilters();
    });
})();
