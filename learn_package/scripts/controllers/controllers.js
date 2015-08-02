/// <reference path="../../DefinitelyTyped-master/angularjs/angular.d.ts"/>
/// <reference path="../../DefinitelyTyped-master/jquery/jquery.d.ts"/>
var myapp = angular.module('myapp', [])
    .controller('myController', ['$scope', function ($scope) {
        $scope.name = 'morita';
        $scope.getName = function () {
            return 'yourName is' + $scope.name;
        };
    }]);
