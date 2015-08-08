/// <reference path="../../DefinitelyTyped-master/angularjs/angular.d.ts"/>
/// <reference path="../../DefinitelyTyped-master/jquery/jquery.d.ts"/>


class MyController {
	JsonData : any;
	bizdata : any;
	fafaData : any;
	sum : any;
	constructor(
		sum
	){
		this.sum = sum;
		this.fafaData= 'fafaDAta'
		console.log(this.fafaData);
	}
	getdata(){
		console.log(this.bizdata);
	}
	// this.JsonData.getSampleData().then((res) => {
	// 	this.items = res.data;
	// 	this.show_loading = false;
	// })
	// this.show_loading = true;
}

class Child{
 	name: string = 'kokoko';
 	bizdata : any;
	constructor(
	){
		console.log(this.name);
	}
 	getdata():void {
		console.log(this.bizdata);
	}
}
class Mago{
 	name: string = 'mago';
 	bizdata : any;
	constructor(
	){
		console.log(this.name);
	}
 	getdata():void {
		console.log(this.bizdata);
	}
}



var fafa = angular.module('myApp', []);
fafa.controller('MyController', MyController);
fafa.controller('Child',Child);
fafa.controller('Mago',Mago);
