/// <reference path="./vendor_def/tsd.d.ts" />
/// <reference path="./services/common/routes.ts" />
/// <reference path="./services/common/enums.ts" />
/// <reference path="./directives/common/widgets.d.ts" />
/// <reference path="./directives/common/directives.ts" />
/// <reference path="./config/core/http-interceptors-config.ts" />
/// <reference path="./directives/users/inputs.ts" />
/// <reference path="./directives/forms/validations.ts" />


module stanby.app {
  import bs = ng.ui.bootstrap;

  export function initStanbyApp(){

    angular.module('underscore', [])
      .service('_', function() {
        // assumes underscore has already been loaded on the page
        return _;
      });

    angular.module('stanbyServices', [
      // Initialization is centralized here.
    ])
    ;

    angular.module('stanbyControllers', [
      'ngSanitize', 'ui.bootstrap', 'ui.router', 'underscore',
      'stanbyServices', 'ngToast', 'stanbyDirectives'
    ])

      .run(['$rootScope', 'stbUser', '$location', '$state', 'stbConfig', 'stUtils',
        ($rootScope:ng.IRootScopeService, stbUser: stb.UserService, $location:ng.ILocationService, $state: ng.ui.IStateService, stbConfig: stb.ConfigService, stUtils) => {

          // 必須のHTTPリクエストをなるだけ早い段階で実行する
          stbConfig.getConfig(null);
          stbUser.updateAccountInfo(null);

          //ページ遷移時、State遷移時に遷移先がログイン必須であれば、ログイン状態をチェックする
          $rootScope.$on("$stateChangeStart", function (evt, toState, toParams, fromState, fromParams) {
            if(!toState.anonAllowed){ //デフォルトでログイン必須

              evt.preventDefault(); // Prevent transition from happening

              // anonでのアクセスが許可されていない場合、ログインチェックを行う
              stbUser.checkLogin(
                () => {
                  // Restart transition process preventing infinite loop of $stateChangeStart trigger
                  $state.go(toState, toParams, {notify: false}).then(function(){
                    stbUser.getAccountInfo(function(response){

                      // ユーザーの権限によってpermitHideを制御(デフォルトはpermitHide=false)
                      $rootScope.$broadcast('stAuthenticationSuccess', response.account.roles);

                      // 遷移先画面に権限設定が有る場合、ログインユーザーの権限と照合する
                      if (toState.roles) {
                        var found = _.find(toState.roles, (role) => {
                          return _.contains(response.account.roles, role);
                        });
                        if (found) {
                          $rootScope.$broadcast('$stateChangeSuccess', toState, toParams, fromState, fromParams);
                        } else {
                          stUtils.toastDanger("権限がありません");
                        }
                      } else {
                        // 権限設定されていないページに遷移する場合はスルー
                        $rootScope.$broadcast('$stateChangeSuccess', toState, toParams, fromState, fromParams);
                      }
                    });
                  });
                },
                () => { //ログアウト状態の場合はログインページに飛ばす
                  var encoded = encodeURIComponent($location.absUrl());
                  window.location.href = '/login#?dest=' + encoded;
                }
              )
            }
          });
          $rootScope.$on("$stateChangeSuccess", () => {
            $('html,body').scrollTop(0);
          });

        }])

      .controller('menuToggleCtrl', ['$scope', '$rootScope', '$location', 'enums',
        function($scope, $rootScope: ng.IRootScopeService, $location, enums: sb.Enums) {
          $scope.hideNav = false;
          $scope.permitHide = false;
          $rootScope.$on('stGlobalNavHide', function(){
            $scope.hideNav = true;
          });
          $rootScope.$on('stGlobalNavShow', function(){
            $scope.hideNav = false;
          });
          $rootScope.$on('stAuthenticationSuccess', function(event, userRoles: string[]){
            $scope.isAdmin = _.contains(userRoles, enums.userRole.ADM.code);
            $scope.isRecruiter = _.contains(userRoles, enums.userRole.REC.code);
            $scope.isInterviewer = _.contains(userRoles, enums.userRole.INT.code);
          });
        }])

      .controller('HeadMenuCtrl', ['$scope', 'routes', '$rootScope', 'stModal', 'enums', 'stbUser',
        function($scope, routes: st.Routes, $rootScope: ng.IRootScopeService, stModal: std.Modal, enums: sb.Enums, stbUser: stb.UserService) {
          stbUser.getAccountInfoPromise().then((res) => {
            if (res) $scope.accountName = res.fullName;
          });
          $scope.logout = () => {
            routes.account.logout()
              .success( () => {
                location.href = '/login#';
              });
          }

          $rootScope.$on('stAuthenticationSuccess', function(event, userRoles: string[]){
            $scope.isAdmin = _.contains(userRoles, enums.userRole.ADM.code);
            $scope.isRecruiter = _.contains(userRoles, enums.userRole.REC.code);
            $scope.isInterviewer = _.contains(userRoles, enums.userRole.INT.code);
          });
        }])

      .controller('BreadCrumbsCtrl', ['$scope', '$rootScope', function($scope, $rootScope: ng.IRootScopeService) {
        $rootScope.$on('breadcrumbs', (e, breadcrumbs) => {
          $scope.breadcrumbs = breadcrumbs;
        });
      }])
    ;


    /**
     * Modules
     */
    angular.module('stanby', [
      'ngSanitize', 'ui.bootstrap', 'ui.router', 'underscore', 'ngAnimate', 'ui.validate', 'ui.event',
      'stanbyServices', 'stanbyControllers', 'ngToast', 'stanbyDirectives'
    ]);

    config.core.httpInterceptors.configure();

    angular.module('stanby')

      .config(function($interpolateProvider){
        $interpolateProvider.startSymbol('{%').endSymbol('%}');
      })

      .config(($tooltipProvider)=>{
        $tooltipProvider.options({popupDelay: 300})
      })

      .config((paginationConfig: bs.IPaginationConfig) => {
        paginationConfig.boundaryLinks = false;
        paginationConfig.directionLinks = true;
        paginationConfig.maxSize = 7;
        paginationConfig.previousText = '前のページ';
        paginationConfig.nextText = '次のページ';
      })

      .config((datepickerConfig: bs.IDatepickerConfig) => {
        datepickerConfig.showWeeks = false;
        datepickerConfig.startingDay = 1;
      })
      .config((datepickerPopupConfig: bs.IDatepickerPopupConfig) => {
        datepickerPopupConfig.currentText = '本日のみ';
        datepickerPopupConfig.clearText = '解除';
        datepickerPopupConfig.closeText = '閉じる';
      })
      .config((ngToastProvider) => {
        ngToastProvider.configure({
          horizontalPosition: 'center',
          combineDuplications: true
        })
      })

      .filter('noHTML', function() {
        return function(text) {
          if (text != null) {
            return text.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&/, '&amp;');
          }
        };
      })

