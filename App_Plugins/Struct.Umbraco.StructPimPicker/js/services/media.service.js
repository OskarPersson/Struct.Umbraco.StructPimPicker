angular.module("umbraco")
    .factory("structUmbracoStructPimPickerMediaService", function ($http) {
        return {
            getByIds: function (entityIds, width, height, cropMode, format, bgColor) {
                var tmp = "backoffice/StructUmbracoStructPimPicker/MediaApi/GetByIds";
                var q = [];
                if (width) {
                    q.push("width=" + width);
                }
                if (height) {
                    q.push("height=" + height);
                }
                if (cropMode) {
                    q.push("cropMode=" + cropMode);
                }
                if (format) {
                    q.push("format=" + format);
                }
                if (bgColor) {
                    q.push("bgColor=" + bgColor);
                }
                if (q.length > 0) {
                    tmp += "?" + q.join("&");
                }
                return $http.post(tmp, angular.toJson(entityIds));
            }
        };
    });