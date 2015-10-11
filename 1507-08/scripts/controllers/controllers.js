var MyController = (function () {
    function MyController() {
        this.fafaData = 'morita';
        console.log(this.fafaData);
    }
    MyController.prototype.getdata = function () {
        console.log(this.bizdata);
    };
    return MyController;
})();
;
var myApp = angular.module('myApp', []);
myApp.controller('MyController', function () { new MyController(); });
