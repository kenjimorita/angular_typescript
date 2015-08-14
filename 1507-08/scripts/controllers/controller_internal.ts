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
			this.fafaData= 'morita'
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
		var fafa = angular.module('myApp', []);
		fafa.controller('MyController', MyController);
		fafa.controller('Child',Child);
		fafa.controller('Mago',Mago);
	}
}
