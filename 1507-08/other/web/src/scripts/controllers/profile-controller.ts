/// <reference path="../vendor_def/tsd.d.ts" />
/// <reference path="../services/common/routes.ts" />
/// <reference path="../directives/common/widgets.d.ts" />

module controllers.profile {

  export class Profile {
    constructor(
      public enums: sb.Enums,
      private routes: st.Routes,
      private stUtils: std.Utils,
      private profilePromise,
      $scope: any
    ) {
      $scope.enums = this.enums;
      $scope.routes = this.routes;
      $scope.init = () => {
        $scope.profile = profilePromise.data.corpUser;
        $scope.roles = _.pluck(profilePromise.data.roles, 'role');
      };
      $scope.resendConfirmation = () => {
        this.routes.profile.resendConfirmation()
          .success(() => {
            this.stUtils.toastInfo('認証メールを再送しました。');
          })
          .error(() => {
            this.stUtils.toastDanger('認証メールの再送に失敗しました。');
          });
      };
    }
  }


  export class Password {
    constructor(
        $scope: any,
        $state: any,
        stUtils: std.Utils,
        routes: st.Routes) {

      $scope.init = () => {
        $scope.password = {
          password: null,
          newPassword: null,
          newPasswordConfirm: null
        };
      };

      $scope.update = form => {
        if (form.$valid) {
          routes.profile.changePassword($scope.password)
            .success(data => {
              stUtils.toastInfo('パスワードを変更しました。');
              $state.transitionTo("profile")
            }).error(xhr => {
              if(xhr.key == 'auth.signup.currentPasswordNotMatch'){
                stUtils.toastDanger('現在のパスワードが間違っています。');
                $scope.password = null;
              } else if (xhr.key == 'auth.password.invalidFormat'){
                stUtils.toastDanger(xhr.msg);
                $scope.password = null;
              }
            });
        }
      }
    }
  }


  export class Email {
    constructor(
        $scope: any,
        $state: any,
        stUtils: std.Utils,
        routes: st.Routes,
        _:_.LoDashStatic
    ) {

      $scope.init = () => {
        $scope.email = ""
      };

      $scope.update = form => {
        if (form.$valid) {
          routes.profile.changeEmail({email: $scope.email})
            .success(data => {
              stUtils.withUpdateOkMessage(() => {
                $state.transitionTo("profile")
              })
            })
            .error((xhr) => {
              var errList = xhr['details']['email']
              var duplicateError = _.find(errList, {'key': 'error.profile.emailDuplication'});
              if(duplicateError){
                stUtils.toastDanger('すでに使用されているメールアドレスです。');
              }
            });
        } else {
          stUtils.toastDanger("入力エラーがあります");
        }
      }
    }
  }


  export class BasicInfo {
    constructor(
      $scope: any,
      $state: any,
      stModal: std.Modal,
      stUtils: std.Utils,
      routes: st.Routes) {

      $scope.init = () => {
        routes.profile.show().success((data) => {
          $scope.profile = data;
        })
      };

      $scope.update = form => {
        var modal = stModal.modalConfirm({
          msg: '変更を保存します。よろしいですか？'
        });

        if (form.$valid) {
          modal.result.then(() => {
            if (!$scope.profile.title) {
              $scope.profile.title = null;
            }
            var data = {
              fullName: $scope.profile.fullName,
              title: $scope.profile.title
            };
            routes.profile.update(data).success(data => {
              stUtils.withUpdateOkMessage(() => {
                $state.transitionTo("profile")
              })
            });
          });
        }
      };
    }
  }
}

module stanby.routing.profile{

  import UserDetailResponse = stanby.models.users.UserDetailResponse;

  export function initRouting(){

    angular.module('stanbyControllers')
      .config(($stateProvider, $urlRouterProvider) => {

        $urlRouterProvider.otherwise('/');

        $stateProvider
          .state('profile', {
            url: '/',
            templateUrl: '/internal/profile/show.html',
            controller: 'ProfileCtrl as pc',
            resolve: {
              accountPromise: function (routes: st.Routes): ng.IPromise<st.response.account.AccountInfoResponse> {
                return routes.account.getAccountInfo();
              },
              profilePromise: function (routes: st.Routes): ng.IPromise<UserDetailResponse> {
                return routes.users.loginUserDetails();
              }
            },
            onEnter: ($rootScope) => {
              $rootScope.$emit('breadcrumbs', [
                { url: '/', text: 'Stanby Recruiting' },
                { url: '', text: 'アカウント設定' }
              ]);
            }
          })

          .state('profile_change_basic', {
            url: '/basic',
            templateUrl: '/internal/profile/edit.html',
            controller: 'BasicInfoCtrl as bic',
            onEnter: ($rootScope) => {
              $rootScope.$emit('breadcrumbs', [
                { url: '/', text: 'Stanby Recruiting' },
                { url: '/profile#/', text: 'アカウント設定' },
                { url: '', text: 'アカウント情報の編集' }
              ]);
            }
          })

          .state('profile_change_password', {
            url: '/password',
            templateUrl: '/internal/profile/password.html',
            controller: 'PasswordCtrl as pc',
            onEnter: ($rootScope) => {
              $rootScope.$emit('breadcrumbs', [
                { url: '/', text: 'Stanby Recruiting' },
                { url: '/profile#/', text: 'アカウント設定' },
                { url: '', text: 'パスワード変更' }
              ]);
            }
          })

          .state('profile_change_email', {
            url: '/email',
            templateUrl: '/internal/profile/email.html',
            controller: 'EmailCtrl as ec',
            onEnter: ($rootScope) => {
              $rootScope.$emit('breadcrumbs', [
                { url: '/', text: 'Stanby Recruiting' },
                { url: '/profile#/', text: 'アカウント設定' },
                { url: '', text: 'メールアドレス変更' }
              ]);
            }
          })
        ;
      })

      .controller('ProfileCtrl', controllers.profile.Profile)
      .controller('BasicInfoCtrl', controllers.profile.BasicInfo)
      .controller('PasswordCtrl', controllers.profile.Password)
      .controller('EmailCtrl', controllers.profile.Email)

    ;
  }
}
