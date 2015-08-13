/// <reference path="../../DefinitelyTyped-master/angularjs/angular.d.ts"/>
/// <reference path="../../DefinitelyTyped-master/jquery/jquery.d.ts"/>

angular.module('myApp')
// .directive('hierarcyFast',function(){
// 	return {
// 		compile : function(tElem, tAttrs, tTramsclude){
// 			return function(){
// 				console.log('eeeee');
// 			}
// 		},
// 		template:
// 				'<div class="fafa"><li ng-repeat="(key,val) in datas">{{ key }}{{ val }}</li>'
// 				+'<li ng-repeat="data in datas">{{ $index }}</li>'
// 				+'<li ng-repeat="data in datas">{{ ($even) ? "○" : "x" }}</li>'
// 				+'<li ng-repeat="data in datas">{{ ($middle) ? "o" : "x" }}</li>'
// 				+'<li ng-repeat="data in datas">{{ data.age | number}}</li>'
// 				+'<li>{{ datas | json}}</li>'
// 				+'</div>'
// 	}
// })
.directive('apiDirective',function(){
	return {
		link : function(){
			var apiURL = 'data.json'
		}
	}
})
.directive('serchbarInput',function(){
	return {
		scope: {
			stringmorita : '=moritaDAta'
		},
		restrict : 'A',
		compile : function(tElem, tAttr, tTranclude){
			console.log('haittemasu');
			var fafa = 'fafa';
			return function (scope, iElement, iAttrs, controller, iTransclude){
				scope.fafa = 'scopenainomorita'
				console.log(scope.fafa);

			}
		},
		transclude : true,
		template : '<div ng-transclude>fafa</div>'
	}
})
.directive('fafaSearch',function(){
	return {
		template : '<div ng-if="isClose" style="width:400px;background:#000;" ng-class="isClose" ng-click="inputClick()"><input type="text" value="{{ message }}" /></div>',
		compile : function(){
			var isClose;
			console.log("directive");
			return function(scope, iElem, iAttr, icontroller, iTransclude){
				scope.message = "fafafa";
				scope.isClose = true;
				function inputClick(){
					if(isClose){
						iElem.addClass('isOpen');
						console.log('あきました');
						scope.isClose = false;
					}else{
						iElem.removeClass('isOpen');
						console.log('閉めました');
						scope.isClose = true;
					}
				}
			}
		}
	}
});
