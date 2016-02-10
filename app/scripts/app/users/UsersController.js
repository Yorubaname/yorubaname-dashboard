/* Controllers */
dashboardappApp

    .controller('userListCtrl', [
        '$scope',
        'usersService',
        '$window',
        function ($scope, api, $window) {
            $scope.usersList = []

            $scope.count = 50
            
            $scope.pagination = {
                current: 1
            }
            
            $scope.sort = function(keyname){
                $scope.sortKey = keyname;   //set the sortKey to the param passed
                $scope.reverse = !$scope.reverse; //if true make it false and vice versa
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

    .controller('profileIndexCtrl', [
        '$scope',
        '$localStorage',
        'usersService',
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
        'usersService',
        function ($scope, $localStorage, api) {
            api.getUser($localStorage.id).success(function(user){
                $scope.user = user
            }).error(function(resp){
                console.log(resp)
            })
        }
    ])