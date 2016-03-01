/* Controllers */
dashboardappApp

    .controller('namesAddEntriesCtrl', [
        '$rootScope',
        '$scope',
        'namesService',
        function($rootScope, $scope, api) {

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
        'namesService',
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
                return api.updateName(originalName, $scope.name, function(){
                    // first remove name from index
                    api.removeNameFromIndex($scope.name.name)
                    // then add name back to index
                    return api.addNameToIndex($scope.name.name).success(function(){
                        $scope.name.state = 'PUBLISHED'
                        $scope.name.indexed = true
                        toastr.info($scope.name.name + ' has been published')
                        return $window.history.back()
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
        'namesService',
        '$stateParams',
        '$window',
        'toastr',
        function($scope, api, $stateParams, $window, toastr) {

            $scope.namesList = []

            $scope.status = $stateParams.status

            $scope.count = 50
            
            $scope.pagination = {
              current: 1
            }

            $scope.sort = function(keyname){
              $scope.sortKey = keyname;   //set the sortKey to the param passed
              $scope.reverse = !$scope.reverse; //if true make it false and vice versa
            }

            api.countNames($stateParams.status, function(num){
                $scope.namesListItems = num
            })

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
                        $scope.namesListItems--
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
                        $.map(entries, function(entry) { entry.indexed = true; entry.state = 'PUBLISHED' })
                        toastr.success(entries.length + ' names have been published')
                    }).error(function(){
                        toastr.error('Selected names could not be published')
                    })

                    :

                    api.removeNamesFromIndex(entries).success(function(response){
                        $.map(entries, function(entry) { entry.indexed = false; entry.state = 'NEW'  })
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
                    return api.deleteName(entry, function(){
                        $scope.namesList.splice( $scope.namesList.indexOf(entry), 1 )
                      }, 'suggested')
                  })
                }
              }

        }
    ])

    .controller('namesByUserListCtrl', [
        '$scope',
        'namesService',
        '$window',
        function ($scope, api, $window) {

            $scope.namesList = []

            api.getNames({ submittedBy: $scope.user.email }).success(function(responseData) {
                $scope.namesListItems = responseData.length
                $scope.namesList = []
                responseData.forEach(function(name) {
                    $scope.namesList.push(name)
                })
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

    .controller('namesFeedbacksCtrl', [
        '$scope',
        'namesService',
        '$window',
        'toastr',
        function($scope, api, $window, toastr){

            $scope.count = 50
            $scope.feedbacks = []
            $scope.pagination = {
              current: 1
            }

            $scope.sort = function(keyname){
              $scope.sortKey = keyname;   //set the sortKey to the param passed
              $scope.reverse = !$scope.reverse; //if true make it false and vice versa
            }

            $scope.fetch = function(newPageNumber, count){
                return api.getRecentFeedbacks(function(responseData){
                    $scope.pagination.current = newPageNumber || 1
                    $scope.feedbacks = []
                    responseData.forEach(function(n) {
                        $scope.feedbacks.push(n)
                    })
                })
            }

            $scope.fetch()

            $scope.delete = function(entry){
                // delete listed feedback entry
                if (entry && $window.confirm('Are you sure you want to delete this feedback on '+ entry.name + '?') ) {
                    return api.deleteFeedback(entry.id, function(){
                        $scope.feedbacks.splice( $scope.feedbacks.indexOf(entry), 1 )
                        // $scope.count--
                    })
                }

            }
        }
    ])