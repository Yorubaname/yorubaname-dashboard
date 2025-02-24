'use strict';

/* States */
angular.module('NamesModule').config([
  '$stateProvider', 'DomainConfigProvider',
  function ($stateProvider, DomainConfigProvider) {
    var domainConfig = DomainConfigProvider.$get();
    
    // State Configurations
    $stateProvider

    // Names (parent state)
      .state('auth.names', {
        abstract: true,
        url: '/names',
        template: '<div ui-view autoscroll="false" class="mainView-animate"></div>',
        data: {
          requiresBasicPriviledge: true
        }
      })

    // Names > New Entries
      .state('auth.names.add_entries', {
        page_title: `${domainConfig.siteDisplayName} - Admin - Add Name Entries`,
        ncyBreadcrumb: { label: 'Add Name Entries' },
        url: '/new',
        templateUrl: 'tmpls/names/new.html',
        controller: 'NamesAddEntriesCtrl'
      })

    // Edit Name Entry
      .state('auth.names.edit_entries', {
        page_title: `${domainConfig.siteDisplayName} - Admin - Edit Entry`,
        ncyBreadcrumb: { label: 'Edit Entry' },
        url: '/edit/:entry',
        templateUrl: 'tmpls/names/edit.html',
        controller: 'namesEditEntryCtrl'
      })

    // Names > Published Names
      .state('auth.names.list_entries', {
        page_title: `${domainConfig.siteDisplayName} - Admin - Names`,
        ncyBreadcrumb: { label: 'Names Entries' },
        url: '/lists/:status?:submmittedBy',
        templateUrl: 'tmpls/names/lists.html',
        controller: 'namesListEntriesCtrl'
      })

    // Names > Name Search
      .state('auth.names.search', {
        page_title: `${domainConfig.siteDisplayName} - Admin - Name Search`,
        ncyBreadcrumb: { label: 'Search' },
        url: '/search/:entry',
        templateUrl: 'tmpls/names/search.html',
        controller: 'nameSearchCtrl'
      })


    // All Names Feedback
      .state('auth.names.feedbacks', {
        page_title: `${domainConfig.siteDisplayName} - Admin - Feedbacks`,
        ncyBreadcrumb: { label: 'Names Feedbacks' },
        url: '/feedbacks',
        templateUrl: 'tmpls/names/feedbacks-list.html',
        controller: 'namesFeedbacksCtrl'
      });
  }
]);