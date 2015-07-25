/// <reference path="../vendor_def/tsd.d.ts" />
/// <reference path="../services/common/routes.ts" />


module controllers.password {

  export class ForgotPassword {
    email: string;
    isSent: boolean = false;

    constructor(
      private routes: st.Routes
    ){}

    submit(form: ng.IFormController) {
      if(form.$invalid){
        return;       
      }
      
      var that = this;
      this.routes.account.forgotPassword({email: that.email})
        .success(() => {
          that.isSent = true;
        });
    }
  }
}


module stanby.routing.forgotpassword {

  export function initRouting(){

    angular.module('stanbyControllers')
      .controller('ForgotPasswordCtrl', controllers.password.ForgotPassword)
      .config(($stateProvider: ng.ui.IStateProvider) => {

        $stateProvider
          .state('input', {
            url: '',
            templateUrl: '/templates/account/issue-forgot-password.html',
            anonAllowed: true,
            controller: 'ForgotPasswordCtrl as c'
          })
        ;
      })
    ;
  }
}
