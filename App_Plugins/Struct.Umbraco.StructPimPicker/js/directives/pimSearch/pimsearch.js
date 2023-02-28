angular.module("structUmbracoStructPimPickerPimSearch", [])
    .directive("structUmbracoStructPimPickerPimSearch", ["$rootScope", "$window", "structUmbracoStructPimPickerUmbracoHelper", "$timeout", "structUmbracoStructPimPickerSearchService",
        function ($rootScope, $window, structUmbracoStructPimPickerUmbracoHelper, $timeout, structUmbracoStructPimPickerSearchService) {
        return {
            restrict: "E",
            scope: {
                listScope: "@",
                allowedTypes: "=",
                defaultSortByFieldUid: "@",
                selectedItems: "=?",
                allowMultipleSelections: "=?"
            },
            templateUrl: "/App_Plugins/Struct.Umbraco.StructPimPicker/js/directives/pimSearch/pimsearch.html",
            link: function (scope, element, attrs, modelCtrl) {
                scope.loaded = false;
                scope.entityTypes = [];
                
                //init selected items
                if (scope.selectedItems == null) {
                    scope.selectedItems = [];
                }
                scope.selectedItems["Product"] = [];
                scope.selectedItems["Variant"] = [];
                scope.selectedItems["VariantGroup"] = [];
                scope.selectedItemsCount = 0;

                scope.setup = {
                    pageSizes: [
                        { id: 10, text: "10" },
                        { id: 25, text: "25" },
                        { id: 50, text: "50" },
                        { id: 100, text: "100" },
                        { id: 500, text: "500" }
                    ],
                    overlay: { show: false, model: {}, view: "" },
                    listFilter: null
                };

                scope.updateSelectedItemsCount = function () {
                    if (scope.config == null || scope.config.entityType == null || scope.selectedItems == null || scope.selectedItems[scope.config.entityType] == null) {
                        scope.selectedItemsCount = 0;
                    }
                    else {
                        scope.selectedItemsCount = Object.keys(scope.selectedItems[scope.config.entityType]).length;
                    }
                };

                scope.getNumberOfSelectedItems = function () {
                    return scope.selectedItemsCount;
                };

                scope.$on("selectedItemsChanged", function (ev, selectedItems) {
                    scope.selectedItems[scope.config.entityType] = selectedItems;
                    scope.updateSelectedItemsCount();
                });

                scope.$on("searchChanged", function (ev, model) {
                    if ($rootScope.pimSearchModel == null) {
                        $rootScope.pimSearchModel = [];
                    }
                    if ($rootScope.pimSearchModel[scope.config.entityType] == null) {
                        $rootScope.pimSearchModel[scope.config.entityType] = [];
                    }
                    $rootScope.pimSearchModel[scope.config.entityType][scope.listScope] = model;
                });

                scope.$on("entityTypeChanged", function (e, model) {
                    scope.updateSelectedItemsCount();
                });

                scope.deselectAll = function () {
                    if (scope.disableItemSelection !== true) {
                        scope.selectedItems[scope.config.entityType] = {};
                        scope.updateSelectedItemsCount();
                        scope.$broadcast("selectedItemsCleared");
                    }
                }

                scope.openHelpDialog = function () {
                    scope.setup.overlay = {
                        view: "/App_Plugins/Struct.Umbraco.StructPimPicker/js/dialogs/pimsearchHelpDialog.html",
                        show: true,
                        close: function () {
                            scope.setup.overlay.show = false;
                            scope.setup.overlay = null;
                        }
                    }
                }

                scope.openListConfiguration = function () {
                    scope.setup.overlay = {
                        view: "/App_Plugins/Struct.Umbraco.StructPimPicker/js/dialogs/pimsearchViewSettingsDialog.html",
                        show: true,
                        close: function () {
                            scope.setup.overlay = null;
                        },
                        submit: function (data) {
                            scope.listConfigurationChanged(data);
                            scope.setup.overlay = null;
                        },
                        itemType: scope.config.entityType,
                        scope: scope.listScope,
                        currentListConfiguration: scope.config.listConfiguration
                    };
                };

                scope.listConfigurationChanged = function (listConfiguration) {
                    scope.config.listConfiguration = listConfiguration;
                    scope.$broadcast("listConfigurationChanged", listConfiguration);
                }

                scope.getListConfiguration = function (callback) {
                    var localListConfiguration = $window.localStorage.getItem("pimsearch_configuration_" + scope.config.entityType + "_" + scope.listScope);

                    if (localListConfiguration != null) {
                        scope.config.listConfiguration = angular.fromJson(localListConfiguration);

                        if (callback != null) {
                            callback();
                        }
                    }
                    else {
                        structUmbracoStructPimPickerSearchService.getCurrentListConfiguration(scope.config.entityType, scope.listScope)
                            .then(function (response) {
                                scope.config.listConfiguration = response.data;
                                if (callback != null) {
                                    callback();
                                }
                            })
                            .catch(function (response) {
                                structUmbracoStructPimPickerUmbracoHelper.handleError(response);
                            });
                    }
                };

                scope.init = function () {
                    if (scope.allowedTypes == null || _.some(scope.allowedTypes, function (type) { return type == "Product" })) {
                        scope.entityTypes.push({ id: "Product", text: "Products" });
                    }
                    if (scope.allowedTypes == null || _.some(scope.allowedTypes, function (type) { return type == "Variant" })) {
                        scope.entityTypes.push({ id: "Variant", text: "Variants" });
                    }
                    if (scope.allowedTypes == null || _.some(scope.allowedTypes, function (type) { return type == "VariantGroup" })) {
                        scope.entityTypes.push({ id: "VariantGroup", text: "Variant groups" });
                    }

                    var pageSize = 25;

                    var entityType = scope.entityTypes[0].id;

                    var model = {};

                    if ($rootScope.pimSearchModel != null && $rootScope.pimSearchModel[entityType] != null && $rootScope.pimSearchModel[entityType][scope.listScope] != null) {
                        model = $rootScope.pimSearchModel[entityType][scope.listScope];
                    }

                    scope.config = {
                        defaultSortByFieldUid: scope.defaultSortByFieldUid,
                        listConfiguration: null,
                        disableItemSelection: null,
                        selectedItems: [],
                        entityType: entityType,
                        listScope: scope.listScope,
                        pageSize: pageSize,
                        page: model.page,
                        sortByDataFieldUid: model.sortByDataFieldUid,
                        sortDescending: model.sortDescending,
                        query: model.query,
                        initializedCallback: scope.searchInitialized,
                        disableItemLink: true,
                        allowMultipleSelections: !(scope.allowMultipleSelections == false)
                    };

                    scope.getListConfiguration(function () {
                        $timeout(function () {
                            scope.$broadcast("initializeSearch", scope.config);
                        }, 100);
                    });

                    scope.$watch(function () { return scope.config.entityType; },
                        function () {
                            if (scope.config.entityType == null) {
                                scope.config.entityType = scope.entityTypes[0].id;
                            }
                            if (scope.loaded === true) {
                                scope.getListConfiguration(function () {
                                    var model = null;
                                    if ($rootScope.pimSearchModel != null && $rootScope.pimSearchModel[scope.config.entityType] != null && $rootScope.pimSearchModel[scope.config.entityType][scope.listScope] != null) {
                                        model = $rootScope.pimSearchModel[scope.config.entityType][scope.listScope];
                                    }
                                    // If user changed entityType and multi select is not allowed, we clear the selected items for all other types
                                    if (!scope.allowMultipleSelections) {
                                        if (scope.config.entityType == "Product") {
                                            scope.selectedItems["Variant"] = [];
                                            scope.selectedItems["VariantGroup"] = [];
                                        } else if (scope.config.entityType == "Variant") {
                                            scope.selectedItems["Product"] = [];
                                            scope.selectedItems["VariantGroup"] = [];
                                        } else if (scope.config.entityType == "VariantGroup") {
                                            scope.selectedItems["Product"] = [];
                                            scope.selectedItems["Variant"] = [];
                                        }
                                    }
                                    scope.$broadcast("entityTypeChanged", { entityType: scope.config.entityType, listConfiguration: scope.config.listConfiguration, selectedItems: scope.selectedItems[scope.config.entityType], searchModel: model });
                                });
                            }
                        });
                };

                scope.searchInitialized = function () {
                    scope.loaded = true;
                }

                $rootScope.selectedItems = scope.selectedItems;
                scope.init();
            }
        }
    }
    ]); 