(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMobileNav() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        if (!slides.length) {
            return;
        }
        var dotsWrap = document.querySelector("[data-hero-dots]");
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        var current = 0;
        var dots = [];

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        if (dotsWrap) {
            slides.forEach(function (_, index) {
                var dot = document.createElement("button");
                dot.type = "button";
                dot.setAttribute("aria-label", "切换推荐 " + (index + 1));
                dot.addEventListener("click", function () {
                    show(index);
                });
                dotsWrap.appendChild(dot);
                dots.push(dot);
            });
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
            });
        }

        show(0);
        window.setInterval(function () {
            show(current + 1);
        }, 5200);
    }

    function initFilters() {
        var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));
        forms.forEach(function (form) {
            var scope = form.closest("main") || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
            var search = form.querySelector("[data-search-input]");
            var year = form.querySelector("[data-year-select]");
            var type = form.querySelector("[data-type-select]");
            var category = form.querySelector("[data-category-select]");

            function value(control) {
                return control ? control.value.trim().toLowerCase() : "";
            }

            function apply() {
                var query = value(search);
                var yearValue = value(year);
                var typeValue = value(type);
                var categoryValue = value(category);
                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-search") || "").toLowerCase();
                    var matchQuery = !query || text.indexOf(query) !== -1;
                    var matchYear = !yearValue || (card.getAttribute("data-year") || "").toLowerCase().indexOf(yearValue) === 0;
                    var matchType = !typeValue || (card.getAttribute("data-type") || "").toLowerCase().indexOf(typeValue) !== -1;
                    var matchCategory = !categoryValue || (card.getAttribute("data-category") || "") === categoryValue;
                    card.classList.toggle("hidden-card", !(matchQuery && matchYear && matchType && matchCategory));
                });
            }

            form.addEventListener("input", apply);
            form.addEventListener("change", apply);
            form.addEventListener("reset", function () {
                window.setTimeout(apply, 0);
            });
        });
    }

    function initQuickSearch() {
        var form = document.querySelector("[data-quick-search]");
        if (!form) {
            return;
        }
        var input = form.querySelector("input");
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var query = input ? input.value.trim() : "";
            var target = "./search.html";
            if (query) {
                target += "?q=" + encodeURIComponent(query);
            }
            window.location.href = target;
        });
    }

    function applySearchQuery() {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (!query) {
            return;
        }
        var input = document.querySelector("[data-search-input]");
        if (input) {
            input.value = query;
            input.dispatchEvent(new Event("input", { bubbles: true }));
        }
    }

    ready(function () {
        initMobileNav();
        initHero();
        initFilters();
        initQuickSearch();
        applySearchQuery();
    });
})();
