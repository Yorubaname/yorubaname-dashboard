'use strict';

/* Directives */
angular.module('NamesModule')  // Directive adds the geolocation autocompletes on the tagsInput field of Name Form
.directive('nameForm', [
  'geolocationService',
  function (geo) {
    return {
      link: function (scope) {
        scope.query = function () {
          return geo.load();
        };
      }
    };
  }
])  // Directive adds File Uploader widget on the New Name Form for uploading names in bulk
.directive('namesUpload', [
  'uploadService',
  function (Uploader) {
    return {
      controller: function ($scope) {
        $scope.uploader = Uploader({
          url: '/v1/names/upload',
          alias: 'nameFiles',
          fileType: [
            'text/csv',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          ]
        });
      }
    };
  }
])  // Directive adds array of Etymology fields to the Name Form
.directive('etymology', [
  '$stateParams',
  function ($stateParams) {
    return {
      replace: true,
      restrict: 'E',
      templateUrl: 'tmpls/names/directives/etymology.html',
      link: function (scope) {
        if (!$stateParams.entry) {
          scope.name.etymology = [];
          scope.name.etymology.push({
            part: '',
            meaning: ''
          });
        }
        scope.add_etymology = function () {
          return scope.name.etymology.push({
            part: '',
            meaning: ''
          });
        };
        scope.remove_etymology = function (index) {
          scope.name.etymology.splice(index, 1);
          if (scope.name.etymology.length < 1)
            return scope.name.etymology.push({
              part: '',
              meaning: ''
            });
        };
        scope.$watch('name.etymology', function () {
          scope.form.$dirty = true;
        }, true);
      }
    };
  }
]).directive('feedback', [
  'NamesService',
  '$modal',
  '$stateParams',
  '$rootScope',
  function (api, $modal, $stateParams, $rootScope) {
    return {
      //replace: true,
      restrict: 'EA',
      templateUrl: 'tmpls/names/feedbacks.html',
      link: function (scope, element, attributes) {
        api.getFeedback($stateParams.entry, function (resp) {
          scope.feedbacks = resp;
        });
        scope.showFeedbacks = function () {
          $modal.open({
            templateUrl: 'tmpls/names/partials/feedbackModal.html',
            size: 'md',
            controller: function ($scope, $modalInstance) {
              $scope.modalTitle = 'Feedbacks on ' + attributes.name;
              $scope.feedbacks = scope.feedbacks;
              $scope.isAdmin = $rootScope.isAdmin;
              // delete all feedbacks and closes modal
              $scope.deleteFeedbacks = function () {
                api.deleteFeedbacks(attributes.name, function () {
                  $modalInstance.close();
                });
              };
              // delete one feedback by id and remove from list
              $scope.deleteFeedback = function (feedback) {
                api.deleteFeedback(feedback, function () {
                  $scope.feedbacks.splice($scope.feedbacks.indexOf(feedback), 1);
                });
              };
              $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
              };
            }
          });
        };
      }
    };
  }
]);