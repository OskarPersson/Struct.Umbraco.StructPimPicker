/* global angular */
// Product picker property editor
angular.module("umbraco").controller("Struct.Umbraco.StructPimPicker.ItemPickerController", ["$scope", function ($scope) {
    if ($scope.model.config) {
        if ($scope.model.config.AllowMultiple == null) {
            $scope.model.config.AllowMultiple = false;
        }
        if ($scope.model.config.AllowProductGroupSelection == null) {
            $scope.model.config.AllowProductGroupSelection = false;
        }
        if ($scope.model.config.AllowProductSelection == null) {
            $scope.model.config.AllowProductSelection = false;
        }
        if ($scope.model.config.AllowVariantSelection == null) {
            $scope.model.config.AllowVariantSelection = false;
        }
        if ($scope.model.config.AllowProductCollectionSelection == null) {
            $scope.model.config.AllowProductCollectionSelection = false;
        }
        if ($scope.model.config.AllowVariantCollectionSelection == null) {
            $scope.model.config.AllowVariantCollectionSelection = false;
        }
        if ($scope.model.config.OnlyMaster == null) {
            $scope.model.config.OnlyMaster = false;
        }
        if ($scope.model.config.DefaultCatalogue == null || $scope.model.config.DefaultCatalogue == "") {
            $scope.model.config.OnlyMaster = true;
            $scope.model.config.DefaultCatalogue = null;
        }
    }

    if ($scope.model.value == undefined || $scope.model.value == null || $scope.model.value.constructor !== Array) {
        $scope.model.value = [];
    }

}]);
