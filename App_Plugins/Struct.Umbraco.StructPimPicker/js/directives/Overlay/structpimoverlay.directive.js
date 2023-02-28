(function () {
    "use strict";

    function overlayDirective($timeout, structUmbracoStructPimPickerOverlayHelper) {

        function link(scope, el, attr, ctrl) {
            scope.directive = {
                enableConfirmButton: false
            };

            var overlayNumber = 0;
            var numberOfOverlays = 0;
            var isRegistered = false;
            
            function activate() {

                setView();

                $timeout(function () {

                    if (scope.position === "target") {
                        //setTargetPosition();
                    }

                    // this has to be done inside a timeout to ensure the destroy
                    // event on other overlays is run before registering a new one
                    registerOverlay();

                    setOverlayIndent();
                    setTargetPosition();
                });

            }

            function setView() {

                if (scope.view) {

                    if (scope.view.indexOf(".html") === -1) {
                        var viewAlias = scope.view.toLowerCase();
                        scope.view = "views/common/overlays/" + viewAlias + "/" + viewAlias + ".html";
                    }

                }

            }
            
            function registerOverlay() {

                overlayNumber = structUmbracoStructPimPickerOverlayHelper.registerOverlay();

                $(document).bind("keydown.overlay-" + overlayNumber, function (event) {

                    if (event.which === 27) {

                        numberOfOverlays = structUmbracoStructPimPickerOverlayHelper.getNumberOfOverlays();

                        if (numberOfOverlays === overlayNumber) {
                            scope.closeOverLay();
                        }

                        event.preventDefault();
                    }
                });

                isRegistered = true;

            }

            function unregisterOverlay() {
                if (isRegistered) {
                    structUmbracoStructPimPickerOverlayHelper.unregisterOverlay();
                    $(document).unbind("keydown.overlay-" + overlayNumber);
                    isRegistered = false;
                }
            }

            function setOverlayIndent() {

                var overlayIndex = overlayNumber - 1;
                var indentSize = overlayIndex * 20;

                if (scope.position === "center" || scope.position === "target") {
                    var overlayTopPosition = el.context.offsetTop;
                    el.css("top", overlayTopPosition + indentSize);
                }

            }

            function setTargetPosition() {

                var container = $("#contentwrapper");
                var containerLeft = container[0].offsetLeft;
                var containerRight = containerLeft + container[0].offsetWidth;
                var containerTop = container[0].offsetTop;
                var containerBottom = containerTop + container[0].offsetHeight;

                var mousePositionClickX = null;
                var mousePositionClickY = null;
                var elementHeight = null;
                var elementWidth = null;

                var position = {
                    right: "inherit",
                    left: "inherit",
                    top: "inherit",
                    bottom: "inherit"
                };

                // if mouse click position is know place element with mouse in center
                //if (scope.model.event && scope.model.event) {

                    // click position
                    //mousePositionClickX = scope.model.event.pageX;
                    //mousePositionClickY = scope.model.event.pageY;

                    // element size
                    elementHeight = el[0].clientHeight;
                    elementWidth = el[0].clientWidth;

                    // move element to this position
                    position.left = mousePositionClickX - (elementWidth / 2);
                    position.top = mousePositionClickY - (elementHeight / 2);

                    // check to see if element is outside screen
                    // outside right
                    if (position.left + elementWidth > containerRight) {
                        position.right = 0;
                        position.left = "inherit";
                    }

                    // outside bottom
                    if (position.top + elementHeight > containerBottom) {
                        position.bottom = 0;
                        position.top = "inherit";
                    }

                    // outside left
                    if (position.left < containerLeft) {
                        position.left = containerLeft;
                        position.right = "inherit";
                    }

                    // outside top
                    if (position.top < containerTop) {
                        position.top = 0;
                        position.bottom = "inherit";
                    }

                    el.css(position);

                //}

            }
            
            scope.closeOverLay = function () {
                $timeout(function () {
                    unregisterOverlay();

                    if (scope.model.close) {
                        scope.model.close();
                    } else {
                        scope.model.show = false;
                        scope.model = null;
                    }
                });
            };

            // angular does not support ng-show on custom directives
            // with isolated scopes. So we have to make our own.
            if (attr.hasOwnProperty("ngShow") && !attr.hasOwnProperty("ngIf")) {
                scope.$watch("ngShow", function (value) {
                    if (value) {
                        el.show();
                        activate();
                    } else {
                        unregisterOverlay();
                        el.hide();
                    }
                });
            } else {
                activate();
            }

            scope.$on("$destroy", function () {
                unregisterOverlay();
            });

        }

        var directive = {
            transclude: true,
            restrict: "E",
            replace: true,
            templateUrl: "/App_Plugins/Struct.Umbraco.StructPimPicker/js/directives/overlay/struct-pim-overlay.html",
            scope: {
                ngShow: "=",
                model: "=",
                view: "=",
                position: "@" // right, center, target, left
            },
            link: link
        };

        return directive;
    }

    angular.module("umbraco").directive("structUmbracoStructPimPickerOverlay", overlayDirective);

})();
