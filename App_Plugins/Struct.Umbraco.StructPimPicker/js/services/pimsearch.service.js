angular.module("umbraco")
    .factory("structUmbracoStructPimPickerSearchService", ['$http', function ($http) {
        return {
            getAvailableFields: function (entityType) {
                return $http.get("backoffice/StructUmbracoStructPimPicker/PimSearchApi/GetAvailableFields?entitytype=" + entityType);
            },
            getCurrentListConfiguration: function (entityType, scope) {
                return $http.get("backoffice/StructUmbracoStructPimPicker/PimSearchApi/GetCurrentListConfiguration?entityType=" + entityType + "&scope=" + scope);
            },
            search: function (searchModel, canceler) {
                if (canceler != null) {
                    return $http.post("backoffice/StructUmbracoStructPimPicker/PimSearchApi/Search", angular.toJson(searchModel), { timeout: canceler.promise });
                }
                else {
                    return $http.post("backoffice/StructUmbracoStructPimPicker/PimSearchApi/Search", angular.toJson(searchModel));
                }
            }
        };
    }]);