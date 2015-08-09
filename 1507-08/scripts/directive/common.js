/// <reference path="../../DefinitelyTyped-master/angularjs/angular.d.ts"/>
/// <reference path="../../DefinitelyTyped-master/jquery/jquery.d.ts"/>
angular.module('myApp')
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
})
    .directive('fafaSearch', function () {
    return {
        template: '<a ng-if="isClose" ng-class="isClose" ng-click="inputClick()"><input type="text" value="{{ message }}" /></a>',
        compile: function () {
            var isClose;
            console.log("directive");
            return function (scope, iElem, iAttr, icontroller, iTransclude) {
                scope.message = "fafafa";
                scope.isClose = true;
                function inputClick() {
                    if (isClose) {
                        iElem.addClass('isOpen');
                        console.log('あきました');
                        scope.isClose = false;
                    }
                    else {
                        iElem.removeClass('isOpen');
                        console.log('閉めました');
                        scope.isClose = true;
                    }
                }
            };
        }
    };
});
