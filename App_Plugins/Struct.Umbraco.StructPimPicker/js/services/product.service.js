angular.module("umbraco")
    .factory("structUmbracoStructPimPickerProductService", function ($http) {
        return {
            getProductNames: function (productIds) {
                return $http.post("backoffice/StructUmbracoStructPimPicker/ProductApi/GetProductNames", angular.toJson(productIds));
            },
            getVariantNames: function (variantIds) {
                return $http.post("backoffice/StructUmbracoStructPimPicker/ProductApi/GetVariantNames", angular.toJson(variantIds));
            },
            getCategoryNames: function (categoryIds) {
                return $http.post("backoffice/StructUmbracoStructPimPicker/ProductApi/GetCategoryNames", angular.toJson({ CategoryIds: categoryIds }));
            },
            getCollectionNames: function (collectionUids) {
                return $http.post("backoffice/StructUmbracoStructPimPicker/ProductApi/GetCollectionNames", angular.toJson({ CollectionUids: collectionUids }));
            },
            getProductThumbnails: function (productIds) {
                return $http.post("backoffice/StructUmbracoStructPimPicker/ProductApi/getProductThumbnails", angular.toJson(productIds));
            },
            getVariantThumbnails: function (variantIds) {
                return $http.post("backoffice/StructUmbracoStructPimPicker/ProductApi/getVariantThumbnails", angular.toJson(variantIds));
            }
        };
    });