/// <reference path="../../DefinitelyTyped-master/angularjs/angular.d.ts"/>
/// <reference path="../../DefinitelyTyped-master/jquery/jquery.d.ts"/>
angular.module('myApp')
    .factory('bizdata', function () {
    var frameworks = ['backbone.js', 'Ember.js', 'knockout.js'];
    return function () {
        return frameworks;
    };
})
    .factory('JsonData', function ($http) {
    return {
        getSampleData: function () {
            return $http.get('../biz_data.json')
                .success(function (data, status, headers, config) {
            });
        }
    };
})
    .factory('sum', function () {
    return function () {
        return { 'hoge': 0, 'fuga': 0, 'sum': 0 };
    };
})
    .directive('jsonData', function (JsonData) {
    return {
        compile: function (tElem, tAttrs, tTramsclude) {
            var jsonD;
            return function ($scope) {
                JsonData.getSampleData().then(function (data) {
                    $scope.jsonD = data.data.jobs;
                    console.log($scope.jsonD);
                });
            };
        },
        template: '<table class="table">'
            + '<tr ng-repeat="result in $scope.jsonD">'
            + '<td>{{result.name}}</td>'
            + '<td>{{result.$index}}</td>'
            + '</tr>'
            + '</table>'
    };
})
    .directive('apiDirective', function () {
    return {
        link: function () {
            var apiURL = 'data.json';
        }
    };
})
    .directive('serchbarInput', function () {
    return {
        scope: {
            stringmorita: '=moritaDAta'
        },
        restrict: 'A',
        compile: function (tElem, tAttr, tTranclude) {
            console.log('haittemasu');
            var fafa = 'fafa';
            return function (scope, iElement, iAttrs, controller, iTransclude) {
                scope.fafa = 'scopenainomorita';
                console.log(scope.fafa);
            };
        },
        transclude: true,
        template: '<div ng-transclude>fafa</div>'
    };
});
