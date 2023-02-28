angular.module("umbraco")
    .factory("structUmbracoStructPimPickerVariantGroupService", ['$http', function ($http) {
        return {
            getVariantGroupNames: function (variantGroupIds) {
                return $http.post("backoffice/StructUmbracoStructPimPicker/VariantGroupApi/getVariantGroupNames", angular.toJson(variantGroupIds));
            },
            getVariantGroupThumbnails: function (variantGroupIds) {
                return $http.post("backoffice/StructUmbracoStructPimPicker/VariantGroupApi/getVariantGroupThumbnails", angular.toJson(variantGroupIds));
            }
        };
    }]);