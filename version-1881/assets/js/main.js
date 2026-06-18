(function () {
    var ready = function (fn) {
        if (document.readyState !== 'loading') {
            fn();
            return;
        }
        document.addEventListener('DOMContentLoaded', fn);
    };

    ready(function () {
        bindMenu();
        bindHero();
        bindFilters();
        bindPlayers();
        applyInitialQuery();
    });

    function bindMenu() {
        var toggle = document.querySelector('.menu-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    function bindHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
        var prev = document.querySelector('[data-hero="prev"]');
        var next = document.querySelector('[data-hero="next"]');
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-slide')) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        restart();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilter(root) {
        var input = root.querySelector('.search-input');
        var activeChip = root.querySelector('.filter-chip.is-active');
        var keyword = normalize(input ? input.value : '');
        var chip = activeChip ? activeChip.getAttribute('data-filter') : '全部';
        var items = Array.prototype.slice.call(root.querySelectorAll('.search-item'));
        var visible = 0;

        items.forEach(function (item) {
            var haystack = normalize(item.getAttribute('data-search') || item.textContent);
            var matchesText = !keyword || haystack.indexOf(keyword) !== -1;
            var matchesChip = !chip || chip === '全部' || haystack.indexOf(normalize(chip)) !== -1;
            var show = matchesText && matchesChip;
            item.style.display = show ? '' : 'none';
            if (show) {
                visible += 1;
            }
        });

        var empty = root.querySelector('.empty-state');
        if (empty) {
            empty.style.display = visible ? 'none' : 'block';
        }
    }

    function bindFilters() {
        var blocks = Array.prototype.slice.call(document.querySelectorAll('.section-block, .inner-page'));
        blocks.forEach(function (block) {
            var input = block.querySelector('.search-input');
            var chips = Array.prototype.slice.call(block.querySelectorAll('.filter-chip'));
            if (!input && !chips.length) {
                return;
            }

            if (input) {
                input.addEventListener('input', function () {
                    applyFilter(block);
                });
            }

            chips.forEach(function (chip) {
                chip.addEventListener('click', function () {
                    chips.forEach(function (item) {
                        item.classList.remove('is-active');
                    });
                    chip.classList.add('is-active');
                    applyFilter(block);
                });
            });
        });
    }

    function applyInitialQuery() {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (!q) {
            return;
        }
        var input = document.querySelector('.search-input');
        if (input) {
            input.value = q;
            var holder = input.closest('.section-block') || document;
            applyFilter(holder);
        }
    }

    function bindPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('.player-card'));
        players.forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('.play-layer');
            var url = player.getAttribute('data-stream');
            var hlsInstance = null;

            if (!video || !url) {
                return;
            }

            function attach() {
                if (video.getAttribute('data-ready') === 'yes') {
                    return;
                }
                video.setAttribute('data-ready', 'yes');

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = url;
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(url);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (!data || !data.fatal) {
                            return;
                        }
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hlsInstance.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hlsInstance.recoverMediaError();
                        } else {
                            hlsInstance.destroy();
                        }
                    });
                    return;
                }

                video.src = url;
            }

            function start() {
                attach();
                if (button) {
                    button.classList.add('is-hidden');
                }
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        if (button) {
                            button.classList.remove('is-hidden');
                        }
                    });
                }
            }

            if (button) {
                button.addEventListener('click', start);
            }

            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                }
            });

            video.addEventListener('play', function () {
                if (button) {
                    button.classList.add('is-hidden');
                }
            });

            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }
})();
