'use strict';

/* States */
angular.module('UsersModule').config([
  '$stateProvider',
  function ($stateProvider) {

    // State Configurations
    $stateProvider

      .state('auth.users', {
        abstract: true,
        url: '/users',
        template: '<div ui-view autoscroll="false" class="mainView-animate"></div>',
        data: {
          requiresAdminPriviledge: true
        }
      })

      .state('auth.users.add_user', {
        page_title: 'Yoruba Names Admin - Add User',
        ncyBreadcrumb: {label: 'Add User'},
        url: '/new',
        templateUrl: 'tmpls/users/new.html'
      })

      .state('auth.users.edit_user', {
        page_title: 'Yoruba Names Admin - Edit User',
        ncyBreadcrumb: {label: 'Edit User Info'},
        url: '/edit/:email',
        templateUrl: 'tmpls/users/edit.html'
      })

      .state('auth.users.list_users', {
        page_title: 'Yoruba Names Admin - All Users',
        ncyBreadcrumb: {label: 'All Users'},
        url: '/lists/:role',
        templateUrl: 'tmpls/users/lists.html',
        controller: 'userListCtrl'
      });
  }
]);