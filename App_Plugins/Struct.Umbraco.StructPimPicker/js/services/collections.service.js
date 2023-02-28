angular.module("umbraco")
    .factory("structUmbracoStructPimPickerCollectionService", function ($http, $cacheFactory, $routeParams) {
        var cacheUrl = null;

        return {
            getCollectionsTree: function(collectionTypes, parentUid) {
                return $http.post("backoffice/StructUmbracoStructPimPicker/CollectionApi/GetCollectionsTree", angular.toJson({ CollectionTypes: collectionTypes, ParentUid: parentUid }));
            }
        };
    });