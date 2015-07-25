/// <reference path="../../DefinitelyTyped-master/angularjs/angular.d.ts"/>
/// <reference path="../../DefinitelyTyped-master/jquery/jquery.d.ts"/>
var myapp = angular.module('myapp', [])
    .controller('myController', ['$scope', function ($scope) {
        $scope.datas = [
            { name: '森田', age: 18, sex: 'male' },
            { name: '本間', age: 20, sex: 'male' },
            { name: '長岐', age: 40, sex: 'famle' },
            { name: '三輪', age: 18, sex: 'male' }
        ];
        $scope.datas2 = [
            { name: 'aaa', phone: '090-999-999', age: 20 },
            { name: 'bbb', phone: '090-888-888', age: 30 },
            { name: 'ccc', phone: '090-444-444', age: 80 },
            { name: 'ddd', phone: '090-666-666', age: 45 },
            { name: 'eee', phone: '090-333-333', age: 64 },
            { name: 'fff', phone: '090-000-000', age: 56 },
            { name: 'ggg', phone: '090-222-222', age: 16 },
            { name: 'hhh', phone: '090-111-111', age: 62 }
        ];
    }]);
