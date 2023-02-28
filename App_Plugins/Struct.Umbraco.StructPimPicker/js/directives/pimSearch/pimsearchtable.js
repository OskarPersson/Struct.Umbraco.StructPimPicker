angular.module("structUmbracoStructPimPickerPimSearchTable", [])
    .directive("structUmbracoStructPimPickerPimSearchTable", [
        "$q", "structUmbracoStructPimPickerUmbracoHelper", "$timeout", "structUmbracoStructPimPickerSearchService", function ($q, structUmbracoStructPimPickerUmbracoHelper, $timeout, structUmbracoStructPimPickerSearchService) {
            return {
                restrict: "E",
                scope: {},
                templateUrl: "/App_Plugins/Struct.Umbraco.StructPimPicker/js/directives/pimsearch/pimsearchtable.html",
                link: function (scope, element, attrs, modelCtrl) {

                    scope.viewModel = { directSearch: {} };
                    scope.timer = false;
                    scope.searching = false;
                    scope.menuShow = false;
                    scope.isSelecting = false;
                    scope.autoSearch = true;
                    scope.indexIsUpToDate = true;

                    //--Config model--
                    //defaultFilter - filter to apply to all searches (Optional - default null)
                    //defaultSortByFieldUid - Default field to sort by (Optional - default null)
                    //listConfiguration - list configuration to use (Mandatory)
                    //disableItemSelection - disable item selection functionality (Optional - default false)
                    //disableItemLink - disable item link (Optional - default false)
                    //selectedItems - selected items at startup (Optional - default null)
                    //entityType - type of items to search (Mandatory)
                    //pageSize - page size (Mandatory)
                    //page - start page (Optional - default 1)
                    //sortByDataFieldUid - sort by this field (Optional - null)
                    //sortDescending - sort descending (true/false) (Optional - default false)
                    //query - initial simple query to map to search (Optional - default null)
                    //initializedCallback - callback to call when search is initialized (Optional - default null)
                    //allowMultipleSelections - Set to false if only one item can be selected (Optional - default true)

                    scope.$on("initializeSearch", function (e, config) {
                        scope.config = config;
                        scope.config.page = scope.config.page == null ? 1 : scope.config.page;
                        scope.config.sortDescending = scope.config.sortDescending == null ? false : scope.config.sortDescending;

                        if (scope.config.pageSize == null) {
                            throw "Page size must be specified in config";
                        }

                        if (scope.config.entityType == null) {
                            throw "etityType must be specified in config";
                        }

                        if (scope.config.listConfiguration == null) {
                            throw "listConfiguration must be specified in config";
                        }

                        var sortByFieldUid = scope.config.sortByDataFieldUid;

                        if (sortByFieldUid == null) {
                            sortByFieldUid = scope.config.defaultSortByFieldUid;
                        }

                        scope.model = {
                            searchDefinition: {
                                Uid: "760c9086-1254-4b44-b35f-da29b54ba94e",
                                EntityType: scope.config.entityType,
                                Page: scope.config.page,
                                PageSize: scope.config.pageSize,
                                Query: scope.config.query,
                                SortByFieldUid: sortByFieldUid,
                                SortDescending: scope.config.sortDescending
                            }
                        };

                        if (scope.config.query != null) {
                            scope.mapQueryToViewModel();
                        }

                        scope.initListeners();
                        scope.search(config.initializedCallback);
                    });

                    scope.toggleIncludeArchived = function () {
                        if (scope.viewModel.includeArchived == null) {
                            scope.viewModel.includeArchived = true;
                        } else {
                            scope.viewModel.includeArchived = !scope.viewModel.includeArchived;
                        }
                        scope.search();
                    }

                    scope.selectAllVisible = function () {
                        if (scope.config.disableItemSelection !== true) {
                            angular.forEach(scope.searchResult.ListItems, function (listItem) {
                                if (!scope.isItemSelected(listItem.Id)) {
                                    scope.addItem(listItem.Id, false);
                                }
                            });
                            scope.setup.menuShow = false;
                            scope.$emit("selectedItemsChanged", scope.config.selectedItems);
                        }
                    }

                    scope.deselectAllVisible = function () {
                        if (scope.config.disableItemSelection !== true) {
                            angular.forEach(scope.searchResult.ListItems, function (listItem) {
                                if (scope.isItemSelected(listItem.Id)) {
                                    scope.removeItem(listItem.Id, true);
                                }
                            });
                            scope.setup.menuShow = false;
                            scope.$emit("selectedItemsChanged", scope.config.selectedItems);
                        }
                    }

                    scope.deselectAll = function () {
                        if (scope.config.disableItemSelection !== true) {
                            scope.config.selectedItems = [];
                            scope.$emit("selectedItemsChanged", scope.config.selectedItems);
                        }
                    }

                    scope.selectAll = function () {
                        if (scope.config.disableItemSelection !== true) {
                            scope.searching = true;
                            var model = {
                                SearchDefinition: scope.model.searchDefinition,
                                Filter: scope.config.listFilter

                            };

                            structUmbracoStructPimPickerSearchService.getAllUidsInSearchResult(model)
                                .then(function (response) {
                                    angular.forEach(response.data, function (itemUid) {
                                        if (!scope.isItemSelected(itemUid)) {
                                            scope.addItem(itemUid, true);
                                        }
                                    });
                                    scope.searching = false;
                                    scope.$emit("selectedItemsChanged", scope.config.selectedItems);
                                })
                                .catch(function (response) {
                                    structUmbracoStructPimPickerUmbracoHelper.handleError(response);
                                    scope.searching = false;
                                });
                            scope.menuShow = false;
                        }
                    }

                    scope.removeItem = function (itemUid, disableEmit) {
                        delete scope.config.selectedItems[itemUid];
                        if (disableEmit !== true) {
                            scope.$emit("selectedItemsChanged", scope.config.selectedItems);
                        }
                    }

                    scope.addItem = function (itemUid, disableEmit) {
                        if (!scope.config.allowMultipleSelections) {
                            scope.config.selectedItems = [];
                        }
                        scope.config.selectedItems[itemUid] = 1;
                        if (disableEmit !== true) {
                            scope.$emit("selectedItemsChanged", scope.config.selectedItems);
                        }
                    }

                    scope.toggleItemSelection = function (itemUid) {
                        if (scope.isItemSelected(itemUid)) {
                            scope.removeItem(itemUid);
                        } else {
                            scope.addItem(itemUid);
                        }
                    }

                    scope.isItemSelected = function (itemUid) {
                        return scope.config.selectedItems[itemUid] !== undefined;
                    }

                    scope.goToPage = function (page) {
                        scope.model.searchDefinition.Page = page;
                        scope.search();
                        scope.$emit("searchChanged", {
                            query: scope.mapViewModelToQuery(),
                            sortByFieldUid: scope.model.searchDefinition.SortByFieldUid,
                            sortDescending: scope.model.searchDefinition.SortDescending,
                            page: page
                        });
                    }

                    scope.clearSearch = function () {
                        scope.viewModel.directSearch = {};
                        scope.model.searchDefinition.SortByFieldUid = null;
                        scope.search();
                    }

                    scope.searchOnEnter = function (keyEvent) {
                        if (event.key === "Enter") {
                            scope.search();
                            keyEvent.preventDefault();
                        }
                    }

                    scope.searchOnTimeout = function () {
                        if (scope.autoSearch) {
                            if (scope.timer) {
                                $timeout.cancel(scope.timer);
                            };
                            scope.timer = $timeout(function () {
                                scope.model.searchDefinition.Page = 1;
                                scope.search();
                            }, 500);
                        }
                    }

                    scope.areHeadersEqual = function (headers1, headers2) {
                        if (headers1.length !== headers2.length) {
                            return false;
                        }
                        for (var i = 0; i < headers1.length; i++) {
                            if (headers1[i].FieldUid !== headers2[i].FieldUid) {
                                return false;
                            }
                        }
                        return true;
                    }

                    //Equals = 0,
                    //WildcardEquals = 1,
                    //SmallerThan = 2,
                    //LargerThan = 3,
                    //IsEmpty = 4,
                    //IsNotEmpty = 5,
                    //Contains = 6,
                    //NotContains = 7,
                    //NotEquals = 8,
                    //NotWildcardEquals = 9

                    scope.mapQueryToViewModel = function () {
                        if (scope.config.query != null && scope.config.query.QueryModelType == "SimpleQueryModel") {
                            scope.mapSimpleQueryToViewModel();
                        } else {
                            scope.mapBooleanQueryToViewModel();
                        }
                    };

                    scope.mapQueryToFieldInput = function (dataFieldQuery) {
                        var value = "";
                        if (dataFieldQuery.QueryOperator === "IsEmpty" || dataFieldQuery.QueryOperator === 4) {
                            value = "\"\"";
                        } else if (dataFieldQuery.QueryOperator === "IsNotEmpty" || dataFieldQuery.QueryOperator === 5) {
                            value = "!\"\"";
                        } else if (dataFieldQuery.QueryOperator === "Equals" || dataFieldQuery.QueryOperator === 0) {
                            value = "\"" + dataFieldQuery.FilterValue + "\"";
                        } else if (dataFieldQuery.QueryOperator === "NotEquals" || dataFieldQuery.QueryOperator === 8) {
                            value = "!\"" + dataFieldQuery.FilterValue + "\"";
                        } else if (dataFieldQuery.QueryOperator === "NotContains" || dataFieldQuery.QueryOperator === 7) {
                            value = "!*" + dataFieldQuery.FilterValue;
                        } else if (dataFieldQuery.QueryOperator === "Contains" || dataFieldQuery.QueryOperator === 6) {
                            value = "*" + dataFieldQuery.FilterValue;
                        } else if (dataFieldQuery.QueryOperator === "NotWildcardEquals" || dataFieldQuery.QueryOperator === 9) {
                            value = "!" + dataFieldQuery.FilterValue;
                        } else if (dataFieldQuery.QueryOperator === "LargerThan" || dataFieldQuery.QueryOperator === 3) {
                            value = ">" + dataFieldQuery.FilterValue;
                        } else if (dataFieldQuery.QueryOperator === "SmallerThan" || dataFieldQuery.QueryOperator === 2) {
                            value = "<" + dataFieldQuery.FilterValue;
                        } else {
                            value = dataFieldQuery.FilterValue;
                        }

                        return value;
                    }

                    scope.mapBooleanQueryToViewModel = function () {
                        if (scope.config.query != null) {
                            scope.viewModel.includeArchived = scope.config.query.IncludeArchived;
                        }
                        if (scope.config.query != null && scope.config.query.SubQueries.length > 0) {
                            for (var j = 0; j < scope.config.query.SubQueries.length; j++) {
                                if (scope.config.query.SubQueries[j].Filters != null && scope.config.query.SubQueries[j].Filters.length > 0) {
                                    for (var i = 0; i < scope.config.query.SubQueries[j].Filters.length; i++) {
                                        var dataFieldQuery = scope.config.query.SubQueries[j].Filters[i];

                                        var uidInList;
                                        uidInList = _.find(scope.config.listConfiguration.DataFieldUids), function (uid) {
                                            return uid == dataFieldQuery;
                                        }

                                        if (uidInList == null) {
                                            continue;
                                        }

                                        var value = scope.mapQueryToFieldInput(dataFieldQuery);

                                        if (scope.viewModel.directSearch[dataFieldQuery.FieldUid]) {
                                            var operator = scope.config.query.SubQueries[j].BooleanOperator;
                                            if (operator) {
                                                var op = operator == "And" ? "&&" : "||";
                                                var newval = scope.viewModel.directSearch[dataFieldQuery.FieldUid] + op + value;
                                                scope.viewModel.directSearch[dataFieldQuery.FieldUid] = newval;
                                            }
                                            else {
                                                scope.viewModel.directSearch[dataFieldQuery.FieldUid] = value;
                                            }
                                        }
                                        else {
                                            scope.viewModel.directSearch[dataFieldQuery.FieldUid] = value;
                                        }
                                    }
                                }
                            }
                        }
                        else {
                            if (scope.viewModel.directSearch != null) {
                                angular.forEach(scope.viewModel.directSearch, function (value, key) {
                                    if (scope.config.listConfiguration.DataFieldUids.indexOf(key) == -1) {
                                        scope.viewModel.directSearch = {};
                                    }
                                });
                            }
                        }
                    }

                    scope.mapSimpleQueryToViewModel = function () {
                        if (scope.config.query != null) {
                            scope.viewModel.includeArchived = scope.config.query.IncludeArchived;
                        }
                        if (scope.config.query != null && scope.config.query.Filters != null && scope.config.query.Filters.length > 0) {
                            for (var i = 0; i < scope.config.query.Filters.length; i++) {
                                var dataFieldQuery = scope.config.query.Filters[i];
                                var uidInList;
                                uidInList = _.find(scope.config.listConfiguration.DataFieldUids), function (uid) {
                                    return uid == dataFieldQuery;
                                }

                                if (uidInList == null) {
                                    continue;
                                }

                                var value = scope.mapQueryToFieldInput(dataFieldQuery);
                                scope.viewModel.directSearch[dataFieldQuery.FieldUid] = value;
                            }
                        } else {
                            scope.viewModel.directSearch = {};
                        }
                    };

                    function addSubQueries(subQueries, key, value) {
                        var simpleQuery = {
                            QueryModelType: "SimpleQueryModel",
                            Filters: [],
                            IncludeArchived: scope.viewModel.includeArchived
                        };
                        if (value.toString().indexOf("&&") !== -1) {
                            value.toString().split("&&").forEach(function (subval) {
                                addDataFieldQueries(simpleQuery.Filters, key, subval);
                                simpleQuery.BooleanOperator = "And";
                            })
                        }
                        else if (value.toString().indexOf("||") !== -1) {
                            value.toString().split("||").forEach(function (subval) {
                                addDataFieldQueries(simpleQuery.Filters, key, subval);
                                simpleQuery.BooleanOperator = "Or";
                            })
                        }
                        else {
                            addDataFieldQueries(simpleQuery.Filters, key, value);
                        }
                        subQueries.push(simpleQuery);
                    }


                    function addDataFieldQueries(dataFieldQueries, key, value) {
                        //Default is WildcardEquals search
                        var queryOperator = "WildcardEquals";
                        //IsEmpty Search
                        if (value === "\"\"") {
                            queryOperator = "IsEmpty";
                            value = "";
                        }
                        //IsNotEmpty search
                        else if (value === "!\"\"") {
                            queryOperator = "IsNotEmpty";
                            value = "";
                        }
                        //Equals search
                        else if (value.startsWith("\"") && value.endsWith("\"")) {
                            queryOperator = "Equals";
                            value = value.replace(/\"/g, "");
                        }
                        //NotEquals search
                        else if (value.startsWith("!\"") && value.endsWith("\"")) {
                            queryOperator = "NotEquals";
                            value = value.replace("!", "").replace(/\"/g, "");
                        }
                        //NotContains search
                        else if (value.startsWith("!*")) {
                            queryOperator = "NotContains";
                            value = value.replace("!*", "");
                        }
                        //Contains search
                        else if (value.startsWith("*")) {
                            queryOperator = "Contains";
                            value = value.replace("*", "");
                        }
                        //NotWildcardEquals search
                        else if (value.startsWith("!")) {
                            queryOperator = "NotWildcardEquals";
                            value = value.replace("!", "");
                        }
                        //LargerThan search
                        else if (value.startsWith(">")) {
                            queryOperator = "LargerThan";
                            value = value.replace(">", "");
                        }
                        //SmallerThan search
                        else if (value.startsWith("<")) {
                            queryOperator = "SmallerThan";
                            value = value.replace("<", "");
                        }
                        dataFieldQueries.push({
                            FieldUid: key,
                            FilterValue: value,
                            QueryOperator: queryOperator
                        });
                    }

                    scope.focusOnInput = function (el) {
                        angular.element(el.currentTarget).prev().focus();
                    };


                    scope.mapViewModelToQuery = function () {

                        var subQueries = [];

                        var query = {
                            QueryModelType: "BooleanQueryModel",
                            SubQueries: subQueries,
                            BooleanOperator: "And",
                            IncludeArchived: scope.viewModel.includeArchived
                        };

                        for (var key in scope.viewModel.directSearch) {
                            if (scope.viewModel.directSearch.hasOwnProperty(key)) {
                                if (scope.viewModel.directSearch[key].length > 0) {
                                    var value = scope.viewModel.directSearch[key];
                                    addSubQueries(subQueries, key, value);
                                }
                            }
                        }

                        return query;
                    };


                    scope.setSearchResult = function (response) {

                        if (scope.searchResult == null || !scope.areHeadersEqual(scope.searchResult.ItemListHeaders, response.ItemListHeaders)) {
                            scope.searchResult = response;
                            if (scope.searchResult.TotalPages == 0) {
                                scope.searchResult.TotalPages = 1;
                            }
                        } else {
                            //We need to do this, as we cannot reload the header
                            scope.searchResult.ListItems = response.ListItems;
                            scope.searchResult.Page = response.Page;
                            scope.searchResult.PageSize = response.PageSize;
                            scope.searchResult.TotalHits = response.TotalHits;
                            scope.searchResult.TotalPages = response.TotalPages;
                            if (scope.searchResult.TotalPages == 0) {
                                scope.searchResult.TotalPages = 1;
                            }
                            scope.searchResult.UnknownFields = response.UnknownFields;
                        }
                    };

                    scope.changeSorting = function (header) {
                        if (header.SupportsSorting == true) {
                            if (scope.model.searchDefinition.SortByDataFieldUid != header.DataFieldUid) {
                                scope.model.searchDefinition.SortByDataFieldUid = header.DataFieldUid;
                                scope.model.searchDefinition.SortDescending = false;
                            } else if (scope.model.searchDefinition.SortDescending == false) {
                                scope.model.searchDefinition.SortDescending = true;
                            } else {
                                scope.model.searchDefinition.SortByDataFieldUid = scope.config.defaultSortByFieldUid;
                                scope.model.searchDefinition.SortDescending = false;
                            }

                            scope.search();

                            scope.$emit("searchChanged", {
                                query: scope.mapViewModelToQuery(),
                                sortByDataFieldUid: scope.model.searchDefinition.SortByDataFieldUid,
                                sortDescending: scope.model.searchDefinition.SortDescending,
                                page: scope.model.searchDefinition.Page
                            });
                        } else {
                            alert("This field does not support sorting. Please use another field for sorting");
                        }
                    };

                    scope.search = function (callback) {
                        if (scope.canceler != null) {
                            scope.canceler.resolve();
                        }

                        var searchQuery = scope.mapViewModelToQuery();
                        var subQueries = [];
                        subQueries.push(searchQuery);

                        if (scope.config.defaultFilter != null) {
                            subQueries.push(scope.config.defaultFilter);
                        }

                        scope.model.searchDefinition.Query = {
                            QueryModelType: "BooleanQueryModel",
                            SubQueries: subQueries,
                            BooleanOperator: "And",
                            IncludeArchived: scope.viewModel.includeArchived
                        };

                        scope.searching = true;

                        var model = {
                            SearchDefinition: scope.model.searchDefinition,
                            ListConfiguration: scope.config.listConfiguration
                        };

                        scope.canceler = $q.defer();



                        structUmbracoStructPimPickerSearchService.search(model, scope.canceler)
                            .then(function (response) {
                                scope.canceler = null;
                                scope.setSearchResult(response.data);
                                scope.searching = false;

                                var tmp = angular.copy(searchQuery);

                                if (callback) {
                                    callback();
                                }
                                scope.$emit("searchChanged", {
                                    query: searchQuery,
                                    sortByDataFieldUid: scope.model.searchDefinition.SortByDataFieldUid,
                                    sortDescending: scope.model.searchDefinition.SortDescending,
                                    page: scope.model.searchDefinition.Page
                                });
                            },
                                function (response) {
                                    //only show error message if status is not 0 - ie. not cancelled by UI
                                    if (response.status != 0) {
                                        structUmbracoStructPimPickerUmbracoHelper.handleError(response);
                                        scope.searching = false;
                                        scope.loaded = true;
                                    }
                                });
                    };

                    scope.initListeners = function () {
                        //Listen for page size changes
                        scope.$on("selectedItemsCleared", function (e, args) {
                            scope.config.selectedItems = [];
                        });

                        //Listen for page size changes
                        scope.$on("pageSizeChanged", function (e, pageSize) {
                            if (scope.model.searchDefinition.PageSize !== pageSize) {
                                scope.model.searchDefinition.PageSize = pageSize;
                                scope.model.searchDefinition.Page = 1;
                                scope.search();
                            }
                        });

                        //Listen for item type changes
                        scope.$on("entityTypeChanged", function (e, model) {
                            if (scope.model.searchDefinition.EntityType !== model.entityType) {
                                scope.model.searchDefinition.EntityType = model.entityType;
                                scope.config.listConfiguration = model.listConfiguration;
                                scope.config.selectedItems = model.selectedItems == null ? [] : model.selectedItems;
                                scope.config.query = model.searchModel != null ? model.searchModel.query : null;
                                scope.model.searchDefinition.SortByDataFieldUid = model.searchModel != null ? model.searchModel.sortByDataFieldUid : null;
                                scope.model.searchDefinition.SortDescending = model.searchModel != null ? model.searchModel.sortDescending : false;
                                scope.model.searchDefinition.Page = model.searchModel != null ? model.searchModel.page : 1;
                                scope.mapQueryToViewModel();
                                scope.search();
                            }
                        });

                        //Listen for list configuration changes
                        scope.$on("listConfigurationChanged", function (e, listConfiguration) {
                            scope.config.listConfiguration = listConfiguration;
                            scope.mapQueryToViewModel();
                            scope.search();
                        });

                        //Listen for refresh search
                        scope.$on("refreshSearch", function () {
                            scope.search();
                        });
                    }

                    document.onselectionchange = function () {

                        var selection = document.getSelection().toString();
                        if (selection.length > 0) {
                            scope.isSelecting = true;
                        }

                        if (selection.length == 0) {
                            scope.isSelecting = false;
                        }

                    };
                }
            }
        }
    ]);