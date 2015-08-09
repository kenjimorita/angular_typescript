/// <reference path="../../DefinitelyTyped-master/angularjs/angular.d.ts"/>
/// <reference path="../../DefinitelyTyped-master/jquery/jquery.d.ts"/>
var moritaController;
(function (moritaController) {
    var MyController = (function () {
        function MyController(sum) {
            this.sum = sum;
            this.fafaData = 'morita';
            console.log(this.fafaData);
        }
        MyController.prototype.getdata = function () {
            console.log(this.bizdata);
        };
        return MyController;
    })();
    moritaController.MyController = MyController;
    ;
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
    moritaController.Child = Child;
    ;
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
    moritaController.Mago = Mago;
    function initRouting() {
        var fafa = angular.module('myApp', []);
        fafa.controller('MyController', MyController);
        fafa.controller('Child', Child);
        fafa.controller('Mago', Mago);
    }
    moritaController.initRouting = initRouting;
})(moritaController || (moritaController = {}));
