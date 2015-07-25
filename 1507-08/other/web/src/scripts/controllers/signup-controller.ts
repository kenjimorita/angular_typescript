/// <reference path="../vendor_def/tsd.d.ts" />
/// <reference path="../services/common/routes.ts" />
/// <reference path="../directives/common/widgets.d.ts" />

module controllers.register {
  export interface SignUpModel {
    companyName: string;
    phone: string;
    fullName: string;
    email: string;
    password: string;
  }

  export class SignUp {
    model: SignUpModel;

    constructor(
        private $scope,
        private $timeout,
        private routes: st.Routes,
        private stUtils: std.Utils,
        private stModal: std.Modal
    ) {
    }

    public submit(form: any): void {

      var that = this;
      this.routes.account.signup(this.model)
      .success(data => {
        that.stModal.modalAlert({
          msg: 'メールアドレスの登録確認のメールを送信いたしました。<br>ご確認いただき、登録を完了させてください。',
          okButton: 'ひきつづき求人を登録する'
        })
        .result.finally(() => {
          location.href = '/jobs?justRegistered#/add'; //NOTE(kitaly): DO NOT DELETE "justRegistered"! "justRegistered" is for TagManager to detects account registration
        })
      })
      .error((xhr) => {
        if (xhr.key == 'auth.signup.alreadyRegistered') {
          that.stUtils.toastDanger('入力したメールアドレスはすでに登録されています。');
        }else if (xhr.key == 'auth.signup.basicValidationFailed') {
          var formNames = {
            "fullName" : "氏名",
            "email": "メールアドレス",
            "password" : "パスワード" ,
            "companyName" : "会社名" ,
            "phone" : "電話番号"
          };
          var errMsg: string = "";
          xhr.details.map((err) => {
            errMsg = errMsg + "<br/>" + formNames[err];
          });
          that.stUtils.toastDanger('登録に失敗しました。入力項目をご確認ください。' + errMsg);

        }else{
          that.stUtils.toastDanger('通信に失敗しました。時間をおいて、再度お試しください。');
        }
      });
    }
  }
}

module stanby.routing.signup {
  export function initRouting(){

    angular.module('stanbyControllers')
      .controller('SignUpCtrl', ['$scope', '$timeout', 'routes', 'stUtils', 'stModal',
        controllers.register.SignUp])
      .config(
      ($stateProvider, $urlRouterProvider) => {
        $urlRouterProvider.otherwise('/');
        $stateProvider.state('signup', {
          url: '/',
          templateUrl: '/templates/signup/index.html',
          controller: 'SignUpCtrl as c',
          anonAllowed: true
        });
      });
  }
}
