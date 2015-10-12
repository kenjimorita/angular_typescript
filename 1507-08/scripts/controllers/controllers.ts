/// <reference path="../../DefinitelyTyped-master/angularjs/angular.d.ts"/>
/// <reference path="../../DefinitelyTyped-master/jquery/jquery.d.ts"/>

class MyController{
	public fafa:string;
	public efafa:string;
	public myForm;
	public user:{efafa:string;};
	constructor(
	){}
		getdata(){
			console.log(this.fafa);
		}
		public validateCorporateIdPattern(value:string){
			alert(value);
		}
	};
	var myApp = angular.module("myApp", ["ngMessages","ui.validate"]);
	myApp.controller("MyController", function(){new MyController();});