      .filter('newlines', ($sce)=>{
        return (text)=>{
          return $sce.trustAsHtml(text != null ? text.replace(/\n/g, '<br />') : '');
        };
      })

    /**
     * 指定した文字数を超える場合「 …」を末尾につけてその文字数までのSubstrを表示する
     */
      .filter('ellipsis', () => {
        return (text: String, length) => {
          if(text && _.isNumber(text) && text.length >= length){
            return text.substr(0, length) + ' …';
          } else {
            return text;
          }
        };
      })

    /**
     * 誕生日から年齢に変換する
     * - in: st.response.masters.YearMonthDay
     * - out: string (e.g. 21 (歳))
     */
      .filter('calculateAge', function() {
        return (birthday: st.response.masters.YearMonthDay) => {
          if (birthday != undefined) {
            var date = new Date(birthday.year, birthday.month - 1, birthday.day);
            var diff = Date.now() - date.getTime();
            var ageDate = new Date(diff);

            return Math.abs(ageDate.getUTCFullYear() - 1970);
          } else {
            return 0;
          }
        }
      })


    /**
     * 誕生日から年齢に変換する
     * - in: st.response.masters.YearMonthDay
     * - out: string (e.g. 2015年4月11日)
     */
      .filter('formatYearMonthDay', function() {
        return (ymd: st.response.masters.YearMonthDay) => {
          if (ymd != undefined) {
            return `${ymd.year}年${ymd.month}月${ymd.day}日`;
          } else {
            return '-';
          }
        }
      })

