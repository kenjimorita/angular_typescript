/// <reference path="../../DefinitelyTyped-master/angularjs/angular.d.ts"/>
/// <reference path="../../DefinitelyTyped-master/jquery/jquery.d.ts"/>

var myapp = angular.module('myapp',[])
	.controller('myController',['$scope','JsonData',function($scope,JsonData){
		$scope.datas = [
			{ name :'森田', age: 18, sex : 'male' },
			{ name :'本間', age: 20, sex : 'male' },
			{ name :'長岐', age: 40, sex : 'famle' },
			{ name :'三輪', age: 18, sex : 'male' }
		];
		$scope.datas2 = [
			{name:'aaa', phone:'090-999-999', age:20},
			{name:'bbb', phone:'090-888-888', age:30},
			{name:'ccc', phone:'090-444-444', age:80},
			{name:'ddd', phone:'090-666-666', age:45},
			{name:'eee', phone:'090-333-333', age:64},
			{name:'fff', phone:'090-000-000', age:56},
			{name:'ggg', phone:'090-222-222', age:16},
			{name:'hhh', phone:'090-111-111', age:62}
		];
		JsonData.getSampleData().then(function(res){
			$scope.items = res.data;
			$scope.show_loading = false;
			}
		);
		$scope.show_loading = true;
	}])
	.directive('hierarcyFast',function(){
		return {
			template:
					'<div class="fafa"><li ng-repeat="(key,val) in datas">{{ key }}{{ val }}</li>'
					+'<li ng-repeat="data in datas">{{ $index }}</li>'
					+'<li ng-repeat="data in datas">{{ ($even) ? "○" : "x" }}</li>'
					+'<li ng-repeat="data in datas">{{ ($middle) ? "o" : "x" }}</li>'
					+'<li ng-repeat="data in datas">{{ data.age | number}}</li>'
					+'<li>{{ datas | json}}</li>'
					+'</div>'
		}
	})
	.directive('apiDirective',function(){
		return {
			link : function(){
				var apiURL = 'file:///Users/No51/Desktop/Git/angular_typescript/1507-08/data.json'
			}
		}
	})
	.factory('JsonData',function($http){
		return {
			getSampleData : function(){
				return $http.get('../data.json')
				.success(function(data,status,headers,config){
					var time = new Date().getTime();
					while (new Date().getTime() < time + 1000);

					return data;
				});
			}
		}
	});
	myapp.controller('HelloCtrl',['$scope',function($scope){
		$scope.name = '';
		$scope.$watch(function () {
				console.log('$watch expression is called!');
				return $scope.name;
		}, function (newValue, oldValue) {
				console.log('"name" changed: ' + oldValue + ' => ' + newValue);
		});
	}]);
