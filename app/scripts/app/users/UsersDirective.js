'use strict';

/* Directives */
angular.module('UsersModule')  // Directive adds user roles the User Form
  .directive('userForm', [
    'usersService',
    '$stateParams',
    '$window',
    function (api, $stateParams, $window) {
      return {
        link: function (scope) {
          scope.user = {};
          // Override the user object on the scope in edit user form
          if ($stateParams.id !== undefined) {
            // This is true for Updating User Info
            scope.user.id = $stateParams.id;
            api.getUser($stateParams.id).success(function (user) {
              scope.user = user;
            });
          }
          function role_is(role, isRole) {
            if (isRole) {
              scope.role = role;
            }
            return isRole;
          }
          scope.role_is = function (role) {
            if (typeof scope.user.roles === 'undefined')
              return null;
            if (typeof scope.user.roles === 'object') {
              return role_is(role, scope.user.roles.indexOf(role) > -1);
            }
            if (typeof scope.user.roles === 'string') {
              return role_is(role, scope.user.roles === role);
            }
          };
          // Callback on submit
          scope.submit = function () {
            scope.user.roles = [scope.role];
            if (!scope.user.id)
              return api.addUser(scope.user);
            else
              return api.updateUser(scope.user);
          };
          scope.delete = function (user) {
            if (!$window.confirm('Are you sure you want to delete this account?'))
              return;
            return api.deleteUser(user, function () {
              // redirect to the previous page
              return $window.history.back();
            });
          };
        }
      };
    }
  ]);