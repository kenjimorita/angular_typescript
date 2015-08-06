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

	){
		console.log(this.sum);
	}
	getdata():void {
		// console.log(this.bizdata);
	}
	// this.JsonData.getSampleData().then((res) => {
	// 	this.items = res.data;
	// 	this.show_loading = false;
	// })
	// this.show_loading = true;
}

class Child{
	public name: string = 'kokoko';
	getdata() : void;
	constructor(
	){
		console.log(this.name);
	}
	public getdata():void {
		// console.log(this.bizdata);
	}
}
class Mago{
	public name: string = 'mago';
	getdata() : void;
	constructor(
	){
		console.log(this.name);
	}
	public getdata():void {
		// console.log(this.bizdata);
	}
}



var fafa = angular.module('myApp', []);
fafa.controller('MyController', MyController);
fafa.controller('Child',Child);
fafa.controller('Mago',Mago);
