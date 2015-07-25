/// <reference path="../vendor_def/tsd.d.ts" />
/// <reference path="../services/common/routes.ts" />


module controllers.verify {
  
  export interface VerifyParams extends ng.ui.IStateParamsService {
    token: string
  }
  
  export interface VerifyScope extends ng.IScope{
    tokenValid: boolean
    tokenInvalid: boolean
    resetComplete: boolean
  }

  export class VerifyForgotPassword {
    newPassword: string
    form: ng.IFormController

    constructor(
      private $scope: controllers.verify.VerifyScope,
      private routes: st.Routes,
      private $stateParams: controllers.verify.VerifyParams,
      private stUtils: std.Utils
    ){
      var token = $stateParams.token;
      
      this.routes.account.verifyForgotPassword(token)
        .success(() => {
          $scope.tokenValid = true;
        })
        .error((data, status) => {
          $scope.tokenInvalid = true;
        })
    }

    resetPassword(form:ng.IFormController){
      if(form.$invalid) {
        return;
      }
      
      var data = {newPassword: this.newPassword, token: this.$stateParams.token};
      var that = this;
      
      this.routes.account.resetForgotPassword(data)
        .success(() => {
          that.$scope.resetComplete = true;
        });
    }
  }
}

module stanby.routing.verify {
  export function initRouting(){

    angular.module('stanbyControllers')
      .controller('VerifyForgotPasswordCtrl', controllers.verify.VerifyForgotPassword)
      .config(($stateProvider: ng.ui.IStateProvider) => {

        $stateProvider
          .state('signup', {
            url: '/signup/:token',
            templateUrl: '/templates/account/verify-signup.html',
            anonAllowed: true,
            controller: ($scope: controllers.verify.VerifyScope, routes: st.Routes, $stateParams: controllers.verify.VerifyParams) => {

              routes.account.verifySignup($stateParams.token)
                .success(() => {
                  $scope.tokenValid = true;
                })
                .error((data, status) => {
                  if(status == 400){
                    $scope.tokenInvalid = true;
                  }
                });
            }
          })
          .state('email-change', {
            url: '/email-change/:token',
            templateUrl: '/templates/account/verify-email-change.html',
            anonAllowed: true,
            controller: ($scope: controllers.verify.VerifyScope, routes: st.Routes, $stateParams: controllers.verify.VerifyParams) => {

              routes.account.verifyEmailChange($stateParams.token)
                .success(() => {
                  $scope.tokenValid = true;
                })
                .error((data, status) => {
                  if(status == 400){
                    $scope.tokenInvalid = true;
                  }
                });
            }
          })
          .state('forgot-password', {
            url: '/forgot-password/:token',
            templateUrl: '/templates/account/verify-forgot-password.html',
            anonAllowed: true,
            controller: 'VerifyForgotPasswordCtrl as c'
          })
        ;
      })
    ;
  }
}
