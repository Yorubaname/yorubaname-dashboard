'use strict';
/* States */
angular.module('AuthModule').config([
  '$stateProvider', 'DomainConfigProvider',
  function ($stateProvider, DomainConfigProvider) {
    var domainConfig = DomainConfigProvider.$get();

    // State Configurations
    $stateProvider

      // Login Page
      .state('login', {
        page_title: `${domainConfig.siteDisplayName} - Admin - Login`,
        url: '/login',
        templateUrl: 'tmpls/login.html',
        controller: 'AuthController',
        data: {
          requiresLogout: true
        }
      })

      // Authenticated
      .state('auth', {
        abstract: true,
        url: '',
        templateUrl: 'tmpls/authenticated.html',
        data: {
          requiresLogin: true
        }
      })

      // Dashboard
      .state('auth.home', {
        page_title: `${domainConfig.siteDisplayName} - Admin - Dashboard`,
        url: '/',
        templateUrl: 'tmpls/dashboard.html',
        ncyBreadcrumb: {label: 'Home'},
        controller: 'NameCounterController',
        data: {
          requiresBasicPriviledge: true
        }
      });
  }
]);