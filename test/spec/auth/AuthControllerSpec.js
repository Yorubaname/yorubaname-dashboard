'use strict';

describe("Module: AuthModule: Controller: AuthController", function () {

    var $scope;
    var authService;

    beforeEach(function () {
        angular.mock.module('AuthModule');
        angular.mock.inject(function($rootScope, $controller, _AuthService_) {
            $scope = $rootScope.$new();
            $scope.login = {};
            authService =_AuthService_;
            spyOn(authService, 'authenticate');
            spyOn(authService, 'logout');
            $controller('AuthController', {
                $scope: $scope,
                AuthService: authService
            });
        });

    });

    it('Should call authenticate on AuthService on submit', function() {
        $scope.submit();
        expect(authService.authenticate).toHaveBeenCalled();
    });

    it('Should call logout on AuthService on logout', function() {
        $scope.logout();
        expect(authService.logout).toHaveBeenCalled();
    });
});