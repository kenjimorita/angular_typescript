/// <reference path="../../DefinitelyTyped-master/angularjs/angular.d.ts"/>
/// <reference path="../../DefinitelyTyped-master/jquery/jquery.d.ts"/>
var MyController = (function () {
    function MyController(JsonData, bizdata, sum) {
        this.JsonData = JsonData;
        this.bizdata = bizdata;
        this.sum = sum;
        console.log(this.sum);
    }
    MyController.prototype.getdata = function () {
    };
    return MyController;
})();
var Child = (function () {
    function Child() {
        this.name = 'kokoko';
        console.log(this.name);
    }
    Child.prototype.getdata = function () {
    };
    return Child;
})();
var Mago = (function () {
    function Mago() {
        this.name = 'mago';
        console.log(this.name);
    }
    Mago.prototype.getdata = function () {
    };
    return Mago;
})();
var fafa = angular.module('myApp', []);
fafa.controller('MyController', MyController);
fafa.controller('Child', Child);
fafa.controller('Mago', Mago);
