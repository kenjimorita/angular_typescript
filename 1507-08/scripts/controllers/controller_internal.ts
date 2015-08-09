/// <reference path="../../DefinitelyTyped-master/angularjs/angular.d.ts"/>
/// <reference path="../../DefinitelyTyped-master/jquery/jquery.d.ts"/>

 module moritaController{
	 export class MyController{
		JsonData : any;
		bizdata : any;
		fafaData : any;
		sum : any;
		constructor(
			sum
		){
			this.sum = sum;
			this.fafaData= fafaData;
			console.log(this.fafaData);
		}
		getdata(){
			console.log(this.bizdata);
		}
	};
	export class Child{
	 	name: string = 'kokoko';
	 	bizdata : any;
		constructor(
		){
			console.log(this.name);
		}
	 	getdata():void {
			console.log(this.bizdata);
		}
	};
	export class Mago{
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
	export function initRouting(){
		angular.module('myApp', [])
		.controller('MyController', MyController)
		.controller('Child',Child)
		.controller('Mago',Mago);
	}
}
