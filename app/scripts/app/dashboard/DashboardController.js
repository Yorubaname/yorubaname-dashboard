/* Controllers */
dashboardappApp

    .controller('dashboardCtrl', [
        '$scope',
        'namesService',
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
                responseData.slice(0,4).forEach(function(n) {
                    if (n !== undefined)
                    $scope.feedbacks.push(n)
                })
            })
        }
    ])