    /**
     * ISO-861形式の文字列を、または Date(UTC時間) を、下記の通りの文字列に変換する
     * 当日の場合は hh:mm、今年中なら MM月dd日, 去年以前なら yyyy年MM月
     * - in: Date / string
     * - out: string (e.g. 11:34, 11月12日, 2014年8月)
     */
      .filter('formatEventTimestamp', function() {
        /**
         * 一桁の数字に0を付加
         * e.g. "1" => "01"
         */
        function formatNumberToDoubledigit(numberTarget: number): string {
          if (numberTarget < 10) {
            return '0' + numberTarget;
          } else {
            return String(numberTarget);
          }
        }

        function convertToEventTimestamp(dateTarget: Date): string {

          var dateNow = new Date();

          if(dateNow.toLocaleDateString() == dateTarget.toLocaleDateString()){ //同日の場合
            return convertForSameDate(dateTarget);

          } else if (dateNow.getFullYear() == dateTarget.getFullYear()) { //同年の場合
            return convertForSameYear(dateTarget);

          } else { //違う年の場合
            return convertForDiffYear(dateTarget);
          }
        }

        function convertForSameDate(date: Date): string {
          var hourStr = formatNumberToDoubledigit(date.getHours());
          var minuteStr = formatNumberToDoubledigit(date.getMinutes());
          return hourStr + ':' + minuteStr;
        }

        function convertForSameYear(date: Date): string {
          var monthStr = date.getMonth() + 1;
          var dateStr = date.getDate();
          return monthStr + '月' + dateStr + '日';
        }

        function convertForDiffYear(date: Date): string {
          var yearStr = date.getFullYear().toString().substr(2);
          var monthStr = date.getMonth() + 1;
          return yearStr + '年' + monthStr + '月';
        }

        return (date: any) => { //End of Main Process

          if (angular.isDate(date)){
            return convertToEventTimestamp(date);

          } else if (angular.isString(date)){
            var dateTarget = new Date(date);
            return convertToEventTimestamp(dateTarget);

          } else {
            return '-';
          }
        };
      })

    /**
     * ISO-861形式の文字列を、または Date(UTC時間) 、から現在までの差分を下記の通りの文字列に変換する
     * 約xx分間、約xx時間、約xx日間
     * - in: Date or string
     * - out: string (e.g. 4時間)
     */
      .filter('durationTillNow', function() {
        return (date: any) => {
          var
            dateTarget,
            dateNow = new Date();

          if(angular.isDate(date)){
            dateTarget = date;
          } else if (angular.isString(date)) {
            dateTarget = new Date(date);
          } else {
            return '-';
          }

          var diffMillSec = dateNow.getTime() - dateTarget.getTime();

          if(diffMillSec < 1000 * 60 * 60) { // 1時間以内
            return '約' + Math.round(diffMillSec / (1000 * 60)) + '分間';

          } else if (diffMillSec < 1000 * 60 * 60 * 24) { //24時間以内
            return '約' + Math.round(diffMillSec / (1000 * 60 * 60)) + '時間';
          } else {
            return '約' + Math.round(diffMillSec / (1000 * 60 * 60 * 24)) + '日間';
          }
        }
      })

    /**
     * Override the default exception handler
     * https://docs.angularjs.org/api/ng/service/$exceptionHandler
     * http://stackoverflow.com/questions/19554624/location-from-exceptionhandler-dependency-conflict
     */
      .factory('$exceptionHandler', function ($log, $injector){
        var ngToast;

        return function (exception, cause) {
          // Default behavior
          $log.error.apply($log, arguments);

          ngToast = ngToast || $injector.get('ngToast');
          ngToast.create({'content':"予期せぬエラーが発生しました。", //NOTE(kitaly): scriptエラー時はstUtilsでなくngToastを直接使う(stUtils自体がバグってる可能性を考慮して)
            'className': 'danger', 'dismissOnClick': false, 'dismissOnTimeout': false, 'dismissButton': true
          });

          exception.message += ' (caused by "' + cause + '")';
          throw exception;
        };
      })


