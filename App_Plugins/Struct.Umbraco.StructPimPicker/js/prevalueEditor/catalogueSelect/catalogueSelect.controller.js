var app = angular.module("umbraco");

app.controller("Struct.Umbraco.StructPimPicker.catalogueSelectController",
    function ($scope, structUmbracoStructPimPickerCatalogueService, structUmbracoStructPimPickerUmbracoHelper) {
        $scope.loaded = false;
        $scope.catalogues = [];

        $scope.init = function () {
            $scope.loaded = false;

            structUmbracoStructPimPickerCatalogueService.getBasicCatalogues()
                .then(function (response) {
                    $scope.catalogues = response.data;

                    $scope.loaded = true;
                }, function (response) {
                    structUmbracoStructPimPickerUmbracoHelper.handleError(response);
                });
        };

        $scope.init();
    });