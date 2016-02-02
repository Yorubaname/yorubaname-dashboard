/* States */
dashboardappApp

    .config(['$stateProvider', '$urlRouterProvider',
        function ($stateProvider, $urlRouterProvider) {

            // Use $urlRouterProvider to configure any redirects (when) and invalid urls (otherwise).
            $urlRouterProvider
                .when('/home', '/')
                .otherwise('/login');

            // State Configurations
            $stateProvider

                // Login Page
                .state("login", {
                    page_title: 'Yoruba Names - Admin - Login',
                    url: "/login",
                    templateUrl: 'tmpls/login.html',
                    controller: 'loginCtrl',
                    data:{
                      requiresLogout:true
                    }
                })
                // Errors
                .state("error", {
                    url: "/error",
                    abstract: true,
                    template: '<div ui-view autoscroll="false" class="mainView-animate"></div>'
                })
                // Errors > 404
                .state("error.404", {
                    page_title: 'Yoruba Names - Admin - Error 404',
                    url: "/404",
                    templateUrl: 'tmpls/error.404.html'
                })
                // Authenticated
                .state("auth", {
                    abstract: true,
                    // this state url
                    url: "",
                    templateUrl: 'tmpls/authenticated.html',
                    data:{
                      requiresLogin:true
                    }
                })
                // Dashboard
                .state("auth.home", {
                    // this state page title
                    page_title: 'Yoruba Names - Admin - Dashboard',
                    // this state url
                    url: "/",
                    templateUrl: 'tmpls/dashboard.html',
                    ncyBreadcrumb: {
                        label: 'Home'
                    },
                    controller: 'dashboardCtrl',
                    data:{
                      requiresBasicPriviledge:true
                    }
                })
                // Names (parent state)
                .state('auth.names', {
                    // With abstract set to true, that means this state can not be explicitly activated.
                    abstract: true,
                    url: '/names',
                    template: '<div ui-view autoscroll="false" class="mainView-animate"></div>',
                    data:{
                      requiresBasicPriviledge:true
                    }
                })
                // Names > New Entries
                .state('auth.names.add_entries', {
                    page_title: 'Yoruba Names - Admin - Add Name Entries',
                    ncyBreadcrumb: {
                        label: 'Add Name Entries'
                    },
                    url: '/new',
                    templateUrl: 'tmpls/names/new.html',
                    controller:'namesAddEntriesCtrl'
                })

                // edit Name Entry
                .state('auth.names.edit_entries', {
                    page_title: 'Yoruba Names - Admin - Edit Entry',
                    ncyBreadcrumb: {
                        label: 'Edit Entry'
                    },
                    url: '/edit/:entry',
                    templateUrl: 'tmpls/names/edit.html',
                    controller:'namesEditEntryCtrl'
                })


                // Names > Published Names
                .state('auth.names.list_entries', {
                    page_title: 'Yoruba Names - Admin - Names',
                    ncyBreadcrumb: {
                        label: 'Names Entries'
                    },
                    url: '/lists/:status?:submmittedBy',
                    templateUrl: 'tmpls/names/lists.html',
                    controller: 'namesListEntriesCtrl'
                })
                
                // Names > Name Search
                .state('auth.names.search', {
                    page_title: 'Yoruba Names - Admin - Name Search',
                    ncyBreadcrumb: {
                        label: 'Search'
                    },
                    url: '/search/:entry',
                    templateUrl: 'tmpls/names/search.html',
                    controller: 'nameSearchCtrl'
                })

                .state('auth.users', {
                    abstract: true,
                    url: '/users',
                    template: '<div ui-view autoscroll="false" class="mainView-animate"></div>',
                    data:{
                      requiresAdminPriviledge:true
                    }
                })

                .state('auth.users.add_user', {
                    page_title: 'Yoruba Names Admin - Add User',
                    ncyBreadcrumb: {
                        label: 'Add User'
                    },
                    url: '/new',
                    templateUrl: 'tmpls/users/new.html',
                    controller: 'userAddCtrl'
                })

                .state('auth.users.edit_user', {
                    page_title: 'Yoruba Names Admin - Edit User',
                    ncyBreadcrumb: {
                        label: 'Edit User Info'
                    },
                    url: '/edit/:id',
                    templateUrl: 'tmpls/users/edit.html',
                    controller: 'userEditCtrl'
                })

                .state('auth.users.list_users', {
                    page_title: 'Yoruba Names Admin - All Users',
                    ncyBreadcrumb: {
                        label: 'All Users'
                    },
                    url: '/lists/:role',
                    templateUrl: 'tmpls/users/lists.html',
                    controller: 'userListCtrl'
                })

        }
    ])