      .factory('stUtils', ['ngToast', '$timeout', (ngToast, $timeout:ng.ITimeoutService):std.Utils => {

        var info = function(msg:string){
          ngToast.create({'content':msg,'className': 'info'});
        }

        return {
          withUpdateOkMessage:(f:Function) => {
            f.call(this);
            $timeout(() => {info("変更が保存されました")}, 200);
          },
          toastInfo(msg:string){
            info(msg);
          },
          toastWarning(msg:string){
            ngToast.create({'content': msg, 'className': 'warning', 'dismissOnClick': false, 'dismissButton': true, 'dismissOnTimeout': false});
          },
          toastDanger(msg:string){
            ngToast.create({'content': msg, 'className': 'danger', 'dismissOnClick': false, 'dismissButton': true, 'dismissOnTimeout': false});
          }
        }
      }])
      .factory('stModal', ['$modal', ($modal:bs.IModalService):std.Modal => {


        return {
          modalConfirm(content:std.ModalContent):bs.IModalServiceInstance {

            var title = content.title ? content.title : content.msg;
            var msg = content.title ? content.msg : null;
            var okText = content.okButton ? content.okButton : '続行する';
            var cancelText = content.cancelButton ? content.cancelButton : 'キャンセル';

            return $modal.open({
              template: '<div class="sg-popup">'
              +   '<div class="sg-popup_head">'
              +     '<h3>' + title + '</h3>'
              +   '</div>'
              + (msg ?
                  ('<div class="sg-popup_body">'
                  +    msg
                  + '</div>'
                  ) : ''
                )
              +   '<div class="sg-popup_foot">'
              +     '<button class="sg-button-secondary sg-button" ng-click="ok()">' + okText + '</button>'
              + '<button class="sg-button transparent" ng-click="cancel()">' + cancelText + '</button>'
              +   '</div>'
              + '</div>',

              controller: ($scope, $modalInstance:bs.IModalServiceInstance) => {
                $scope.ok = () => $modalInstance.close();
                $scope.cancel = () => $modalInstance.dismiss();
              }
            });
          },
          modalAlert(content:std.ModalContent):bs.IModalServiceInstance {
            var msg = content.msg;
            var okText = content.okButton ? content.okButton : '続行する';

            return $modal.open({
              template: '<div class="sg-popup">'
              +   '<div class="sg-popup_body">'
              +     '<h3>' + msg + '</h3>'
              +   '</div>'
              +   '<div class="sg-popup_foot">'
              +    '<button class="sg-button-secondary sg-button" ng-click="ok()">' + okText + '</button>'
              +   '</div>'
              + '</div>',

              controller: ($scope, $modalInstance:bs.IModalServiceInstance) => {
                $scope.ok = () => $modalInstance.close();
              }
            });
          },
          modalCustom(options:bs.IModalSettings):bs.IModalServiceInstance {
            return $modal.open(options);
          }
        }
      }])
      .service('stbUser', function(routes: st.Routes):stb.UserService {
        return new stb.UserService(routes);
      })
      .service('stbConfig', function(routes: st.Routes): stb.ConfigService {
        return new stb.ConfigService(routes);
      })
    ;

  }

  class ProfilePopup {
    private $base : JQuery;
    private $trigger : JQuery;
    private $nav : JQuery;
//    private DURATION : number;
//    private EASING : string;

    constructor () {
      this.$base = $('#jsi-nav-account');
      this.$trigger = this.$base.find('> a');
      this.$nav = this.$base.find('> ul');

      this.bindEvents();
    }
    bindEvents() : void {
      this.$trigger.on('mouseover', () => {
        this.show();
      });
      this.$base.on('mouseleave', () => {
        this.hide();
      });
    }
    show() : void {
      this.$nav.show();
    }
    hide() : void {
      this.$nav.hide();
    }
  }

  $(() => {
    new ProfilePopup();
  });
}

stanby.app.initStanbyApp();
stanby.directives.common.directives.initCommonDirectives();
stanby.directives.forms.validations.initFormValidations();
stanby.services.common.enums.initEnums();
stanby.services.common.routes.initRoutes();
