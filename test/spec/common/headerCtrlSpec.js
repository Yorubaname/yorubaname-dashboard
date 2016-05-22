'use strict';

describe("Controller: headerCtrl", function () {
    var $scope, authService;

    beforeEach(function () {
        angular.mock.module('dashboardappApp');
        inject(function($rootScope, $controller, _authService_) {
            authService = _authService_;
            $scope = $rootScope.$new();
            spyOn(authService, 'logout');
            $controller('headerCtrl', {
                $scope: $scope,
                authService: authService
            });
        });
    });

    it("Should call logout on authService on logging out", function() {
        $scope.logout();
        expect(authService.logout).toHaveBeenCalled();
    });
});