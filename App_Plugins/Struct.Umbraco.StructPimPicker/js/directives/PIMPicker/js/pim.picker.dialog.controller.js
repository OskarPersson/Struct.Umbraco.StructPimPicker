angular.module("umbraco").controller("Struct.Umbraco.StructPimPicker.ItemPickerDialog.controller", ["$scope", "$element", function ($scope, $element) {
    
    function init() {

        //Make sure that changes in this form does not make the outer form dirty
        var alwaysFalse = { get: function () { return false; }, set: function () { } };
        var ctrl = $element.controller("form");
        ctrl.$addControl = function () { };
        ctrl.$setDirty = function () { };
        Object.defineProperty(ctrl, '$pristine', alwaysFalse);
        Object.defineProperty(ctrl, '$dirty', alwaysFalse);

        $scope.selectedProductAndVariants = [];
        $scope.selectedCategories = [];
        $scope.selectedCollections = [];

        $scope.controlModel = {};

        $scope.allowMultiple = $scope.model.AllowMultiple;

        $scope.controlModel.showProductsAndVariants = $scope.model.AllowProductSelection || $scope.model.AllowVariantSelection || $scope.model.AllowVariantGroupSelection;
        $scope.controlModel.showCatalogue = $scope.model.AllowProductGroupSelection;
        $scope.controlModel.showCollection = $scope.model.AllowProductCollectionSelection || $scope.model.AllowVariantCollectionSelection;

        if ($scope.model.AllowProductSelection || $scope.model.AllowVariantSelection || $scope.model.AllowVariantGroupSelection) {
            $scope.controlModel.activeTab = "productVariant";
        } else if ($scope.model.AllowProductGroupSelection) {
            $scope.controlModel.activeTab = "catalogue";
        } else if ($scope.model.AllowProductCollectionSelection || $scope.model.AllowVariantCollectionSelection) {
            $scope.controlModel.activeTab = "collection";
        }

        if ($scope.controlModel.showProductsAndVariants) {
            $scope.controlModel.pimSearch = {
                allowedTypes: []
            }

            if ($scope.model.AllowProductSelection) {
                $scope.controlModel.pimSearch.allowedTypes.push("Product");
            }

            if ($scope.model.AllowVariantSelection) {
                $scope.controlModel.pimSearch.allowedTypes.push("Variant");
            }

            if ($scope.model.AllowVariantGroupSelection) {
                $scope.controlModel.pimSearch.allowedTypes.push("VariantGroup");
            }


            if ($scope.model.SelectOnlySubItems && $scope.model.CurrentItemType.toLowerCase() === "product") {
                $scope.controlModel.pimSearch.allowedTypes = ["Variant"];

                $scope.controlModel.pimSearch.defaultFilter = {
                    BooleanOperator: 0,
                    IncludeArchived: false,
                    SubQueries: [{
                        BooleanOperator: 0,
                        DataFieldQueries: [{
                            DataFieldUid: "PIM_ProductId",
                            FilterValue: $scope.model.CurrentItemId,
                            Name: "Product Id",
                            QueryOperator: 0
                        }],
                        IncludeArchived: false,
                        class_type_name: "SimpleQuery"
                    }],
                    class_type_name: "BooleanQuery"
                };
            }
            else if ($scope.model.LimitToProductStructures != null && $scope.model.LimitToProductStructures.length > 0 &&
                ($scope.model.CurrentItemType.toLowerCase() === "product" || $scope.model.CurrentItemType.toLowerCase() === "variant" || $scope.model.CurrentItemType.toLowerCase() === "variantgroup")) {

                var dataFieldQueries = [];

                angular.forEach($scope.model.LimitToProductStructures, function (ps) {
                    dataFieldQueries.push({
                        DataFieldUid: "PIM_ProductStructureUid",
                        FilterValue: ps,
                        Name: "Product structure uid",
                        QueryOperator: 0
                    });
                });

                $scope.controlModel.pimSearch.defaultFilter = {
                    BooleanOperator: 0,
                    IncludeArchived: false,
                    SubQueries: [{
                        BooleanOperator: 1,
                        DataFieldQueries: dataFieldQueries,
                        IncludeArchived: false,
                        class_type_name: "SimpleQuery"
                    }],
                    class_type_name: "BooleanQuery"
                };
            }
        }
    };

    $scope.cancel = function () {
        $scope.model.close();
    };

    $scope.submitSelection = function () {
        var selectedItems = [];

        //If multiple is not allowed, clear selected from inactive tabs


        if ($scope.model.AllowMultiple || $scope.controlModel.activeTab === "catalogue") {
            angular.forEach($scope.selectedCategories, function (category) {
                selectedItems.push({
                    ItemId: category.CategoryId,
                    ReferenceType: 10
                });
            });
        }

        if ($scope.model.AllowMultiple || $scope.controlModel.activeTab === "collection") {
            selectedItems = selectedItems.concat(_.map($scope.selectedCollections,
                function (item) {
                    return {
                        ItemId: item.Uid,
                        ReferenceType: 40
                    };
                }));
        }

        if (($scope.model.AllowMultiple || $scope.controlModel.activeTab === "productVariant") && $scope.selectedProductAndVariants.Product && $scope.selectedProductAndVariants.Product.length > 0) {
            var productIds = _.map(Object.keys($scope.selectedProductAndVariants.Product), function (element) { return parseInt(element); });
            selectedItems = selectedItems.concat(_.map(productIds,
                function (productId) {
                    return {
                        ItemId: productId,
                        ReferenceType: 20
                    };
                }));
        }

        if (($scope.model.AllowMultiple || $scope.controlModel.activeTab === "productVariant") && $scope.selectedProductAndVariants.Variant && $scope.selectedProductAndVariants.Variant.length > 0) {
            var variantIds = _.map(Object.keys($scope.selectedProductAndVariants.Variant), function (element) { return parseInt(element); });            
            selectedItems = selectedItems.concat(_.map(variantIds,
                function (variantId) {
                    return {
                        ItemId: variantId,
                        ReferenceType: 30
                    };
                }));
        }

        if (($scope.model.AllowMultiple || $scope.controlModel.activeTab === "productVariant") && $scope.selectedProductAndVariants.VariantGroup && $scope.selectedProductAndVariants.VariantGroup.length > 0) {
            var variantGroupIds = _.map(Object.keys($scope.selectedProductAndVariants.VariantGroup), function (element) { return parseInt(element); });
            selectedItems = selectedItems.concat(_.map(variantGroupIds,
                function (variantGroupId) {
                    return {
                        ItemId: variantGroupId,
                        ReferenceType: 50
                    };
                }));
        }

        $scope.model.submit(selectedItems);
    };

    init();

}]);
