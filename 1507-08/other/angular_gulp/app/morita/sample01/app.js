///<reference path="../../../typings/tsd.d.ts" />
// angular.module('sample', ['ng']);
//  .controller('SampleController', function($scope){
//    this.first = 'Itaru';
//    this.last = 'Kitagawa';
//
//    this.alertFirstName = function(){
//      console.log('heyhey');
//    }
//  });
//
//
//
// class SampleController {
//
//   public first: string;
//   last;
//
//   constructor($scope){
//     //$scope.xxx
//     this.first = 'Ryuta';
//     this.last = 'Sakamoto';
//   }
//
//   public alertFirstName(){
//     console.log('aiueo');
//   }
//
//   public alertLastName = () => {
//     console.log('aiueo');
//   }
//
// }
var Morita = (function () {
    function Morita(name) {
        this.name = name;
    }
    return Morita;
})();
// angular.module('sample', ['ng'])
//   .controller('SampleController', SampleController);
var main = angular.module('sample', ['ng']);
main.service('name', function () {
    return name = 'nnn';
});
main.controller('Morita', Morita);
var morita = new Morita("lpmpra");
// console.log(morita.fafa());
