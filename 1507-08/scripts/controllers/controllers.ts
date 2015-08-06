/// <reference path="../../DefinitelyTyped-master/angularjs/angular.d.ts"/>
/// <reference path="../../DefinitelyTyped-master/jquery/jquery.d.ts"/>

class MyController {
	JsonData: any;
	bizdata: any;
	sum: any;
	getdata() : void;
	constructor(
		public JsonData,
		public bizdata,
		public sum
	){}
	getdata(){
		console.log(this.bizdata);
	}
	// this.JsonData.getSampleData().then((res) => {
	// 	this.items = res.data;
	// 	this.show_loading = false;
	// })
	// this.show_loading = true;
}



var fafa = angular.module('myApp', []);
fafa.('myApp').controller('MyController', MyController);
