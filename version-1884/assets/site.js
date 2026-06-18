(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initMobileMenu() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var thumbs = Array.prototype.slice.call(document.querySelectorAll("[data-hero-thumb]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
            thumbs.forEach(function (thumb, i) {
                thumb.classList.toggle("is-active", i === index);
            });
        }

        function play() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                play();
            });
        });
        thumbs.forEach(function (thumb) {
            thumb.addEventListener("click", function () {
                show(Number(thumb.getAttribute("data-hero-thumb")) || 0);
                play();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                play();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                play();
            });
        }
        hero.addEventListener("mouseenter", function () {
            window.clearInterval(timer);
        });
        hero.addEventListener("mouseleave", play);
        show(0);
        play();
    }

    function initFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        scopes.forEach(function (scope) {
            var container = scope.parentElement.querySelector("[data-card-container]");
            if (!container) {
                container = document.querySelector("[data-card-container]");
            }
            if (!container) {
                return;
            }
            var cards = Array.prototype.slice.call(container.querySelectorAll("[data-movie-card]"));
            var input = scope.querySelector("[data-card-search]");
            var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-key]"));
            var empty = scope.parentElement.querySelector("[data-empty-state]");
            var active = {};

            function apply() {
                var query = normalize(input ? input.value : "");
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-keywords")
                    ].join(" "));
                    var matchesQuery = !query || haystack.indexOf(query) !== -1;
                    var matchesFilters = Object.keys(active).every(function (key) {
                        var value = active[key];
                        return !value || value === "all" || normalize(card.getAttribute("data-" + key)) === normalize(value);
                    });
                    var shouldShow = matchesQuery && matchesFilters;
                    card.style.display = shouldShow ? "" : "none";
                    if (shouldShow) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            buttons.forEach(function (button) {
                var key = button.getAttribute("data-filter-key");
                var value = button.getAttribute("data-filter-value") || "all";
                if (button.classList.contains("is-active")) {
                    active[key] = value;
                }
                button.addEventListener("click", function () {
                    active[key] = value;
                    buttons.forEach(function (candidate) {
                        if (candidate.getAttribute("data-filter-key") === key) {
                            candidate.classList.toggle("is-active", candidate === button);
                        }
                    });
                    apply();
                });
            });
            if (input) {
                input.addEventListener("input", apply);
            }
            apply();
        });
    }

    function createSearchCard(item) {
        var link = document.createElement("a");
        link.className = "movie-card bg-slate-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-cyan-400 transition-all group";
        link.href = item.url;

        var poster = document.createElement("div");
        poster.className = "poster-frame";
        var img = document.createElement("img");
        img.src = "./" + item.cover;
        img.alt = item.title;
        img.loading = "lazy";
        var shade = document.createElement("div");
        shade.className = "poster-shade";
        var type = document.createElement("span");
        type.className = "type-pill";
        type.textContent = item.type;
        poster.appendChild(img);
        poster.appendChild(shade);
        poster.appendChild(type);

        var body = document.createElement("div");
        body.className = "movie-card-body";
        var title = document.createElement("h3");
        title.textContent = item.title;
        var desc = document.createElement("p");
        desc.className = "line-clamp-2";
        desc.textContent = item.oneLine;
        var meta = document.createElement("div");
        meta.className = "card-meta";
        var region = document.createElement("span");
        region.textContent = item.region;
        var year = document.createElement("span");
        year.textContent = item.year;
        meta.appendChild(region);
        meta.appendChild(year);
        body.appendChild(title);
        body.appendChild(desc);
        body.appendChild(meta);

        link.appendChild(poster);
        link.appendChild(body);
        return link;
    }

    function initSearchPage() {
        var input = document.querySelector("[data-search-page-input]");
        var results = document.querySelector("[data-search-results]");
        var empty = document.querySelector("[data-search-empty]");
        if (!input || !results || !window.SEARCH_MOVIES) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        input.value = initial;

        function render() {
            var query = normalize(input.value);
            var pool = window.SEARCH_MOVIES.filter(function (item) {
                var haystack = normalize([
                    item.title,
                    item.region,
                    item.type,
                    item.year,
                    item.genre,
                    item.tags,
                    item.oneLine
                ].join(" "));
                return !query || haystack.indexOf(query) !== -1;
            }).slice(0, 120);
            results.innerHTML = "";
            pool.forEach(function (item) {
                results.appendChild(createSearchCard(item));
            });
            if (empty) {
                empty.classList.toggle("is-visible", pool.length === 0);
            }
        }

        input.addEventListener("input", render);
        render();
    }

    function initPlayer() {
        var shell = document.querySelector("[data-player]");
        if (!shell) {
            return;
        }
        var video = shell.querySelector("video");
        var cover = shell.querySelector("[data-player-cover]");
        var source = window.__PLAYER_SOURCE__ || "";
        var hls = null;
        var attached = false;

        function attach() {
            if (attached || !source || !video) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function start() {
            attach();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            video.setAttribute("controls", "controls");
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    if (cover) {
                        cover.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (cover) {
            cover.addEventListener("click", start);
        }
        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });
            video.addEventListener("ended", function () {
                if (cover) {
                    cover.classList.remove("is-hidden");
                }
            });
        }
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    ready(function () {
        initMobileMenu();
        initHero();
        initFilters();
        initSearchPage();
        initPlayer();
    });
})();
