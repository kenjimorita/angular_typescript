///<reference path="../../vendor_def/tsd.d.ts" />
///<reference path="../../def/stanby-def.d.ts" />
///<reference path="../../models/tracking-model.d.ts" />

module config.core.httpInterceptors {

  import SuccessfulAjaxEvent = stanby.models.tracking.SuccessfulAjaxEvent;


  export function configure(){

    angular.module('stanby')
      .config(($httpProvider)=> {
        $httpProvider.interceptors.push('HttpResponseCheckInterceptor');
      })

    /**
     * https://docs.angularjs.org/api/ng/service/$http
     * http://qiita.com/opengl-8080/items/37cd79ebba1aa8d0627a
     */
    .factory('HttpResponseCheckInterceptor', ['$q', '$injector', '$timeout', 'stUtils', ($q, $injector, $timeout:ng.ITimeoutService, stUtils)=>{

      var GET_METHOD = 'GET';

      /*
       * Get以外 (Post/Put/Delete想定) のレスポンス待ちのHttpリクエストが存在する間のみ Spinner 画像を表示する
       */
      var spinnerHandler = (() => {
        var nonGetRequestCount = 0;
        var spinnerDom = $('#jsi-get-spinner');

        return {
          startSpinnerIfNonGetRequest: (req: ng.IRequestConfig): void => {
            if(req.method = GET_METHOD) {
              nonGetRequestCount += 1;
              spinnerDom.stop().fadeIn(300);
            }
          },

          stopSpinnerIfNoPendingRequests: (res: ng.IHttpPromiseCallbackArg<any>): void => {
            if(res.config.method = GET_METHOD){
              nonGetRequestCount -= 1;
            }

            if(nonGetRequestCount <= 0) {
              spinnerDom.stop().fadeOut(300);
            }
          }
        }
      })();


      /*
       * エラーレスポンスの StatusCode に応じて、エラートーストを表示する
       */
      var toastCorrespondingErrorMessages = (res: ng.IHttpPromiseCallbackArg<any>): void => {
        if(res.status == 0) {
          var danger = () => {
            stUtils.toastDanger("接続エラーです。");
          }
          // NOTE(CONVOY): firefoxでrootにアクセスするとき、稀にこのエラーに引っかかります。
          //               原因不明なですがapi/configurationが問題みたい。
          //               とりあえずエラー表示を遅らしての一時凌ぎ。
          $timeout(danger, 100);
        }
        if (res.status === 400 && res.data.key === "error.data.version") {
          stUtils.toastDanger("更新対象のデータが既に更新されています。再度読みなおしてください。");
        }
        else if (res.status === 401 && !res.config.suppress401ErrorMsg) {
          stUtils.toastDanger('ログアウトされました。<a href="/login">ログインし直す</a>');
        }
        else if (res.status === 403) {
          stUtils.toastDanger("権限がありません。");
        }
        else if (res.status === 500) {
          stUtils.toastDanger("申し訳ございません。サーバーでエラーが発生しました。");
        }
      };

      /*
       * GET以外(Put/Post/Delete想定) のHttpリクエストが成功した場合、GoogleTagManagerにイベント通知する
       */
      var pushSuccessfulAjaxCallForGTM = (res: ng.IHttpPromiseCallbackArg<any>): void => {
        var requestConfig = res.config;
        if(requestConfig.method != GET_METHOD && res.status == 200) {
          var ajaxEvent: SuccessfulAjaxEvent = {
            'event': 'stSuccessfulAjaxCall',
            'stSuccessfulAjaxCallMethod': requestConfig.method,
            'stSuccessfulAjaxCallUrl': requestConfig.url
          };

          if(typeof dataLayer == 'undefined' || !dataLayer) dataLayer = [];
          dataLayer.push(ajaxEvent);
        }
      };


      return {
        request: (req: ng.IRequestConfig) => {

          spinnerHandler.startSpinnerIfNonGetRequest(req);
          return req;
        },
        response: (res: ng.IHttpPromiseCallbackArg<any>) => {
          spinnerHandler.stopSpinnerIfNoPendingRequests(res);
          pushSuccessfulAjaxCallForGTM(res);
          return res;
        },
        responseError: (res: ng.IHttpPromiseCallbackArg<any>)=>{

          spinnerHandler.stopSpinnerIfNoPendingRequests(res);
          toastCorrespondingErrorMessages(res);
          return $q.reject(res);
        }
      };
    }]);
  }

}
