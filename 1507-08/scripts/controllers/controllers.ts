/// <reference path="../../DefinitelyTyped-master/angularjs/angular.d.ts"/>
/// <reference path="../../DefinitelyTyped-master/jquery/jquery.d.ts"/>

class MyController{
	constructor(public $scope){
		this.$scope = $scope;
		MyController.$inject = ["$scope"];//サービスは自分のコンストラクタに$injectで
	}
}


	var myApp = angular.module("myApp", ["ngMessages","ui.validate"]);
	myApp.controller("MyController",MyController);
