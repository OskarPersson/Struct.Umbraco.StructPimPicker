angular.module("umbraco")
    .directive("structUmbracoStructPimPickerCollectionSelect", function (structUmbracoStructPimPickerUmbracoHelper, structUmbracoStructPimPickerCollectionService) {
        return {
            restrict: "E",
            replace: true,
            templateUrl: "/App_Plugins/Struct.Umbraco.StructPimPicker/js/directives/collectionSelect/collection.select.directive.html",
            scope: {
                ngModel: "=",
                allowProductCollection: "=",
                allowVariantCollection: "=",
                allowFolder: "=",
                allowMultiple: "="
            },
            link: function (scope, element, attr, ctrl) {
                scope.loaded = false;
                scope.ngModel = scope.ngModel || [];
                scope.rootItems = [];
                scope.numSelections = 0;
                scope.collectionTypes = [];

                if (scope.allowProductCollection) {
                    scope.collectionTypes.push("Product");
                }
                if (scope.allowVariantCollection) {
                    scope.collectionTypes.push("Variant");
                }

                scope.toggleItemSelection = function (item) {
                    if (item.Type === "Folder" && !scope.allowFolder) {
                        if (item.Children != null && item.Children.length > 0) {
                            scope.hideItemChildren(item);
                        } else {
                            scope.showChildren(item);
                        }
                        return;
                    }

                    if (scope.isItemSelected(item)) {
                        scope.removeItem(item);
                    }
                    else {
                        scope.addItem(item);
                    }
                };

                scope.addItem = function (item) {
                    if (item.Type === "Product" && !scope.allowProductCollection) {
                        return;
                    }

                    if (item.Type === "Variant" && !scope.allowVariantCollection) {
                        return;
                    }

                    if (item.Type === "Folder" && !scope.allowFolder) {
                        return;
                    }

                    if (!scope.allowMultiple) {
                        scope.ngModel.splice(0, scope.ngModel.length);
                        scope.numSelections = 0;
                    }

                    scope.ngModel.push(item);
                    if (scope.numSelections == null) {
                        scope.numSelections = 0;
                    }
                    scope.numSelections += 1;
                };

                scope.removeItem = function (item) {
                    scope.ngModel = _.reject(scope.ngModel, function (selectedItem) { return selectedItem.Uid === item.Uid; });
                    scope.numSelections -= 1;
                };

                scope.showChildren = function (parent) {
                    structUmbracoStructPimPickerCollectionService.getCollectionsTree(scope.collectionTypes, parent != null ? parent.Uid : null)
                        .then(function (response) {
                            if (parent) {
                                parent.Children = response.data.Items;
                                parent.IsOpen = true;
                            } else {
                                scope.rootItems = response.data.Items;
                            }

                            scope.loaded = true;
                        }, function (response) {
                            structUmbracoStructPimPickerUmbracoHelper.handleError(response);
                        });
                };

                scope.hideItemChildren = function (item) {
                    item.Children = [];
                    item.IsOpen = false;
                };

                scope.isItemSelected = function (item) {
                    return item && _.some(scope.ngModel, function (selectedItem) { return selectedItem.Uid === item.Uid });
                };

                scope.showChildren(null);
            }
        };
    });