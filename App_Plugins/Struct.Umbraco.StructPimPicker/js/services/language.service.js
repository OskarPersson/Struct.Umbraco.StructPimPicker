angular.module("umbraco")
    .factory("structUmbracoStructPimPickerLanguageService", function ($http, $rootScope, umbracoHelper, $q, userService) {
        return {
            getLanguages: function () {
                return $http.get("backoffice/StructUmbracoStructPimPicker/LanguageApi/GetLanguages", { cache: true });
            }
        };
    });