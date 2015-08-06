/// <reference path="../../DefinitelyTyped-master/angularjs/angular.d.ts"/>
/// <reference path="../../DefinitelyTyped-master/jquery/jquery.d.ts"/>
var MyController = (function () {
    function MyController(JsonData, bizdata, sum) {
        this.JsonData = JsonData;
        this.bizdata = bizdata;
        this.sum = sum;
    }
    MyController.prototype.getdata = function () {
        console.log(this.bizdata);
    };
    return MyController;
})();
var fafa = angular.module('myApp', []);
fafa.('myApp').controller('MyController', MyController);
