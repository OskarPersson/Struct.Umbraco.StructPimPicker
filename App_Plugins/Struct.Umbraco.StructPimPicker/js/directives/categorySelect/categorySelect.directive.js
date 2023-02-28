angular.module("umbraco")
    .directive("structUmbracoStructPimPickerCategorySelect", function (structUmbracoStructPimPickerUmbracoHelper, structUmbracoStructPimPickerCatalogueService, $routeParams) {
        return {
            restrict: "E",
            replace: true,
            templateUrl: "/App_Plugins/Struct.Umbraco.StructPimPicker/js/directives/categorySelect/categorySelect.directive.html",
            scope: {
                ngModel: "=",
                onlyMaster: "=",
                allowMultiple: "=",
                allowCatalogueSelect: "=",
                excludeCategoryIds: "=",
                onlyThisCatalogue: "=",
                allowDynamic: "="
            },
            link: function (scope, element, attr, ctrl) {
                scope.loaded = false;
                scope.numSelections = 0;

                scope.ngModel = scope.ngModel || [];

                scope.$watch(
                    function (scope) { return scope.onlyThisCatalogue; },
                    function (current, old) {
                        scope.getCatalogues();
                    }, true);

                scope.toggleCatalogueSelection = function (catalogue) {
                    if (scope.allowCatalogueSelect) {
                        if (!scope.isCatalogueSelected(catalogue)) {
                            scope.addCatalogue(catalogue);
                        }
                        else {
                            scope.removeCatalogue(catalogue);
                        }
                    }
                };

                scope.toggleCategorySelection = function (category) {
                    if (scope.isCategoryExcluded(category.Id) || (category.Dynamic && !scope.allowDynamic)) {
                        return;
                    }
                    if (!scope.isCategorySelected(category)) {
                        scope.addCategory(category);
                    }
                    else {
                        scope.removeCategory(category);
                    }
                };

                scope.isCategoryExcluded = function (categoryId) {
                    if (scope.excludeCategoryIds == null) {
                        return false;
                    }
                    return scope.excludeCategoryIds.indexOf(categoryId) >= 0;
                }

                scope.addCategory = function (category) {
                    if (!scope.allowMultiple) {
                        scope.numSelections = 0;
                        scope.ngModel.splice(0, scope.ngModel.length);
                    }
                    scope.ngModel.push({ Name: category.Name, CategoryId: category.Id, CatalogueUid: category.CatalogueUid });

                    if (scope.numSelections == null) {
                        scope.numSelections = 0;
                    }
                    scope.numSelections += 1;
                };

                scope.removeCategory = function (category) {
                    scope.ngModel = _.reject(scope.ngModel, function (item) { return item.CategoryId === category.Id; });
                    if (scope.currentCatalogue != null) {
                        scope.currentCatalogue.numSelections -= 1;
                    }

                    scope.numSelections -= 1;
                };

                scope.addCatalogue = function (catalogue) {
                    if (!scope.allowMultiple) {
                        scope.ngModel.splice(0, scope.ngModel.length);
                    }
                    scope.ngModel.push({ Name: catalogue.Label, CategoryId: null, CatalogueUid: catalogue.Uid });
                };

                scope.removeCatalogue = function (catalogue) {
                    scope.ngModel = _.reject(scope.ngModel, function (item) { return item.CatalogueUid === catalogue.Uid && item.CategoryId === null; });
                    if (scope.currentCatalogue != null) {
                        scope.currentCatalogue.numSelections -= 1;
                    }
                };

                scope.getCatalogues = function () {
                    structUmbracoStructPimPickerCatalogueService.getBasicCatalogues()
                        .then(function (response) {
                            scope.catalogues = [];
                            angular.forEach(response.data, function (catalogue) {
                                //Add all catalogues
                                if ((scope.onlyMaster == false || catalogue.IsMaster) && (scope.onlyThisCatalogue == null || scope.onlyThisCatalogue == undefined || scope.onlyThisCatalogue == catalogue.Uid)) {
                                    scope.catalogues.push(catalogue);
                                }
                            });

                            scope.loaded = true;
                        }, function (response) {
                            structUmbracoStructPimPickerUmbracoHelper.handleError(response);
                        });
                };

                scope.showCatalogueChildren = function (catalogue) {
                    structUmbracoStructPimPickerCatalogueService.getCatalogueChildren(catalogue.Uid)
                        .then(function (response) {
                            catalogue.SubCategories = response.data;
                            catalogue.IsOpen = true;
                            scope.loaded = true;
                        }, function (response) {
                            structUmbracoStructPimPickerUmbracoHelper.handleError(response);
                        });
                };

                scope.hideCatalogueChildren = function (catalogue) {
                    catalogue.SubCategories = [];
                    catalogue.IsOpen = false;
                };

                scope.isCatalogueSelected = function (catalogue) {
                    return _.some(scope.ngModel, function (item) { return item.CatalogueUid === catalogue.Uid && item.CategoryId === null; });
                };

                scope.showCategoryChildren = function (category) {
                    structUmbracoStructPimPickerCatalogueService.getCategoryChildren(category.Id)
                        .then(function (response) {
                            category.SubCategories = response.data;
                            category.IsOpen = true;
                            scope.loaded = true;
                        }, function (response) {
                            structUmbracoStructPimPickerUmbracoHelper.handleError(response);
                        });
                };

                scope.hideCategoryChildren = function (category) {
                    category.SubCategories = [];
                    category.IsOpen = false;
                };

                scope.isCategorySelected = function (category) {
                    return _.some(scope.ngModel, function (item) { return item.CategoryId === category.Id; });
                };

                scope.getCatalogues();
            }
        };
    });