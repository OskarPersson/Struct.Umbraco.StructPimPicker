angular.module("umbraco")
    .factory("structUmbracoStructPimPickerCatalogueService", function ($http) {
    return {
        getBasicCatalogues: function () {
            return $http.post("backoffice/StructUmbracoStructPimPicker/CatalogueApi/GetBasicCatalogues", angular.toJson({ }));
        },
        getCategoryChildren: function (categoryId) {
            return $http.post("backoffice/StructUmbracoStructPimPicker/CatalogueApi/GetCategoryChildren", angular.toJson({ CategoryId: categoryId }));
        },
        getCatalogueChildren: function (catalogueUid) {
            return $http.post("backoffice/StructUmbracoStructPimPicker/CatalogueApi/GetCatalogueChildren", angular.toJson({ CatalogueUid: catalogueUid }));
        }
    };
})