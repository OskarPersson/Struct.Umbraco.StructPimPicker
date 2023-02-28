(function () {
    'use strict';

    var pimPicker = {
        templateUrl: "/App_Plugins/Struct.Umbraco.StructPimPicker/js/directives/PIMPicker/views/pim.picker.html",
        controller: pimPickerCtrl,
        transclude: true,
        bindings: {
            allowMultiple: "=",
            allowProductSelection: "=",
            allowProductGroupSelection: "=",
            allowVariantSelection: "=",
            allowVariantGroupSelection: "=",
            allowProductCollectionSelection: "=",
            allowVariantCollectionSelection: "=",
            defaultCatalogue: "=",
            onlyMaster: "=",
            limitToProductStructures: "=",
            selectOnlySubItems: "=",
            currentItemType: "=",
            currentItemId: "=",
            isDisabled: "=",
            ngModel: "=",
            onChange: "&?"
        }
    };

    function pimPickerCtrl($element, structUmbracoStructPimPickerUmbracoHelper, structUmbracoStructPimPickerMediaService, structUmbracoStructPimPickerProductService, structUmbracoStructPimPickerVariantGroupService, $location, $timeout, editorService) {
        var ctrl = this;
        ctrl.currentNgModel = null;

        ctrl.clearAll = function () {
            ctrl.ngModel.splice(0, ctrl.ngModel.length);

            if (ctrl.onChange) {
                ctrl.onChange();
            }
        };

        ctrl.removeItem = function (item) {
            var index = ctrl.ngModel.indexOf(item);
            if (index != -1) {
                ctrl.ngModel.splice(index, 1);
                $element.controller("form").$setDirty();

                if (ctrl.onChange) {
                    ctrl.onChange();
                }
            }
        };

        ctrl.navigateToItem = function (item) {
            var m = [{ ItemId: item.ItemId, ReferenceType: item.ReferenceType }];
            structUmbracoStructPimPickerProductService.getUrlsForItems(m)
                .then(function (response) {
                    var path = response.data[item.ItemId].substr(1);
                    $location.path(path);
                })
                .catch(function (response) {
                    structUmbracoStructPimPickerUmbracoHelper.handleError(response);
                });
        };

        ctrl.openDialog = function () {
            ctrl.overlay = {
                view: "/App_Plugins/Struct.Umbraco.StructPimPicker/js/directives/PIMPicker/views/pickerdialog.html",
                show: true,
                close: function () {
                    ctrl.overlay = null;
                },
                submit: function (selectedItems) {
                    angular.forEach(selectedItems, function (selectedItem) {
                        var alreadySelected = _.some(ctrl.ngModel, function (item) { return item.ItemId === selectedItem.ItemId && item.ReferenceType === selectedItem.ReferenceType });
                        if (!alreadySelected) {
                            ctrl.ngModel.push(selectedItem);
                        }
                    });

                    $element.controller("form").$setDirty();
                    //ctrl.setThumbnails();
                    ctrl.setItemNames();
                    ctrl.overlay = null;

                    if (ctrl.onChange) {
                        ctrl.onChange();
                    }
                },
                AllowMultiple: ctrl.allowMultiple,
                AllowProductSelection: ctrl.allowProductSelection,
                AllowVariantSelection: ctrl.allowVariantSelection,
                AllowVariantGroupSelection: ctrl.allowVariantGroupSelection,
                AllowProductGroupSelection: ctrl.allowProductGroupSelection,
                AllowProductCollectionSelection: ctrl.allowProductCollectionSelection,
                AllowVariantCollectionSelection: ctrl.allowVariantCollectionSelection,
                OnlyMaster: ctrl.onlyMaster,
                DefaultCatalogue: ctrl.defaultCatalogue,
                LimitToProductStructures: ctrl.limitToProductStructures,
                SelectOnlySubItems: ctrl.selectOnlySubItems,
                CurrentItemType: ctrl.currentItemType,
                CurrentItemId: ctrl.currentItemId
            };
        };

        ctrl.dragStart = function (e, ui) {
            ui.item.data("start", ui.item.index());
        };

        ctrl.dragEnd = function (e, ui) {
            var start = ui.item.data("start");
            var end = ui.item.index();

            $timeout(function () {
                ctrl.ngModel.splice(end, 0, ctrl.ngModel.splice(start, 1)[0]);
                $element.controller("form").$setDirty();
                if (ctrl.onChange) {
                    ctrl.onChange();
                }
            },0);
        };

        ctrl.setItemNames = function () {

            var referencedVariants = [];
            var referencedVariantGroups = [];
            var referencedProducts = [];
            var referencedCategories = [];
            var referencedCollections = [];

            angular.forEach(ctrl.ngModel, function (item) {
                if (item.ReferenceType == 10) {
                    referencedCategories.push(item);
                }
                else if (item.ReferenceType == 20) {
                    referencedProducts.push(item);
                }
                else if (item.ReferenceType == 30) {
                    referencedVariants.push(item);
                }
                else if (item.ReferenceType == 40) {
                    referencedCollections.push(item);
                }
                else if (item.ReferenceType == 60) {
                    referencedVariantGroups.push(item);
                }
            });

            if (referencedCategories.length > 0) {
                var categoryIds = _.pluck(referencedCategories, "ItemId");
                structUmbracoStructPimPickerProductService.getCategoryNames(categoryIds)
                    .then(function (response) {
                        ctrl.setNames(response.data, 10);
                    }, function (response) {
                        structUmbracoStructPimPickerUmbracoHelper.handleError(response);
                    });
            }

            if (referencedProducts.length > 0) {
                var productIds = _.pluck(referencedProducts, "ItemId");
                structUmbracoStructPimPickerProductService.getProductNames(productIds)
                    .then(function (response) {
                        ctrl.setNames(response.data, 20);
                    }, function (response) {
                        structUmbracoStructPimPickerUmbracoHelper.handleError(response);
                    });
            }

            if (referencedVariants.length > 0) {
                var variantIds = _.pluck(referencedVariants, "ItemId");
                structUmbracoStructPimPickerProductService.getVariantNames(variantIds)
                    .then(function (response) {
                        ctrl.setNames(response.data, 30);
                    }, function (response) {
                        structUmbracoStructPimPickerUmbracoHelper.handleError(response);
                    });
            }

            if (referencedVariantGroups.length > 0) {
                var variantGroupIds = _.pluck(referencedVariantGroups, "ItemId");
                structUmbracoStructPimPickerVariantGroupService.getVariantGroupNames(variantGroupIds)
                    .then(function (response) {
                        ctrl.setNames(response.data, 60);
                    }, function (response) {
                        structUmbracoStructPimPickerUmbracoHelper.handleError(response);
                    });
            }

            if (referencedCollections.length > 0) {
                var collectionUids = _.pluck(referencedCollections, "ItemId");
                structUmbracoStructPimPickerProductService.getCollectionNames(collectionUids)
                    .then(function (response) {
                        ctrl.setNames(response.data, 40);
                    }, function (response) {
                        structUmbracoStructPimPickerUmbracoHelper.handleError(response);
                    });
            }
        };

        ctrl.setNames = function (idToNameMap, referenceType) {
            var ids = Object.keys(idToNameMap);
            for (var i = 0; i < ids.length; i++) {
                var itemId = ids[i];
                var name = idToNameMap[itemId];

                var obj = _.find(ctrl.ngModel, function (item) { return item.ItemId == itemId && item.ReferenceType == referenceType; });

                if (obj != null) {
                    obj.ItemName = name;
                }
            }
        };

        ctrl.setThumbnailUrls = function (idToThumbnailIdMap, referenceType) {
            var ids = Object.keys(idToThumbnailIdMap);
            var thumbnailIds = Object.values(idToThumbnailIdMap);

            structUmbracoStructPimPickerMediaService.getByIds(thumbnailIds).then(function (response) {
                var thumbnails = response.data;
                for (var i = 0; i < ids.length; i++) {
                    var itemId = ids[i];
                    var thumbnailId = idToThumbnailIdMap[itemId];
                    var thumbnail = _.find(thumbnails, function (t) { return t.Id == thumbnailId; });

                    var obj = _.find(ctrl.ngModel, function (item) { return item.ItemId == itemId && item.ReferenceType == referenceType; });
                    if (obj != null) {
                        obj.thumbnail = thumbnail;
                    }
                }
            });
        };

        ctrl.setThumbnails = function () {

            var referencedVariants = [];
            var referencedVariantGroups = [];
            var referencedProducts = [];

            angular.forEach(ctrl.ngModel, function (item) {
                if (item.ReferenceType == 20) {
                    referencedProducts.push(item);
                }
                else if (item.ReferenceType == 30) {
                    referencedVariants.push(item);
                }
                else if (item.ReferenceType == 60) {
                    referencedVariantGroups.push(item);
                }
            });

            if (referencedProducts.length > 0) {
                var productIds = _.pluck(referencedProducts, "ItemId");
                structUmbracoStructPimPickerProductService.getProductThumbnails(productIds)
                    .then(function (response) {
                        ctrl.setThumbnailUrls(response.data, 20);
                    }, function (response) {
                        structUmbracoStructPimPickerUmbracoHelper.handleError(response);
                    });
            }

            if (referencedVariants.length > 0) {
                var variantIds = _.pluck(referencedVariants, "ItemId");
                structUmbracoStructPimPickerProductService.getVariantThumbnails(variantIds)
                    .then(function (response) {
                        ctrl.setThumbnailUrls(response.data, 30);
                    }, function (response) {
                        structUmbracoStructPimPickerUmbracoHelper.handleError(response);
                    });
            }

            if (referencedVariantGroups.length > 0) {
                var variantGroupIds = _.pluck(referencedVariantGroups, "ItemId");
                structUmbracoStructPimPickerVariantGroupService.getVariantGroupThumbnails(variantGroupIds)
                    .then(function (response) {
                        ctrl.setThumbnailUrls(response.data, 60);
                    }, function (response) {
                        structUmbracoStructPimPickerUmbracoHelper.handleError(response);
                    });
            }
        };

        ctrl.$onInit = function () {

            ctrl.currentNgModel = ctrl.ngModel;

            if (!ctrl.isDisabled) {
                $element.find(".pim-picker-sortable").sortable({
                    start: ctrl.dragStart,
                    update: ctrl.dragEnd
                });
            }

            //ctrl.setThumbnails();
            ctrl.setItemNames();

            ctrl.$doCheck = function () {
                if (ctrl.currentNgModel != ctrl.ngModel) {
                    ctrl.currentNgModel = ctrl.ngModel;
                    //ctrl.setThumbnails();
                    ctrl.setItemNames();
                }
            }
        };
    }

    angular.module('umbraco').component('structUmbracoStructPimPickerItemPicker', pimPicker);
})();