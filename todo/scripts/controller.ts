///<reference path="../../DefinitelyTyped-master/angularjs/angular.d.ts" />
///<reference path="../../DefinitelyTyped-master/angularjs/angular-mocks.d.ts" />

angular.module('myapp',[])
.controller('SampleController',function($scope,$timeout){
		$scope.modify = function(){
			$timeout(function(){
				$scope.data += "だった";
		},3000);
	};
});
