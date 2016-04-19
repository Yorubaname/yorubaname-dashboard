/* Controllers */
angular.module("dashboardappApp")
    .controller('mainCtrl', [
        '$scope',
        function ($scope){
        }
    ])

    .controller('headerCtrl', [
        '$scope',
        'authService',
        function ($scope, api){
            $scope.logout = function (){
                return api.logout()
            }
        }
    ])
    
    .controller('sideMenuCtrl', [
        '$rootScope',
        '$scope',
        '$state',
        '$stateParams',
        '$timeout',
        function ($rootScope, $scope, $state, $stateParams, $timeout) {
            $scope.sections = [
                {
                    id: 0,
                    title: 'Dashboard',
                    icon: 'fa fa-home first_level_icon',
                    link: 'auth.home'
                },
                {
                    id: 1,
                    title: 'Names Entries',
                    icon: 'fa fa-list-ol first_level_icon',
                    submenu_title: 'Names Entries',
                    submenu: [
                        {
                            title: 'Add Entries',
                            link: 'auth.names.add_entries'
                        },
                        /*{
                            title: 'All Name Entries',
                            link: "auth.names.list_entries({status:'all'})"
                        },*/
                        {
                            title: 'Published Names',
                            link: "auth.names.list_entries({status:'published'})"
                        },
                        {
                            title: 'Unpublished Names',
                            link: "auth.names.list_entries({status:'unpublished'})"
                        },
                        {
                            title: 'Suggested Names',
                            link: "auth.names.list_entries({status:'suggested'})"
                        },
                        {
                            title: 'Feedbacks',
                            link: 'auth.names.feedbacks'
                        },
                        {
                            title: 'Search',
                            link: 'auth.names.search'
                        }
                    ]
                }
            ];

            if ($rootScope.isLexicographer == true || $rootScope.isAdmin == true) $scope.sections.push(
                {
                    id: 2,
                    title: 'Users',
                    icon: 'fa fa-users first_level_icon',
                    submenu_title: 'Users',
                    submenu: [
                        {
                            title: 'Add User',
                            link: 'auth.users.add_user'
                        },
                        {
                            title: 'Users',
                            link: "auth.users.list_users({role:'all'})"
                        }
                    ]
                });

            // accordion menu
            $(document).off('click', '.side_menu_expanded #main_menu .has_submenu > a').on('click', '.side_menu_expanded #main_menu .has_submenu > a', function () {
                if($(this).parent('.has_submenu').hasClass('first_level')) {
                    var $this_parent = $(this).parent('.has_submenu'),
                        panel_active = $this_parent.hasClass('section_active');

                    if (!panel_active) {
                        $this_parent.siblings().removeClass('section_active').children('ul').slideUp('200');
                        $this_parent.addClass('section_active').children('ul').slideDown('200');
                    } else {
                        $this_parent.removeClass('section_active').children('ul').slideUp('200');
                    }
                } else {
                    var $submenu_parent = $(this).parent('.has_submenu'),
                        submenu_active = $submenu_parent.hasClass('submenu_active');

                    if (!submenu_active) {
                        $submenu_parent.siblings().removeClass('submenu_active').children('ul').slideUp('200');
                        $submenu_parent.addClass('submenu_active').children('ul').slideDown('200');
                    } else {
                        $submenu_parent.removeClass('submenu_active').children('ul').slideUp('200');
                    }
                }
            })

            $rootScope.createScrollbar = function() {
                $("#main_menu .menu_wrapper").mCustomScrollbar({
                    theme: "minimal-dark",
                    scrollbarPosition: "outside"
                })
            }

            $rootScope.destroyScrollbar = function() {
                $("#main_menu .menu_wrapper").mCustomScrollbar('destroy');
            }

            $timeout(function() {
                if(!$rootScope.sideNavCollapsed && !$rootScope.topMenuAct) {
                    if(!$('#main_menu .has_submenu').hasClass('section_active')) {
                        $('#main_menu .has_submenu .act_nav').closest('.has_submenu').children('a').click();
                    } else {
                        $('#main_menu .has_submenu.section_active').children('ul').show();
                    }
                    // init scrollbar
                    $rootScope.createScrollbar()
                }
            })
        }
    ])