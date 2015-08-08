/// <reference path="../../DefinitelyTyped-master/angularjs/angular.d.ts"/>
/// <reference path="../../DefinitelyTyped-master/jquery/jquery.d.ts"/>
var MyController = (function () {
    function MyController(sum) {
        this.sum = sum;
        this.fafaData = 'fafaDAta';
        console.log(this.fafaData);
    }
    MyController.prototype.getdata = function () {
        console.log(this.bizdata);
    };
    return MyController;
})();
var Child = (function () {
    function Child() {
        this.name = 'kokoko';
        console.log(this.name);
    }
    Child.prototype.getdata = function () {
        console.log(this.bizdata);
    };
    return Child;
})();
var Mago = (function () {
    function Mago() {
        this.name = 'mago';
        console.log(this.name);
    }
    Mago.prototype.getdata = function () {
        console.log(this.bizdata);
    };
    return Mago;
})();
var fafa = angular.module('myApp', []);
fafa.controller('MyController', MyController);
fafa.controller('Child', Child);
fafa.controller('Mago', Mago);
