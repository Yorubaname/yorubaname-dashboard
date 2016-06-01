'use strict';

describe("Module: NamesModule: Controller: NamesAddEntriesCtrl", function () {

    var $scope;
    var namesService;

    beforeEach(function () {
        angular.mock.module('NamesModule');
        angular.mock.inject(function($rootScope, $controller, _NamesService_) {
            $scope = $rootScope.$new();
            $scope.name = {
                "testProp": "testVal"
            };
            namesService =_NamesService_;
            spyOn(namesService, 'addName');

            $controller('NamesAddEntriesCtrl', {
                $scope: $scope,
                NamesService: namesService
            });
        });

    });

    it('Should call addName on NamesService and should reset name that was filled in on submit', function() {
        $scope.submit();
        expect(namesService.addName).toHaveBeenCalled();
        expect($scope.name).toEqual({});
    });

});