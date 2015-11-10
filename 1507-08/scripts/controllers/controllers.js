var MyController = (function () {
    function MyController($scope) {
        this.$scope = $scope;
        this.$scope = $scope;
        MyController.$inject = ["$scope"];
    }
    return MyController;
})();
var myApp = angular.module("myApp", ["ngMessages", "ui.validate"]);
myApp.controller("MyController", MyController);
