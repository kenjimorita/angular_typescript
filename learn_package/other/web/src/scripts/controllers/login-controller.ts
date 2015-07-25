/// <reference path="../vendor_def/tsd.d.ts" />
/// <reference path="../services/common/routes.ts" />

module controllers.login {

  export class Login {
    email: string;
    password: string;
    destination: string;

    constructor(
      private routes: st.Routes,
      private stUtils: std.Utils,
      private $location: ng.ILocationService
    ){
      var dest = $location.search()['dest'];
      this.destination = _.isEmpty(dest) ? '/' : dest;
    }
    
    login(form: ng.IFormController){
      if(form.$invalid){
        return;
      }
      
      var that = this;
      
      this.routes.account.login({email: that.email, password: that.password})
        .success((data) => {
          location.href = this.destination;
        })
        .error((data, status) => {
          if (status == 401) {
            that.stUtils.toastDanger(data.msg);
          }
        })
      ;
    }

  }
}

module stanby.routing.login {
  export function initRouting(){

    angular.module('stanbyControllers')
      .controller('LoginCtrl', controllers.login.Login)
      .config(($stateProvider: ng.ui.IStateProvider, $urlRouterProvider: ng.ui.IUrlRouterProvider) => {

        $urlRouterProvider.otherwise('');

        $stateProvider
          .state('index', {
            url: '',
            templateUrl: '/templates/login/index.html',
            anonAllowed: true,
            controller: 'LoginCtrl as c'
          })
        ;
      })
    ;
  }
}
