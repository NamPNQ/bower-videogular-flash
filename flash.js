"use strict";
angular.module("info.vietnamcode.nampnq.videogular.plugins.flash", [])
    .directive(
        "vgFlashPlayer", ["VG_EVENTS", "VG_STATES", "$rootScope", "$window", '$timeout',
            function(VG_EVENTS, VG_STATES, $rootScope, $window, $timeout) {
                return {
                    restrict: "E",
                    require: "^videogular",
                    template: "<div id='videoPlayer_{{playerId}}' ></div>",
                    scope: {},
                    link: function(scope, elem, attr, API) {
                        scope.playerId = Date.now();
                        var result = {}, formats = {
                                'video/flv': 'FLV',
                                'video/x-flv': 'FLV',
                                'video/mp4': 'MP4',
                                'video/m4v': 'MP4'
                            };
                        var videogularElementScope = scope.$parent.$$childHead;
                        $window.onSWFReady = function(playerId) {
                            if (playerId == "videoPlayer_" + scope.playerId) {
                                console.log("Swf ready");
                                console.log(arguments);
                            }
                        };
                        $window.onSWFEvent = function(playerId, eventName) {
                            if (playerId == "videoPlayer_" + scope.playerId) {
                                console.log(arguments);
                                if (eventName == "waiting") {
                                    videogularElementScope.onStartBuffering({
                                        target: API.videoElement[0]
                                    })
                                } else if (eventName == "ended") {
                                    videogularElementScope.onComplete({
                                        target: API.videoElement[0]
                                    });
                                } else if (eventName == "playing") {
                                    videogularElementScope.onStartPlaying({
                                        target: API.videoElement[0]
                                    })
                                } else if (eventName == "play") {
                                    videogularElementScope.updateSize();
                                }
                            }
                        };
                        $window.onSWFErrorEvent = function(playerId) {
                            console.log(arguments);
                        };

                        function canPlay(type) {
                            return type in formats;
                        }

                        function init() {
                            getSource();
                            if (result.method == "flash") {
                                console.log("init");
                                createSWF();
                            } else {
                                console.log("Your video source can't play with flash");
                            }

                        }

                        function setProperties() {
                            API.videoElement[0].vjs_setProperty("eventProxyFunction", "onSWFEvent");
                            API.videoElement[0].vjs_setProperty("errorEventProxyFunction", "onSWFErrorEvent");
                            API.videoElement[0].__defineGetter__("currentTime", function() {
                                return API.videoElement[0].vjs_getProperty("currentTime");
                            });
                            API.videoElement[0].__defineSetter__("currentTime", function(seconds) {
                                return API.videoElement[0].vjs_setProperty("currentTime", seconds);
                            });
                            API.videoElement[0].__defineGetter__("duration", function() {
                                return API.videoElement[0].vjs_getProperty("duration");
                            });
                            API.videoElement[0].__defineGetter__("paused", function() {
                                return API.videoElement[0].vjs_getProperty("paused");
                            });
                            API.videoElement[0].__defineGetter__("videoWidth", function() {
                                return API.videoElement[0].vjs_getProperty("videoWidth");
                            });
                            API.videoElement[0].__defineGetter__("videoHeight", function() {
                                return API.videoElement[0].vjs_getProperty("videoHeight");
                            });
                            API.videoElement[0].__defineGetter__("volume", function() {
                                return API.videoElement[0].vjs_getProperty("volume");
                            });
                            API.videoElement[0].__defineSetter__("volume", function(volume) {
                                return API.videoElement[0].vjs_setProperty("volume", volume);
                            });
                            API.videoElement[0].play = function() {
                                API.videoElement[0].vjs_play();
                            }
                            API.videoElement[0].pause = function() {
                                API.videoElement[0].vjs_pause();
                            };

                            setInterval(function() {
                                videogularElementScope.onUpdateTime({
                                    target: API.videoElement[0]
                                })
                            }, 600);
                        }

                        function setSource(e) {
                            API.videoElement[0].vjs_src(result.url);

                        }


                        function waitForSWF() {
                            API.videoElement = elem.find("#videoPlayer_" + scope.playerId);
                            console.log("Waiting for the SWF to be loaded...");
                            if (API.videoElement[0].hasOwnProperty("vjs_setProperty")) {
                                setProperties();
                                setSource();
                            } else {
                                setTimeout(waitForSWF, 100);
                            }
                        }

                        function createSWF() {
                            var flashvars = {
                                readyFunction: "onSWFReady",
                                eventProxyFunction: "onSWFEvent",
                                errorEventProxyFunction: "onSWFErrorEvent",
                                src: "",
                                autoplay: false,
                                preload: false
                            };

                            var params = {
                                allowScriptAccess: "always",
                                allowNetworking: "all",
                                wmode: "opaque",
                                bgcolor: "#000000"
                            };

                            var attributes = {
                                id: "videoPlayer_" + scope.playerId,
                                name: "videoPlayer_" + scope.playerId
                            };
                            $window.swfobject.createCSS("#videoPlayer_" + scope.playerId, "position: absolute;");
                            $window.swfobject.embedSWF("video-js.swf", "videoPlayer_" + scope.playerId, "100%", "100%", "10.3", "", flashvars, params, attributes);
                            API.videoElement.remove();
                            setTimeout(waitForSWF, 100);


                        };

                        function getSource() {
                            var i, n, src, type, media, mediaFiles = [],
                                htmlMediaElement = API.videoElement[0];
                            for (i = 0; i < htmlMediaElement.childNodes.length; i++) {
                                n = htmlMediaElement.childNodes[i];
                                if (n.nodeType == 1 && n.tagName.toLowerCase() == 'source') {
                                    src = n.getAttribute('src');
                                    type = n.getAttribute('type');
                                    media = n.getAttribute('media');

                                    if (!media || !window.matchMedia || (window.matchMedia && window.matchMedia(media).matches)) {
                                        mediaFiles.push({
                                            type: type,
                                            url: src
                                        });
                                    }
                                }
                            };
                            for (i = 0; i < mediaFiles.length; i++) {
                                // normal check
                                if (canPlay(mediaFiles[i].type)) {
                                    result.method = 'flash';
                                    result.url = mediaFiles[i].url;
                                    break;
                                }
                            }
                        }
                        $timeout(init);

                    }
                }
            }
        ]);
