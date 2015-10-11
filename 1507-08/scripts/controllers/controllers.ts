/// <reference path="../../DefinitelyTyped-master/angularjs/angular.d.ts"/>
/// <reference path="../../DefinitelyTyped-master/jquery/jquery.d.ts"/>

	 class MyController{
		JsonData : any;
		bizdata : any;
		fafaData : any;
		sum : any;
		constructor(

		){
			this.fafaData= 'morita';
			console.log(this.fafaData);
		}
		getdata(){
			console.log(this.bizdata);
		}
	};

		var myApp = angular.module('myApp', []);
		myApp.controller('MyController', function(){new MyController()});
		// fafa.controller('Child',Child);
		// fafa.controller('Mago',Mago);
