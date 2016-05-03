'use strict';

/* API Endpoint Service for API requests: Adapted from code base */
angular.module('dashboardappApp').service('baseService', [
    '$http',
    function ($http) {
        this.get = function (endpoint, data, headers) {
            return $http({
                method: 'GET',
                url: endpoint,
                params: data ? data : '',
                headers: headers ? headers : ''
            });
        };
        this.post = function (endpoint, data) {
            $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
            return $http({
                method: 'POST',
                url: endpoint,
                data: $.param(data)
            });
        };
        this.postJson = function (endpoint, data) {
            return $http({
                method: 'POST',
                url: endpoint,
                data: data ? data : ''
            });
        };
        this.put = function (endpoint, data) {
            $http.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded';
            return $http({
                method: 'PUT',
                url: endpoint,
                data: data ? data : ''
            });
        };
        this.putJson = function (endpoint, data) {
            return $http({
                method: 'PUT',
                url: endpoint,
                data: data ? data : ''
            });
        };
        this.patch = function (endpoint, data) {
            $http.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded';
            return $http({
                method: 'PATCH',
                url: endpoint,
                data: data ? data : ''
            });
        };
        this.patchJson = function (endpoint, data) {
            return $http({
                method: 'PATCH',
                url: endpoint,
                data: data ? data : ''
            });
        };
        this.delete = function (endpoint, data) {
            $http.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded';
            return $http({
                method: 'DELETE',
                url: endpoint,
                data: data ? data : ''
            });
        };
        this.deleteJson = function (endpoint, data) {
            // had to explicitly set the content-type for the delete request to work, Why? I do not know yet
            $http.defaults.headers.common['Content-Type'] = 'application/json';
            return $http({
                method: 'DELETE',
                url: endpoint,
                data: data ? data : ''
            });
        };
        this.authenticate = function (authData) {
            $http.defaults.headers.common.Authorization = 'Basic ' + authData;
            return $http({
                method: 'POST',
                url: '/v1/auth/login'
            });
        };
    }
]).service('uploadService', [
    'FileUploader',
    'ENV',
    'toastr',
    '$localStorage',
    '$state',
    function (FileUploader, ENV, toastr, $localStorage) {
        FileUploader.prototype.setEndpoint = function setEndpoint(endpoint) {
            this.url = ENV.baseUrl + endpoint;
        };
        return function (optionsArg) {
            var options = optionsArg || {};
            var args = {
                url: ENV.baseUrl + options.url,
                headers: {Authorization: 'Basic ' + $localStorage.token}
            };
            if (options.alias) {
                args.alias = options.alias;
            }
            var uploader = new FileUploader(args),
                fileType = options.fileType,
                maxUpload = options.maxUpload || 1,
                invalidFileMsg = options.invalidFileMsg || 'File type is not supported',
                uploadLimitMsg = options.uploadLimitMsg || 'You may only upload one file at a time',
                onError = options.onErrorMsg || 'An error occur while uploading the file, please retry',
                onComplete = options.onCompleteMsg || 'File upload completed successfully',
                errorCallback = options.errorCallback || function () {
                    },
                successCallback = options.successCallback || function () {
                    };
            // FILTERS
            uploader.filters.push({
                name: 'customFilter',
                fn: function (item) {
                    return fileType.indexOf(item.type) >= 0 && this.queue.length < maxUpload;
                }
            });
            // CALLBACKS
            uploader.onWhenAddingFileFailed = function (item, filter, options) {
                console.info('onWhenAddingFileFailed', item, filter, options);
                if (fileType.indexOf(item.type) < 0)
                    return toastr.warning('Invalid File' + invalidFileMsg);
                if (this.queue.length === maxUpload)
                    return toastr.warning('Single upload' + uploadLimitMsg);
            };
            uploader.onAfterAddingFile = function (fileItem) {
                console.info('onAfterAddingFile', fileItem);
            };
            uploader.onAfterAddingAll = function (addedFileItems) {
                console.info('onAfterAddingAll', addedFileItems);
                if (!options.manualTrigger)
                    addedFileItems[0].upload();
            };
            uploader.onBeforeUploadItem = function (item) {
                console.info('onBeforeUploadItem', item);
            };
            uploader.onProgressItem = function (fileItem, progress) {
                console.info('onProgressItem', fileItem, progress);
            };
            uploader.onProgressAll = function (progress) {
                console.info('onProgressAll', progress);
            };
            uploader.onSuccessItem = function (fileItem, response, status, headers) {
                console.info('onSuccessItem', fileItem, response, status, headers);
            };
            uploader.onErrorItem = function (fileItem, response) {
                toastr.error('Upload Error' + onError);
                fileItem.remove();
                errorCallback(response);
            };
            uploader.onCancelItem = function (fileItem, response, status, headers) {
                console.info('onCancelItem', fileItem, response, status, headers);
            };
            uploader.onCompleteItem = function (fileItem, response) {
                toastr.success('Upload Complete' + onComplete);
                successCallback(response);
                fileItem.remove();
            };
            uploader.onCompleteAll = function () {
                console.info('onCompleteAll');
            };
            return uploader;
        };
    }
]);