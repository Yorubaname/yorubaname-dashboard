'use strict';
/* States */
angular.module('AuthModule').config([
  '$stateProvider',
  function ($stateProvider) {
    // State Configurations
    $stateProvider  // Login Page
.state('login', {
      page_title: 'Yoruba Names - Admin - Login',
      url: '/login',
      templateUrl: 'tmpls/login.html',
      controller: 'AuthController',
      data: { requiresLogout: true }
    })  // Authenticated
.state('auth', {
      abstract: true,
      // this state url
      url: '',
      templateUrl: 'tmpls/authenticated.html',
      data: { requiresLogin: true }
    })  // Dashboard
.state('auth.home', {
      // this state page title
      page_title: 'Yoruba Names - Admin - Dashboard',
      // this state url
      url: '/',
      templateUrl: 'tmpls/dashboard.html',
      ncyBreadcrumb: { label: 'Home' },
      controller: 'NameCounterController',
      data: { requiresBasicPriviledge: true }
    });
  }
]);