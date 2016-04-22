'use strict';
/* Controllers */
angular.module('dashboardappApp').controller('loginCtrl', [
  '$scope',
  'authService',
  function ($scope, api) {
    $scope.login = {};
    $scope.submit = function () {
      return api.authenticate($scope.login, $scope);
    };
  }
]);