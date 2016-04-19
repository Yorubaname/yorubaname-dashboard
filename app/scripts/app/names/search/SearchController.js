/* Controllers */
angular.module("dashboardappApp")
    .controller('searchCtrl', [
        '$scope',
        '$state',
        'namesService',
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