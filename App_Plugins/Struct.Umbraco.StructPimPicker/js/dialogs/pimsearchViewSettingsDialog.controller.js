angular.module("umbraco").controller("Struct.Umbraco.StructPimPicker.ViewSettingsDialog.controller",
    function ($scope, $timeout, $window, structUmbracoStructPimPickerUmbracoHelper, structUmbracoStructPimPickerSearchService) {
        $scope.loaded = false;
        $scope.reloading = true;
        $scope.showNotification = false;

        //$scope.dataFieldDropDownConfig = umbracoHelper.getDefaultSelectizeConfig();
        //$scope.dataFieldDropDownConfig.placeholder = "Select data field";
        //$scope.dataFieldDropDownConfig.valueField = "Uid";
        //$scope.dataFieldDropDownConfig.labelField = "DataFieldName";
        //$scope.dataFieldDropDownConfig.searchField = "DataFieldName";
        //$scope.dataFieldDropDownConfig.sortField = "DataFieldName";

        $scope.currentListConfigurationUidChanged = function () {
            $scope.listConfiguration = _.findWhere($scope.allListConfigurations, { Uid: $scope.currentListConfigurationUid });
            angular.forEach($scope.listConfiguration.DataFields, function (d) {
                d.previous = d.Uid;
            });
        }

        $scope.validate = function () {
            var valid = true;
            if ($scope.listConfiguration == null || $scope.listConfiguration.DataFields == null || $scope.listConfiguration.DataFields.length === 0) {
                valid = false;
            } else {
                angular.forEach($scope.listConfiguration.DataFields, function (dataField) {
                    if (dataField.Uid == null) {
                        valid = false;
                    }
                });
            }

            if (valid) {
                var duplicatedFields = $scope.findDuplicatedFieldsInListConfiguration();
                if (duplicatedFields && duplicatedFields.length > 0) {
                    valid = false;
                    $scope.showErrorMessage("Error: Data field '" + duplicatedFields[0] + "' is added multiple times");
                } else {
                    $scope.removeErrorMessage();
                }
            }

            return valid;
        };

        $scope.findDuplicatedFieldsInListConfiguration = function () {
            if ($scope.listConfiguration && $scope.listConfiguration.DataFields) {

                var getFieldName = function (dataField) {
                    // newly added fields does not have DataFieldName so we find it in availableFields
                    var fieldName = dataField.Uid;
                    var fieldWithName = _.find($scope.availableFields, function (field) { return field.Uid === dataField.Uid; });
                    if (fieldWithName != null) {
                        fieldName = fieldWithName.Name;
                    }
                    return fieldName;
                };

                var seenDataFieldUids = new Set();
                var duplicatedFieldNames = [];

                $scope.listConfiguration.DataFields.forEach(function(dataField) {
                    if (seenDataFieldUids.has(dataField.Uid)) {
                        duplicatedFieldNames.push(getFieldName(dataField));
                    }
                    seenDataFieldUids.add(dataField.Uid);
                });
                return duplicatedFieldNames;
            }

            return undefined;
        }

        $scope.getAvailableFields = function (callback) {
            structUmbracoStructPimPickerSearchService.getAvailableFields($scope.model.itemType)
                .then(function (response) {
                    $scope.availableFields = response.data;
                    if (callback != null) {
                        callback();
                    }
                })
                .catch(function (response) {
                    structUmbracoStructPimPickerUmbracoHelper.handleError(response);
                    $scope.loaded = true;
                });
        }

        $scope.getCurrentListConfiguration = function () {
            var localListConfiguration = $window.localStorage.getItem("pimsearch_configuration_" + scope.config.entityType + "_" + scope.listScope);

            if (localListConfiguration != null) {
                $scope.listConfiguration = angular.fromJson(localListConfiguration);

                if ($scope.listConfiguration.DataFields == null) {
                    $scope.listConfiguration.DataFields = [];
                }
                $scope.loaded = true;
                $scope.hideReloadShortlyAfter();
            } else {
                structUmbracoStructPimPickerSearchService.getCurrentListConfiguration($scope.model.itemType, $scope.model.scope)
                    .then(function (response) {
                        $scope.listConfiguration = response.data;

                        if ($scope.listConfiguration.DataFields == null) {
                            $scope.listConfiguration.DataFields = [];
                        }
                        $scope.loaded = true;
                        $scope.hideReloadShortlyAfter();
                    })
                    .catch(function (response) {
                        structUmbracoStructPimPickerUmbracoHelper.handleError(response);
                        $scope.loaded = true;
                    });
            }
        }

        $scope.setDataFieldUids = function () {
            $scope.listConfiguration.DataFieldUids = [];
            angular.forEach($scope.listConfiguration.DataFields, function (dataField) {
                $scope.listConfiguration.DataFieldUids.push(dataField.Uid);
            });
        }

        $scope.showNotificationMessage = function (message) {
            $scope.notificationMessage = message;
            $scope.showNotification = true;
            $timeout(function () {
                $scope.showNotification = false;
            }, 2000);
        }

        $scope.showErrorMessage = function (message) {
            $scope.errorMessage = message;
            $scope.showError = true;
        }

        $scope.removeErrorMessage = function() {
            $scope.errorMessage = null;
            $scope.showError = false;
        }

        $scope.hideReloadShortlyAfter = function () {
            $timeout(function () {
                $scope.reloading = false;
            }, 500);
        }

        $scope.updateShownDataFields = function () {
            $scope.reloading = true;
            $scope.setDataFieldUids();

            $window.localStorage.setItem("pimsearch_configuration_" + $scope.listConfiguration.EntityType + "_" + $scope.listConfiguration.Scope, angular.toJson($scope.listConfiguration));
            $scope.hideReloadShortlyAfter();
            $scope.model.submit($scope.listConfiguration);
        }

        $scope.addDataField = function () {
            $scope.listConfiguration.DataFields.push({ Uid: null, Name: null, editMode: true });
        }

        $scope.setSelectedDataField = function (dataField) {
            if (dataField.Uid != null && dataField.previous != dataField.Uid) {
                let field = _.find($scope.availableFields, function (d) {
                    return d.Uid == dataField.Uid;
                });
                dataField.Name = field.Name;
                dataField.editMode = false;
                dataField.previous = dataField.Uid;
            }
        }

        $scope.removeDataField = function (dataField) {
            $scope.listConfiguration.DataFields = _.without($scope.listConfiguration.DataFields, dataField);
        }

        $scope.init = function () {
            $scope.getAvailableFields(function () {
                $scope.listConfiguration = $scope.model.currentListConfiguration;
                $scope.loaded = true;
                $scope.reloading = false;
            });            
        }

        $scope.dragStart = function (e, ui) {
            ui.item.data("start", ui.item.index());
        }

        $scope.dragEnd = function (e, ui) {
            var start = ui.item.data("start"),
                end = ui.item.index();

            $scope.listConfiguration.DataFields.splice(end, 0,
                $scope.listConfiguration.DataFields.splice(start, 1)[0]);

            $scope.$apply();
        }

        $timeout(function () {
            $(".dataFieldsAsSortable").sortable({
                start: $scope.dragStart,
                update: $scope.dragEnd,
                axis: "y"
            });
        }, 0);

        $scope.init();
    });