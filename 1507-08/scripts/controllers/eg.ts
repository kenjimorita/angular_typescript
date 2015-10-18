// /<reference path="../../../typings/tsd.d.ts" />

module kitaly.sample01 {

  class SampleController {

    public first: string;
    last;

    constructor($scope){
      //$scope.xxx
      this.first = 'Ryuta';
      this.last = 'Sakamoto';
    }

    public alertFirstName(){
      console.log('aiueo');
    }

    public alertLastName = () => {
      console.log('aiueo');
    }

  }

  angular.module('sampleApp01', ['ng'])
    .controller('sampleController', SampleController);

}
// <div ng-controller="sampleController as ctrl">
//   First Name: <input type="text" ng-model="ctrl.first" ng-focus="ctrl.alertFirstName()"><br/>
//   Last Name: <input type="text" ng-model="ctrl.last"><br/>
//   <br/>
//   Hello, {{ctrl.first}} {{ctrl.last}}!<br/>
// </div>
