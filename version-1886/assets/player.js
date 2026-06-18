(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initPlayer(root) {
        var video = root.querySelector("video");
        var cover = root.querySelector(".player-cover");
        var start = root.querySelector(".player-start");
        var mute = root.querySelector(".player-mute");
        var fullscreen = root.querySelector(".player-fullscreen");
        var message = root.querySelector(".player-message");
        var source = root.getAttribute("data-video");
        var hls = null;
        var loaded = false;

        if (!video || !source) {
            return;
        }

        function showMessage(text) {
            if (!message) {
                return;
            }
            message.textContent = text;
            message.classList.add("show");
        }

        function load() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (_, data) {
                    if (data && data.fatal) {
                        showMessage("暂时无法播放，请稍后再试");
                    }
                });
                return;
            }
            video.src = source;
        }

        function play() {
            load();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            var attempt = video.play();
            if (attempt && attempt.catch) {
                attempt.catch(function () {
                    showMessage("点击播放按钮开始观看");
                });
            }
        }

        function togglePlay() {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        }

        if (cover) {
            cover.addEventListener("click", play);
        }
        if (start) {
            start.addEventListener("click", function (event) {
                event.stopPropagation();
                play();
            });
        }
        video.addEventListener("click", togglePlay);
        video.addEventListener("play", function () {
            root.classList.add("playing");
        });
        video.addEventListener("pause", function () {
            root.classList.remove("playing");
        });
        video.addEventListener("error", function () {
            showMessage("暂时无法播放，请稍后再试");
        });

        if (mute) {
            mute.addEventListener("click", function () {
                video.muted = !video.muted;
                mute.textContent = video.muted ? "开声" : "静音";
            });
        }

        if (fullscreen) {
            fullscreen.addEventListener("click", function () {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else if (root.requestFullscreen) {
                    root.requestFullscreen();
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
        Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(initPlayer);
    });
})();
