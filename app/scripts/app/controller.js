/* Controllers */
dashboardappApp

    .controller('mainCtrl', [
        '$scope',
        function ($scope){
        }
    ])

    .controller('headerCtrl', [
        '$scope',
        'authApi',
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

    .controller('loginCtrl', [
        '$scope',
        'authApi',
        function ($scope, api) {
            $scope.login = {}
            $scope.submit = function (){
                return api.authenticate($scope.login, $scope)
            }
        }
    ])

    .controller('dashboardCtrl', [
        '$scope',
        'namesApi',
        function ($scope, api) {

            api.countNames('suggested', function(num){
                $scope.count_suggested_names = num
                $('.countUpMe .suggested_names').each(function() {
                    var target = this,
                    endVal = $scope.count_suggested_names,
                    theAnimation = new countUp(target, 0, endVal, 0, 2.6, { useEasing : true, useGrouping : true, separator: ' ' });
                    theAnimation.start()
                })
            })

            api.countNames('', function(resp){

                $scope.count_all_names = resp.totalNames
                $('.countUpMe .all_names').each(function() {
                    var target = this,
                    endVal = $scope.count_all_names,
                    theAnimation = new countUp(target, 0, endVal, 0, 2.6, { useEasing : true, useGrouping : true, separator: ' ' });
                    theAnimation.start()
                })

                $scope.count_published_names = resp.totalPublishedNames
                $('.countUpMe .published_names').each(function() {
                    var target = this,
                    endVal = $scope.count_published_names,
                    theAnimation = new countUp(target, 0, endVal, 0, 2.6, { useEasing : true, useGrouping : true, separator: ' ' });
                    theAnimation.start()
                })

                $scope.count_unpublished_names = resp.totalNewNames
                $('.countUpMe .unpublished_names').each(function() {
                    var target = this,
                    endVal = $scope.count_unpublished_names,
                    theAnimation = new countUp(target, 0, endVal, 0, 2.6, { useEasing : true, useGrouping : true, separator: ' ' });
                    theAnimation.start()
                })

                $scope.count_modified_names = resp.totalModifiedNames
                $('.countUpMe .modified_names').each(function() {
                    var target = this,
                    endVal = $scope.count_modified_names,
                    theAnimation = new countUp(target, 0, endVal, 0, 2.6, { useEasing : true, useGrouping : true, separator: ' ' });
                    theAnimation.start()
                })
            })

            $scope.latestNames = []
            api.getNames({ page:1, count:5, status:'all' }).success(function(responseData){
                responseData.forEach(function(name) {
                    $scope.latestNames.unshift(name)
                })
            })

            $scope.publishedNames = []
            api.getRecentlyIndexedNames(function(responseData){
                responseData.forEach(function(name) {
                    $scope.publishedNames.push(name)
                })
            })

            $scope.feedbacks = []
            api.getRecentFeedbacks(function(responseData){
                console.log(responseData)
                responseData.slice(0,4).forEach(function(n) {
                    if (n !== undefined)
                    $scope.feedbacks.push(n)
                })
            })
        }
    ])

    .controller('namesAddEntriesCtrl', [
        '$scope',
        'uploader',
        'namesApi',
        function($scope, Uploader, api) {

            $scope.uploader = Uploader('/v1/names/upload')

            $scope.new = true
            $scope.name = {}

            $scope.submit = function(){
                return api.addName($scope.name, function(){
                    // reset the form models fields
                    $scope.name = {}
                })
            }

        }
    ])

    .controller('namesEditEntryCtrl', [
        '$scope',
        '$stateParams',
        '$state',
        'namesApi',
        'toastr',
        '$window',
        function($scope, $stateParams, $state, api, toastr, $window) {

            var originalName = null

            api.prevAndNextNames($stateParams.entry, function(prev, next){
                $scope.prev = prev
                $scope.next = next
            })

            api.getName($stateParams.entry, false, function(resp){
                $scope.name = resp
                originalName = resp.name
                // hack for names without etymology
                if (!resp.etymology.length) {
                    $scope.name.etymology.push({ part:'', meaning:'' })
                }
            })

            $scope.publish = function(){
                // update name first, then publish
                return api.updateName(originalName, $scope.name, function(name){
                    // first remove name from index
                    return api.removeNameFromIndex(name.name).success(function(){
                        // then add name back to index
                        return api.addNameToIndex(name.name).success(function(){
                            name.state = 'PUBLISHED'
                            name.indexed = true
                            toastr.info(name.name + ' has been published')
                        })
                    })
                })
            }

            $scope.goto = function(entry){
                api.updateName(originalName, $scope.name)
                return $state.go('auth.names.edit_entries', {entry: entry})
            }

            $scope.submit = function(){
                return api.updateName(originalName, $scope.name)
            }

            $scope.delete = function(){
                if ($window.confirm("Are you sure you want to delete " + $scope.name.name + "?")) {
                    return api.deleteName($scope.name, function(){
                        return $window.history.back()
                    })
                }
            }

        }
    ])

    .controller('namesListEntriesCtrl', [
        '$scope',
        'namesApi',
        '$stateParams',
        '$window',
        'toastr',
        function($scope, api, $stateParams, $window, toastr) {

            $scope.namesList = []

            $scope.count = 50

            $scope.status = $stateParams.status

            api.countNames($stateParams.status, function(num){
                $scope.namesListItems = num
            })

            $scope.pagination = {
                current: 1
            }

            $scope.sort = function(keyname){
              $scope.sortKey = keyname;   //set the sortKey to the param passed
              $scope.reverse = !$scope.reverse; //if true make it false and vice versa
            }

            $scope.fetch = function(newPageNumber, count){
                return api.getNames({ status: $stateParams.status, page: newPageNumber || 1, count: count || $scope.itemsPerPage || $scope.count || 50 }).success(function(responseData) {
                    $scope.namesList = []
                    $scope.pagination.current = newPageNumber || 1
                    responseData.forEach(function(name) {
                        $scope.namesList.push(name)
                    })
                })
            }

            $scope.fetch()

            $scope.delete = function(entry){

                if (entry && $window.confirm('Are you sure you want to delete '+ entry.name + '?') ) {
                    return api.deleteName(entry, function(){
                        $scope.namesList.splice( $scope.namesList.indexOf(entry), 1 )
                    }, $scope.status)
                }

                var entries = $.map( $scope.namesList , function(elem){
                    if (elem.isSelected == true) return elem
                })

                if (!entries.length) return toastr.warning('Select names to delete');

                if (!$window.confirm('Are you sure you want to delete the selected names?')) return;

                return api.deleteNames(entries, function(){
                    $scope.fetch($scope.pagination.current, $scope.itemsPerPage)
                }, $scope.status)
                
            }

            $scope.indexName = function(entry){
                
                if (entry.state == 'NEW')
                    return api.addNameToIndex(entry.name).success(function(response){
                        entry.state = 'PUBLISHED'
                        entry.indexed = true
                    })
                else if (entry.state == 'MODIFIED')
                    return api.removeNameFromIndex(entry.name).success(function(){
                        return api.addNameToIndex(entry.name).success(function(){
                            entry.state = 'PUBLISHED'
                            entry.indexed = true
                        })
                    })
                else // assume entry is published and objective is to unpublish it
                    return api.removeNameFromIndex(entry.name).success(function(response){
                        entry.indexed = false
                        entry.state = 'NEW'
                    })
            }

            $scope.republishNames = function(){

                var entries = $.map( $scope.namesList , function(elem){
                    if (elem.isSelected == true) return elem
                })

                if (!entries.length) return toastr.warning('No names selected to republish')

                return api.removeNamesFromIndex(entries).success(function(response){
                    return api.addNamesToIndex(entries).success(function(response){
                        $.map(entries, function(entry) { entry.state = 'PUBLISHED'; entry.indexed = true })
                        toastr.success(entries.length + ' names have been republished')
                    })
                })

            }

            $scope.indexNames = function(action){
                var entries = $.map( $scope.namesList , function(elem){
                    if (elem.isSelected == true) return elem
                })
                if (entries.length > 0) {

                    (!action || action == 'add') ? api.addNamesToIndex(entries).success(function(response){
                        $.map(entries, function(entry) { entry.indexed = true })
                        toastr.success(entries.length + ' names have been published')
                    }).error(function(){
                        toastr.error('Selected names could not be published')
                    })

                    :

                    api.removeNamesFromIndex(entries).success(function(response){
                        $.map(entries, function(entry) { entry.indexed = false })
                        toastr.success(entries.length + ' names unpublished')
                    }).error(function(){
                        toastr.error('Selected names could not be unpublished')
                    })

                }
                else toastr.warning('No names selected')
            }

            // Accept Suggested Name/s
            $scope.accept = function(entry){
                if (entry) return acceptSuggestedName(entry)
                var entries = $.map( $scope.namesList , function(elem){
                    if (elem.isSelected == true) return elem
                })
                if (entries.length > 0) {
                    return entries.forEach(function(entry){
                        acceptSuggestedName(entry)
                    })
                }
                else toastr.warning('Please select names to accept.')
            }

            /**
             * Adds the suggested name to the list of names eligible to be added to search index
             */
              var acceptSuggestedName = function (entry) {
                var name = {
                  name: entry.name,
                  meaning: entry.details,
                  geoLocation: entry.geoLocation,
                  submittedBy: entry.email
                };
                if (!$.isEmptyObject(name)) {
                  return api.addName(name, function () {
                    // Name added then delete from the suggested name store
                    return api.deleteSuggestedName(entry, function(){
                        $scope.namesList.splice( $scope.namesList.indexOf(entry), 1 )
                      })
                  })
                }
              }



        }
    ])

    .controller('namesByUserListCtrl', [
        '$scope',
        'namesApi',
        '$window',
        function ($scope, api, $window) {

            $scope.namesList = []

            api.getNames({ submittedBy: $scope.user.email }).success(function(responseData) {
                $scope.namesListItems = responseData.length
                $scope.namesList = []
                responseData.forEach(function(name) {
                    $scope.namesList.push(name)
                })
            }).error(function(response) {
                console.log(response)
            })
            
            $scope.$on('onRepeatLast', function (scope, element, attrs) {
                $('#user_list').listnav({
                    filterSelector: '.ul_name',
                    includeNums: false,
                    removeDisabled: true,
                    showCounts: false,
                    onClick: function(letter) {
                        $scope.namesListItems = $window.document.getElementsByClassName("listNavShow").length
                        $scope.$apply()
                    }
                })
            })
        }
    ])

    .controller('userListCtrl', [
        '$scope',
        'usersApi',
        '$window',
        function ($scope, api, $window) {
            $scope.usersList = []

            $scope.sort = function(keyname){
              $scope.sortKey = keyname;   //set the sortKey to the param passed
              $scope.reverse = !$scope.reverse; //if true make it false and vice versa
            }

            $scope.pagination = {
                current: 1
            }

            api.countUsers(function(num){
                $scope.usersListItems = num || 50;
            })

            $scope.fetch = function(newPageNumber){
                return api.getUsers({ page:newPageNumber || 1, count:50 }).success(function(response) {
                    $scope.usersList = []
                    response.forEach(function(user) {
                        $scope.usersList.push(user)
                    })
                })
            }

            $scope.fetch()
        }
    ])

    .controller('userAddCtrl', [
        '$scope',
        'usersApi',
        'toastr',
        '$window',
        function ($scope, api, toastr, $window) {
            $scope.user = {}
            $scope.roles = {
                BASIC_LEXICOGRAPHER: 'ROLE_BASIC_LEXICOGRAPHER',
                PRO_LEXICOGRAPHER: 'ROLE_PRO_LEXICOGRAPHER',
                ADMIN: 'ROLE_ADMIN'
            }

            $scope.submit = function () {
                $scope.user.roles = $.map( $scope.roles, function( value, key ) {
                  if (value != false) return value
                })
                return api.addUser($scope.user)
            }
        }
    ])

    .controller('userEditCtrl', [
        '$scope',
        'usersApi',
        'toastr',
        '$state',
        '$stateParams',
        '$window',
        function ($scope, api, toastr, $state, $stateParams, $window) {
            
            api.getUser($stateParams.id).success(function(user){
                $scope.user = user
            }).error(function(resp){
                console.log(resp)
            })

            $scope.roles = {
                BASIC_LEXICOGRAPHER: 'ROLE_BASIC_LEXICOGRAPHER',
                PRO_LEXICOGRAPHER: 'ROLE_PRO_LEXICOGRAPHER',
                ADMIN: 'ROLE_ADMIN'
            }

            $scope.submit = function () {
              $scope.user.roles = $.map( $scope.roles, function( value, key ) {
                if (value != false) return value
              })
              return api.updateUser($scope.user)
            }
        }
    ])

    .controller('profileIndexCtrl', [
        '$scope',
        '$localStorage',
        'usersApi',
        function ($scope, $localStorage, api) {
            api.getUser($localStorage.id).success(function(user){
                $scope.user = user
            }).error(function(resp){
                console.log(resp)
            })
        }
    ])

    .controller('profileEditCtrl', [
        '$scope',
        '$localStorage',
        'usersApi',
        function ($scope, $localStorage, api) {
            api.getUser($localStorage.id).success(function(user){
                $scope.user = user
            }).error(function(resp){
                console.log(resp)
            })
        }
    ])

    .controller('searchCtrl', [
        '$scope',
        '$state',
        'namesApi',
        'toastr',
        '$localStorage',
        function ($scope, $state, api, toastr, $localStorage) {
            $scope.search = $scope.search || {}
            api.getCachedNames(function(names){
                $scope.names = names
            })
            $scope.exec_search = function(){
                var name = $scope.names.some(function(entry){
                    if ($scope.search.entry == entry.name) {
                        return $state.go('auth.names.edit_entries', { entry: $scope.search.entry })
                    }
                })
                if (!name) {
                    api.search($scope.search.entry).success(function(resp){
                        if (resp.length < 1) return toastr.warning( "No entries found for "+ $scope.search.entry );
                        else if (resp.length > 1) {
                            $localStorage.searchResults = resp
                            return $state.go('auth.names.search', { entry: $scope.search.entry })
                        }
                        return $state.go('auth.names.edit_entries', { entry: resp[0].name })
                    })
                }
            }
        }
    ])

    .controller('nameSearchCtrl', [
        '$controller',
        '$scope',
        '$stateParams',
        '$localStorage',
        function ($controller, $scope, $stateParams, $localStorage) {
            if ($stateParams.entry) {
                $scope.search = {
                    entry: $stateParams.entry
                }
                $controller('searchCtrl', {$scope: $scope})
                $scope.results = $localStorage.searchResults
            }
        }
    ])
;