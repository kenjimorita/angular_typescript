/// <reference path="../../vendor_def/tsd.d.ts" />
/// <reference path="../../services/common/routes.ts" />
/// <reference path="../../stanby-utils.ts" />

interface HTMLElement {
  complete: boolean;
}

module stanby.directives.common.directives {
  export function initCommonDirectives(){

    /**
     * See http://qiita.com/ukyo/items/0aa47142020c07874415
     */
    angular.module('stanbyDirectives', ['stanbyControllers'])

    /**
     * stInclude
     */
      .directive('stInclude', function($http, $compile) {
        return function(scope, element, attr) {
          $http.get(attr.stInclude).success(function(response) {
            element.html(response);
            $compile(element.contents())(scope);
          })
        };
      })

    /**
     * stValidatePhone: validates phone number using server-side validation logic on blur
     * - required attributes: ngModel
     */
      .directive('stValidatePhone', ['routes', '$q', function(routes: st.Routes, $q: ng.IQService){
        return {
          restrict: 'A',
          require: 'ngModel',
          link: function(scope, iElement: ng.IAugmentedJQuery, iAttrs, ctrl){

            var PHONE_REGEX = /^(\+[1-9][0-9]*(\([0-9]*\)|-[0-9]*-))?[0]?[1-9][0-9\- ]*$/;
            var VALIDATION_KEY = 'phone';

            ctrl.$asyncValidators[VALIDATION_KEY] = (modelValue, viewValue) => {
              var val = modelValue || viewValue;
              var deferred = $q.defer();

              if(val == null || val == ''){ //NOTE(kitaly): required に任せる
                deferred.resolve();
                return deferred.promise;
              }

              if(!PHONE_REGEX.test(val)){
                deferred.reject();
                return deferred.promise;
              }

              routes.validation.phone(val)
                .success(() => {
                  return deferred.resolve();
                })
                .error((err, status) => {
                  if(status != 400) deferred.resolve();
                  else deferred.reject();
                });

              return deferred.promise;
            };
          }
        }
      }])

    /**
     * stValidatePostal: validates code querying Geo API to see if it actually exists
     * - required attributes: ngModel
     */
      .directive('stValidatePostal', ['routes', function(routes: st.Routes){
        return {
          restrict: 'A',
          require: 'ngModel',
          link: function(scope, iElement, iAttrs, ctrl: ng.INgModelController){

            var POSTAL_REGEX = /^\d{3}[\-]?\d{4}$/;
            var VALIDATION_KEY = 'postal';

            var validateFn = function () {

              var viewValue = ctrl.$viewValue;

              if(viewValue == null || $.trim(viewValue) == ''){
                ctrl.$setValidity(VALIDATION_KEY, true);
                return;
              }

              if (!POSTAL_REGEX.test(viewValue)) {
                ctrl.$setValidity(VALIDATION_KEY, false);
                return;
              }

              routes.validation.postalCode(viewValue)
                .success((msg) => {
                  return ctrl.$setValidity(VALIDATION_KEY, !(msg.key && msg.key === "error.notFound"));
                })
                .error((data, status) => {
                  ctrl.$setValidity(VALIDATION_KEY, true);
                });
            };

            iElement.on('blur', validateFn);

          }
        }
      }])
      .directive('stValidateEmail', [function(){
        return {
          restrict: 'A',
          require: 'ngModel',
          link: function(scope, iElement, iAttrs, ctrl){
            var EMAIL_REGEX = /^[a-zA-Z0-9\.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
            var VALIDATION_KEY = 'stEmail';

            ctrl.$validators[VALIDATION_KEY] = (modelVal, viewVal) => {
              var val = modelVal || viewVal;

              if(val == null || val.trim().length == 0){ //let requied validate
                return true;
              }

              return EMAIL_REGEX.test(val);
            }
          }
        }
      }])
      .directive('stValidateEmailDuplicate', ['routes', '$q', function(routes: st.Routes, $q: ng.IQService){
        return {
          restrict: 'A',
          require: 'ngModel',
          link: function(scope, iElement, iAttrs, ctrl){

            var VALIDATION_KEY = 'stEmailDuplicate';

            ctrl.$asyncValidators[VALIDATION_KEY] = (modelVal, viewVal) => {
              var val = modelVal || viewVal;
              var deferred = $q.defer();

              //NOTE(kitaly): 無駄なリクエストは飛ばしたくないため
              _.forEach(ctrl.$error, function(val, key) {
                if(val && key != VALIDATION_KEY){
                  deferred.resolve();
                  return deferred.promise;
                }
              });

              if(val == null || val.trim().length == 0){ //let requied validate
                deferred.resolve();
                return deferred.promise;
              }

              routes.validation.emailDuplicate(val)
                .success((msg) => {
                  if(msg.key !== 'error.profile.emailDuplication') {
                    return deferred.resolve();
                  } else {
                    return deferred.reject();
                  }
                });

              return deferred.promise;
            }
          }
        }
      }])
      .directive('stValidateEmailDuplicateForUpdate', ['routes', function(routes: st.Routes){
        return {
          restrict: 'A',
          require: 'ngModel',
          link: function(scope, iElement, iAttrs, ctrl:ng.INgModelController){
            var VALIDATION_KEY = 'stEmailDuplicate';

            var validateFn = function() {
              var emailExpr = iAttrs.stValidateEmailDuplicateForUpdate
              var currentEmail = scope.$eval(emailExpr);
              ctrl.$setValidity(VALIDATION_KEY, true);
              var viewValue = ctrl.$viewValue;
              var hasAnotherError = false;
              _.forEach(ctrl.$error, function(val, key) {
                hasAnotherError = (val && key != VALIDATION_KEY);
              });

              if(viewValue == null || $.trim(viewValue) == '' || hasAnotherError){
                return;
              }

              routes.validation.emailDuplicateForUpdate(viewValue, currentEmail)
                .success(() => {
                  ctrl.$setValidity(VALIDATION_KEY, true);
                })
                .error((data, status) => {
                  if(status == 400){
                    if(data.key == 'error.profile.emailDuplication') {
                      ctrl.$setValidity(VALIDATION_KEY, false);
                    }
                  }
                });
            };

            iElement.on('keyup', _.debounce(validateFn, 1000));
          }
        }
      }])
    /**
     * Prevents inputs that don't fit the specified regex expression
     * by reverting the input back to the last valid input when invalid
     */
      .directive('stAllowPattern', ['routes', function(){
        return {
          restrict: 'A',
          require: 'ngModel',
          link: function (scope, element, attrs, ngModel) {
            var pattern = attrs.stAllowPattern;
            var match = pattern.match(/^\/(.*)\/$/);
            var regex = new RegExp(match[1]);

            scope.$watch(attrs.ngModel, function(newValue, oldValue) {
              if(ngModel.$viewValue == null || $.trim(ngModel.$viewValue) == ''){
                return;
              }
              if(regex.test(ngModel.$viewValue)){
                return;
              }else{
                ngModel.$setViewValue(oldValue);
                ngModel.$render();
              }
            });
          }
        }
      }])
    /**
     　* 動的かつPOSTリクエストのレスポンスを利用して iframe を描画するのに使用します
     　* promise.onSuccess((data) => ...) の data を iframe 内に描画します
     　*
     　* - stIframePost(directive自身): promise を返却する関数の AngularExpression (e.g. st-iframe-post="c.postToGetIframeHtml")
     　* - stPostReady(optional): 上記で指定された POSTリクエスト の実行を待たせるフラグの AngularExpression (e.g. st-post-ready="c.isPostReady")
     　*/
      .directive('stIframePost', ['stUtils',
        function(stUtils: std.Utils){
          return {
            restrict: 'A',
            scope: true,
            link: function (scope, element, attrs) {
              var selfAttr = attrs.stIframePost;
              var readyAttr = attrs.stPostReady;

              function execFunc(postFuncExpr){
                var resPromise: ng.IHttpPromise<any> = scope.$eval(postFuncExpr);

                var extractDoc = function(elem) {
                  var iframe = element.context;
                  var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                  if (iframeDoc == null || iframeDoc == undefined) {
                    stUtils.toastDanger('お使いのブラウザではプレビューがご利用いただけません。');
                  }
                  return iframeDoc;
                }

                resPromise
                  .success((html) => {
                    var iframeDoc = extractDoc(element);
                    if(iframeDoc){
                      iframeDoc.open();
                      iframeDoc.write(html);
                      iframeDoc.close();
                      element.on('load', function() {
                        // e.preventDefault()してみいいけど、dom上に見えたほうがテストしやすいので
                        $(iframeDoc).find('a').css({ pointerEvents: 'none' });
                      });
                    }
                  })
                  .error((xhr) => {
                    var iframeDoc = extractDoc(element);
                    if(iframeDoc){
                      iframeDoc.open();
                      iframeDoc.writeln('<p>プレビューの取得に失敗しました</p>');
                      iframeDoc.close();
                    }
                  });
              }

              var isReady = scope.$eval(readyAttr);


              if(readyAttr && !isReady){
                scope.$watch(readyAttr, function(newval, oldval){
                  if(newval == true) execFunc(selfAttr);
                });
              } else {
                execFunc(selfAttr);
              }
            }
          }
        }])
    /**
     * Tooltip
     * <input type=text ng-model="c.someModel" stb-tooltip="{% $viewLength %}/1,000文字まで入力可">
     */
      .directive('stbTooltip', ['$compile', '$timeout', function($compile: ng.ICompileService, $timeout : ng.ITimeoutService) {

        return {
          restrict: 'A',
          require: '?ngModel',
          compile: (elem, attrs) => {
            var content = attrs.stbTooltip;
            content = content.replace(/\\n/, '<br/>');

            return (scope, iElem: ng.IAugmentedJQuery, iAttr, ngModel) => {

              var tooltipScope = scope.$new();
              // NOTE(hideaki): 新しく追加された要素はこのlinkしか動かないようです。ので、ここでangularの式をもったelementを生成して$compileに渡しています。
              var tt = angular.element('<div class="sg-tooltip-explain">' + content + '</div>');
              tt.appendTo('body');
              $compile(tt)(tooltipScope);

              iElem.on('keyup', () => {
                updateViewLength();
              });

              // bind to destory and remove tooltip. when 'enter' is used, focus returns to the input after form
              // submission, which then transitions the state. No blur event is fired when state transitions so
              // tooltip stays around without this destroy catch
              $(iElem).on('$destroy', function() {
                hideTooltip(iElem, tt);
              });

              iElem.change(() => {
                updateViewLength();
              });

              if (iElem.is(':focus')) {
                showTooltip(iElem, tt);
              }

              $(iElem).on('focus', function () {
                showTooltip(iElem, tt);
              });

              $(iElem).on('blur', function () {
                hideTooltip(iElem, tt);
              });

              $(iElem).on('mouseover', function () {
                if (iElem.is('a')) {
                  showTooltip(iElem, tt);
                }
              });

              $(iElem).on('mouseout', function () {
                if (iElem.is('a')) {
                  hideTooltip(iElem, tt);
                }
              });

              // 縦に並んだinput要素らに被ってしまって視認性が悪いのでmouseenterで消す
              // (スマホの場合幅が狭かったりと、ツールチップの置き場がない)
              tt.on('mouseenter', function() {
                hideTooltip(iElem, tt);
              });
              tt.on('click', function() {
                hideTooltip(iElem, tt);
              });

              function updateViewLength() {
                // had to wrap in timeout function so scope.$apply isn't called while another action is in progress.
                // this happens when you press 'enter' on a form, that has inputs showing tooltips
                $timeout(function() {
                  scope.$apply(() => {
                    tooltipScope.$viewLength = iElem.val() ? iElem.val().length : 0;
                  });
                });
              }
              function showTooltip(element, tooltip) {
                var absOffsetTop:number = element.offset().top;
                var absOffsetLeft:number = element.offset().left;
                var height:number = tooltip.outerHeight();

                var positionTop = absOffsetTop - (height + 5);

                tooltip.show();
                updateViewLength();

                tooltip.css({
                  top: positionTop,
                  left: absOffsetLeft
                });
                tooltip.stop().animate({
                  opacity: 1
                }, 300, 'easeOutExpo');
              };

              function hideTooltip(element, tooltip) {

                tooltip.css({
                  display: 'none'
                });
                tooltip.stop().animate({
                  opacity: 0
                }, 300, 'easeOutExpo');
              }
            }
          }
        }
      }])
      .directive('stLinkTooltip', () => {
        return {
          restrict: 'A',
          link: function (scope, $element, attrs) {
            var self = {
              $body: $(document.body),
              $target: $element,
              $tooltip: $('<div class="sg-tooltip-explain"/>'),

              init: function () {
                this.generateTooltip();
                this.bindEvents();
              },
              generateTooltip: function () {
                this.$body.append(this.$tooltip);
                this.$tooltip.text(attrs.stLinkTooltip);
              },
              bindEvents: function () {
                var that = this;

                this.$target.on('mouseover', function () {
                  that.show();
                });
                this.$target.on('mouseout', function () {
                  that.hide();
                });
                this.$target.on('click', function () {
                  that.hide();
                });
              },
              show: function () {
                var
                  offsetTopTarget = 0,
                  offsetLeftTarget = 0;

                this.$tooltip.show();

                offsetTopTarget = this.$target.offset().top - this.$tooltip.outerHeight() - 10;
                var targetW = this.$target.outerWidth();
                if (targetW == 0) {
                  targetW = this.$tooltip.outerWidth();
                }
                offsetLeftTarget = this.$target.offset().left - (this.$tooltip.outerWidth() - targetW) / 2;

                this.$tooltip.css({
                  top: offsetTopTarget,
                  left: offsetLeftTarget
                });
                this.$tooltip.stop().animate({
                  opacity: 1
                }, 300);
              },
              hide: function () {
                this.$tooltip.stop().animate({
                  opacity: 0
                }, 300, () => {
                  this.$tooltip.hide();
                });
              }
            };

            self.init();
          }
        }
      })
      .directive('stImageup', function ($compile) {
        return {
          restrict: 'A',
          link: function (scope, $element) {
            var methods = {
              init: function () {
                methods.bindEvents();
              },
              bindEvents: function () {
                $element.on('change', function (e) {
                  var
                    params = scope.$eval($element.attr('st-imageup')),
                    file = e.target.files[0];

                  params.form = new FormData();

                  params.form.append('image', file);
                  params.fn(params);
                });
              }
            };

            methods.init();
          }
        }
      })
      .directive('stInlineUpload', function ($compile) {
        return {
          restrict: 'A',
          link: function (scope, $element) {
            var methods = {
              init: function () {
                methods.bindEvents();
              },
              bindEvents: function () {
                $element.on('drop', function (e) {
                  var
                    params = scope.$eval($element.attr('st-inline-upload')),
                    file = e.originalEvent.dataTransfer.files[0];

                  params.form = new FormData();

                  params.form.append('image', file);
                  params.fn($element, params);

                  e.preventDefault();
                  e.stopPropagation();
                });
              }
            };

            methods.init();
          }
        }
      })
    /**
     * <div st-crop="ctrl"></div>
     * <div st-crop="ctrl" st-crop-resizable></div>
     */
      .directive('stImageCrop', function ($compile) {
        return {
          restrict: 'A',
          templateUrl: '/templates/cropfield.html',
          link: function (scope, $element) {
            _.merge(scope, {
              ctrl: null,
              $imageInner: null,
              $imageOuter: null,
              $cropArea: null,
              $scale: null,
              $scaleKnob: null,
              $body: $(document.body),
              $wrapper: $element,
              $base: null,
              $resizer: null,
              isMovingImageWithDrag: false,
              isMovingScaleKnobWithDrag: false,
              isResizingArea: false,
              isResizable: false,
              beforeScaleX: 0,
              misalignmentScaleX: 0,
              scale: 1,
              widthCrop: null,
              heightCrop: null,
              cropImage: null,
              files: null,
              x: 0,
              y: 0,
              default: {
                width: 0,
                height: 0
              },
              before: {
                x: 0,
                y: 0
              },
              startResize: {
                x: 0,
                y: 0,
                width: 0,
                height: 0
              },
              mouseStart: {
                x: 0,
                y: 0
              },
              INTERVAL: {
                LAZYLOAD: 100
              },
              ANIMATION: {
                DURATION: 300
              },
              SCALE: {
                MAX: 3,
                MIN: 0.25
              },
              CROPWIDTH: {
                MIN: 50,
                MAX: 500
              },
              CROPHEIGHT: {
                MIN: 50,
                MAX: 200
              },

              init: function () {
                this.setParams();
                this.lazyLoadImages();
                this.bindEvents();
              },
              setParams: function () {
                this.$base = this.$wrapper.find('.jsc-crop');
                this.$imageInner = this.$base.find('.jsc-crop-imageinner');
                this.$imageOuter = this.$base.find('.jsc-crop-imageouter');
                this.$cropArea = this.$base.find('.jsc-crop-area');
                this.$scale = this.$wrapper.find('.jsc-crop-scale');
                this.$scaleKnob = this.$scale.find('.jsc-crop-scale-knob');
                this.$resizer = this.$wrapper.find('.jsc-crop-resizer');
                this.$resizerKnobs = this.$resizer.find('> div');
                this.$resizerRightTop = this.$resizer.find('.jsc-crop-resizer-righttop');
                this.$resizerRightBottom = this.$resizer.find('.jsc-crop-resizer-rightbottom');
                this.$resizerLeftBottom = this.$resizer.find('.jsc-crop-resizer-leftbottom');
                this.$resizerLeftTop = this.$resizer.find('.jsc-crop-resizer-lefttop');
                this.isResizable = this.$wrapper.is('[st-crop-resizable]');
                this.ctrl = scope.$eval(this.$wrapper.attr('st-image-crop'));
                this.urlImage = this.ctrl.stbImage.getTmpImageUrl(
                  this.ctrl.cropTargetImage.imageId,
                  this.ctrl.cropTargetImage.yearMonth
                );
                this.widthCrop = parseInt(this.$wrapper.attr('st-crop-width'), 10);
                this.heightCrop = parseInt(this.$wrapper.attr('st-crop-height'), 10);
                this.cropImage = this.ctrl.cropImage;
                this.files = this.ctrl.temporaryFilesForCrop;
                this.$cropArea.add(this.$resizer)
                  .width(this.widthCrop)
                  .height(this.heightCrop);
              },
              bindEvents: function () {
                var that = this;

                this.$imageInner.add(this.$imageOuter).add(this.$resizer).on('mousedown', function (e) {
                  that.startToMoveImageDrag(e);
                });
                this.$scaleKnob.on('mousedown', function (e) {
                  that.startToDragForMoveScaleKnob(e);
                });
                this.$resizerKnobs.on('mousedown', function (e) {
                  that.startToDragForResizeArea(e);
                });
                this.$body.on('mousemove', function (e) {
                  that.moveToMoveImageDrag(e);
                  that.moveToDragForMoveScaleKnob(e);
                  that.moveToDragForResizeArea(e);
                });
                this.$body.on('mouseup', function () {
                  that.endToMoveImageDrag();
                  that.endToDragForMoveScaleKnob();
                  that.endToDragForResizeArea();
                });
              },
              lazyLoadImages: function () {
                var
                  intervalForJudgeComplete,
                  imageTarget = this.$imageInner[0];

                intervalForJudgeComplete = setInterval(() => {
                  if (imageTarget.complete) {
                    // NOTE: thrbrd: angularがセットするディレイによりIE11でタイミングバグが発生するので、調整
                    setTimeout(() => {
                      clearInterval(intervalForJudgeComplete);
                      this.centeringImage();
                      this.showImage();
                      this.startToDragForResizeArea();
                      this.moveToDragForResizeArea();
                      this.endToDragForResizeArea();
                      this.moveToDragForMoveScaleKnob();
                    }, 500);
                  }
                }, this.INTERVAL.LAZYLOAD);
              },
              centeringImage: function () {
                var
                  offsetTopInner,
                  offsetLeftInner,
                  widthBase = this.$base.outerWidth(),
                  heightBase = this.$base.outerHeight(),
                  widthImage = this.$imageInner.width(),
                  heightImage = this.$imageInner.height(),
                  offsetTopOuter = -((heightImage - heightBase) / 2),
                  offsetLeftOuter = -((widthImage - widthBase) / 2),
                  positionTopArea = this.$cropArea.offset().top - this.$base.offset().top,
                  positionLeftArea = this.$cropArea.offset().left - this.$base.offset().left;

                this.$imageOuter.css({
                  top: offsetTopOuter,
                  left: offsetLeftOuter
                });

                offsetTopInner = offsetTopOuter - positionTopArea;
                offsetLeftInner = offsetLeftOuter - positionLeftArea;

                this.$imageInner.css({
                  top: offsetTopInner,
                  left: offsetLeftInner
                });
                this.$imageInner.add(this.$imageOuter).css({
                  marginTop: 0,
                  marginLeft: 0
                });
              },
              showImage: function () {
                this.default.width = this.$imageInner.width();
                this.default.height = this.$imageInner.height();

                this.$imageInner.stop().animate({
                  opacity: 1
                }, this.ANIMATION.DURATION);
                this.$imageOuter.stop().animate({
                  opacity: 0.4
                }, this.ANIMATION.DURATION);
              },
              startToDragForResizeArea: function (e) {
                this.isResizingArea = true;
                this.startResize = {
                  x: e ? e.pageX : 0,
                  y: e ? e.pageY : 0,
                  width: this.$cropArea.width(),
                  height: this.$cropArea.height(),
                  $target: e ? $(e.target) : this.$resizerKnobs.eq(0)
                };
              },
              endToDragForResizeArea: function () {
                this.isResizingArea = false;
              },
              moveToDragForResizeArea: function (e) {
                if (!this.isResizingArea && e) {
                  return;
                }

                if (e) {
                  e.preventDefault();
                  e.stopPropagation();
                }

                var
                  widthTarget,
                  heightTarget,
                  mouseX = e ? e.pageX : 0,
                  mouseY = e ? e.pageY : 0,
                  misalignmentX = mouseX - this.startResize.x,
                  misalignmentY = mouseY - this.startResize.y;

                if (this.startResize.$target.hasClass('jsc-crop-resizer-righttop')) {
                  widthTarget = this.startResize.width + (misalignmentX * 2);
                  heightTarget = this.startResize.height - (misalignmentY * 2);
                } else if (this.startResize.$target.hasClass('jsc-crop-resizer-rightbottom')) {
                  widthTarget = this.startResize.width + (misalignmentX * 2);
                  heightTarget = this.startResize.height + (misalignmentY * 2);
                } else if (this.startResize.$target.hasClass('jsc-crop-resizer-leftbottom')) {
                  widthTarget = this.startResize.width - (misalignmentX * 2);
                  heightTarget = this.startResize.height + (misalignmentY * 2);
                } else if (this.startResize.$target.hasClass('jsc-crop-resizer-lefttop')) {
                  widthTarget = this.startResize.width - (misalignmentX * 2);
                  heightTarget = this.startResize.height - (misalignmentY * 2);
                }

                if (this.isResizable) {
                  if (widthTarget > this.$imageOuter.width()) {
                    if (this.$imageOuter.width() > this.CROPWIDTH.MAX) {
                      widthTarget = this.CROPWIDTH.MAX;
                    } else {
                      widthTarget = this.$imageOuter.width();
                    }
                  } else if (widthTarget > this.CROPWIDTH.MAX) {
                    if (this.CROPWIDTH.MAX > this.$imageOuter.width()) {
                      widthTarget = this.$imageOuter.width();
                    } else {
                      widthTarget = this.CROPWIDTH.MAX;
                    }
                  } else if (widthTarget < this.CROPWIDTH.MIN) {
                    widthTarget = this.CROPWIDTH.MIN;
                  } else if (widthTarget > this.$imageOuter.width()) {
                    widthTarget = this.$imageOuter.width();
                  }

                  if (heightTarget > this.$imageOuter.height()) {
                    if (this.$imageOuter.height() > this.CROPHEIGHT.MAX) {
                      heightTarget = this.CROPHEIGHT.MAX;
                    } else {
                      heightTarget = this.$imageOuter.height();
                    }
                  } else if (heightTarget > this.CROPHEIGHT.MAX) {
                    if (this.CROPHEIGHT.MAX > this.$imageOuter.height()) {
                      heightTarget = this.$imageOuter.height();
                    } else {
                      heightTarget = this.CROPHEIGHT.MAX;
                    }
                  } else if (heightTarget < this.CROPHEIGHT.MIN) {
                    heightTarget = this.CROPHEIGHT.MIN;
                  }

                  this.$cropArea.add(this.$resizer)
                    .width(widthTarget)
                    .height(heightTarget);
                }

                this.centeringImage();
              },
              startToDragForMoveScaleKnob: function (e) {
                this.isMovingScaleKnobWithDrag = true;
                this.misalignmentScaleX = this.$scaleKnob.offset().left - e.pageX;
              },
              endToDragForMoveScaleKnob: function () {
                this.isMovingScaleKnobWithDrag = false;
              },
              moveToDragForMoveScaleKnob: function (e) {
                if (!this.isMovingScaleKnobWithDrag && e) {
                  return;
                }

                if (e) {
                  e.preventDefault();
                }

                var
                  ratioMoved,
                  mouseX = e ? e.pageX : 0,
                  offsetLeftScale = this.$scale.offset().left,
                  isSmaller = false,
                  temporaryRatio = e ? (mouseX - offsetLeftScale + this.misalignmentScaleX) / this.$scale.width() : 0,
                  temporaryScale = e ? this.SCALE.MIN + ((this.SCALE.MAX - this.SCALE.MIN) * temporaryRatio) : 0;

                if (this.default.width * temporaryScale < this.$cropArea.width()) {
                  temporaryScale = (this.$cropArea.width() / this.default.width);
                  isSmaller = true;
                }

                if (this.default.height * temporaryScale < this.$cropArea.height()) {
                  temporaryScale = (this.$cropArea.height() / this.default.height);
                  isSmaller = true;
                }

                this.scale = temporaryScale;
                ratioMoved = temporaryRatio * 100;

                if (isSmaller) {
                  ratioMoved = ((this.scale - this.SCALE.MIN) / (this.SCALE.MAX - this.SCALE.MIN)) * 100;
                }

                if (ratioMoved < 0) {
                  ratioMoved = 0;
                } else if (ratioMoved > 100) {
                  ratioMoved = 100;
                }

                this.$scaleKnob.css('left', ratioMoved + '%');
                this.scaleImage();
              },
              startToMoveImageDrag: function (e) {
                this.isMovingImageWithDrag = true;
                this.before.x = parseInt(this.$imageInner.css('marginLeft'), 10);
                this.before.y = parseInt(this.$imageInner.css('marginTop'), 10);
                this.mouseStart.x = e.pageX;
                this.mouseStart.y = e.pageY;
              },
              endToMoveImageDrag: function () {
                this.isMovingImageWithDrag = false;
              },
              moveToMoveImageDrag: function (e) {
                if (!this.isMovingImageWithDrag || this.isResizingArea) {
                  return;
                }

                e.preventDefault();

                var
                  offsetTopOuter,
                  offsetLeftOuter,
                  offsetBottomOuter,
                  offsetRightOuter,
                  mouseX = e.pageX,
                  mouseY = e.pageY,
                  movedX = mouseX - this.mouseStart.x,
                  movedY = mouseY - this.mouseStart.y,
                  offsetTopArea = this.$cropArea.offset().top,
                  offsetLeftArea = this.$cropArea.offset().left,
                  offsetBottomArea = offsetTopArea + this.$cropArea.height(),
                  offsetRightArea = offsetLeftArea + this.$cropArea.width();

                this.x = this.before.x + movedX;
                this.y = this.before.y + movedY;

                this.$imageInner.add(this.$imageOuter).css({
                  marginTop: this.y,
                  marginLeft: this.x
                });

                offsetTopOuter = this.$imageOuter.offset().top;
                offsetLeftOuter = this.$imageOuter.offset().left;
                offsetBottomOuter = offsetTopOuter + this.$imageOuter.height();
                offsetRightOuter = offsetLeftOuter + this.$imageOuter.width();

                if (offsetTopOuter > offsetTopArea) {
                  this.y = this.y + (offsetTopArea - offsetTopOuter);
                } else if (offsetBottomOuter < offsetBottomArea) {
                  this.y = this.y + (offsetBottomArea - offsetBottomOuter);
                }

                if (offsetLeftOuter > offsetLeftArea) {
                  this.x = this.x + (offsetLeftArea - offsetLeftOuter);
                } else if (offsetRightOuter < offsetRightArea) {
                  this.x = this.x + (offsetRightArea - offsetRightOuter);
                }

                this.$imageInner.add(this.$imageOuter).css({
                  marginTop: this.y,
                  marginLeft: this.x
                });
              },
              scaleImage: function () {
                var
                  widthImage,
                  heightImage;

                if (this.scale < this.SCALE.MIN) {
                  this.scale = this.SCALE.MIN;
                } else if (this.scale > this.SCALE.MAX) {
                  this.scale = this.SCALE.MAX;
                }

                widthImage = this.default.width * this.scale;
                heightImage = this.default.height * this.scale;

                this.$imageInner.add(this.$imageOuter)
                  .width(widthImage)
                  .height(heightImage)
                  .css({
                    marginTop: 0,
                    marginLeft: 0
                  });

                this.centeringImage();
              },
              saveCropImage: function () {
                var
                  startX = this.$cropArea.offset().left - this.$imageOuter.offset().left,
                  startY = this.$cropArea.offset().top - this.$imageOuter.offset().top;

                this.cropImage(
                  this.ctrl,
                  {
                    files: this.files,
                    // NOTE: thrbrd: 0だとresizeErrorになってしまうので、1を最低とする
                    startX: startX ? Math.floor(startX) : 1,
                    // NOTE: thrbrd: 0だとresizeErrorになってしまうので、1を最低とする
                    startY: startY ? Math.floor(startY) : 1,
                    cropWidth: this.$cropArea.width(),
                    cropHeight: this.$cropArea.height(),
                    resizeWidth: this.$imageOuter.width(),
                    resizeHeight: this.$imageOuter.height()
                  }
                );
              }
            });

            scope.init();
          }
        }
      })
      .directive('ngOuterclick', () => {
        return {
          restrict: 'A',
          link: (scope, $element, attrs) => {
            var self = {
              $body: angular.element('body'),
              attr: attrs.ngOuterclick,

              init: () => {
                self.bindEvents();
              },
              bindEvents: () => {
                self.$body.on('click', function (e) {
                  self.judgeOuterclick(e);
                });
              },
              judgeOuterclick: (e) => {
                var
                  mouseX = e.pageX,
                  mouseY = e.pageY,
                  offsetTop = $element.offset().top,
                  offsetBottom = offsetTop + $element.height(),
                  offsetLeft = $element.offset().left,
                  offsetRight = offsetLeft + $element.width();

                if (!(
                  mouseX > offsetLeft &&
                  mouseX < offsetRight &&
                  mouseY > offsetTop &&
                  mouseY < offsetBottom
                  )) {
                  scope.$eval(self.attr);
                }
              }
            };

            self.init();
          }
        }
      })
      .directive('stAutoresizeTextarea', () => {
        return {
          restrict: 'A',
          link: (scope, $element, attrs) => {
            _.merge(scope, {
              $textarea: $element,
              $textfield: angular.element(),
              heightBefore: 0,
              heightAfter: 0,

              init: () => {
                scope.heightBefore = scope.$textarea.outerHeight();
                scope.bindEvents();
              },
              bindEvents: () => {
                scope.$watch('$textarea.val', () => {
                  scope.generateTextField();
                });

                scope.$textarea.on('keyup', () => {
                  scope.judgeHeight2Reflection();
                });
              },
              generateTextField: () => {
                scope.$textfield = angular.element('<pre/>');
                scope.heightBefore = scope.$textarea.outerHeight();

                // NOTE(hikishima): $textfieldにスタイルをあてて、高さを取得できるようにする
                scope.$textfield.addClass('sg-form-markdown-textfield').css({
                  width: scope.$textarea.outerWidth(),
                  lineHeight: scope.$textarea.css('line-height'),
                  paddingTop: scope.$textarea.css('padding-top'),
                  paddingRight: scope.$textarea.css('padding-right'),
                  paddingBottom: scope.$textarea.css('padding-bottom'),
                  paddingLeft: scope.$textarea.css('padding-left')
                });
                scope.$textarea.after(scope.$textfield);
                scope.judgeHeight2Reflection();
              },
              judgeHeight2Reflection: () => {
                scope.$textfield.text(scope.$textarea.val().replace(/\n$/, '\n '));
                scope.heightAfter = scope.$textfield.outerHeight();

                if (scope.heightAfter >= scope.heightBefore) {
                  scope.$textarea.css('height', scope.heightAfter);
                } else {
                  scope.$textarea.css('height', scope.heightBefore);
                }
              }
            });

            scope.init();
          }
        }
      })
      .directive('stAutoscroll', () => {
        return {
          restrict: 'A',
          link: (scope, $element, attrs) => {
            _.merge(scope, {
              ANIMATION: {
                DURATION: 500
              },

              $trigger: $element,
              $htmlbody: $('html, body'),

              init: function () {
                this.bindEvents();
              },
              bindEvents: function () {
                var that = this;
                this.$trigger.on('click', function (e) {
                  e.preventDefault();
                  e.stopPropagation();
                  that.scrollToTargetElement(e, $(this));
                });
              },
              scrollToTargetElement: function (e, $triggerTarget) {
                var
                  $contentTarget = $($triggerTarget.attr('href')),
                  scrollTopTarget = $contentTarget.offset().top,
                  scrollTopMaximum = $(document).height() - $(window).height();

                if (scrollTopTarget > scrollTopMaximum) {
                  scrollTopTarget = scrollTopMaximum;
                } else {
                  scrollTopTarget -= 70;
                }

                this.$htmlbody.stop().animate({
                  scrollTop: scrollTopTarget
                }, this.ANIMATION.DURATION);
              }
            });

            scope.init();
          }
        }
      })
      .directive('stFixedheader', () => {
        return {
          restrict: 'A',
          link: (scope, $element, attrs) => {
            _.merge(scope, {
              $win: $(window),
              $element: $element,
              offsetTopTarget: $element.offset().top,

              init: function () {
                this.bindEvents();
              },
              bindEvents: function () {
                var that = this;

                this.$win.on('scroll', function () {
                  that.judgeScrollTop();
                });
              },
              judgeScrollTop: function () {
                var
                  scrollTopTarget = this.$win.scrollTop();

                if (scrollTopTarget > this.offsetTopTarget) {
                  this.$element.css('position', 'fixed');
                } else {
                  this.$element.css('position', 'absolute');
                }
              }
            });

            scope.init();
          }
        }
      })
    /**
     * stDdSelect (絞り込み条件の変更、ステータスの更新などに利用するドロップダウン式のポップアップ)
     * - stDdSelect(mandatory): 選択項目用の配列(現状Arrayのみ対応) ($enums と書くと sb.enums コンポーネントを利用できる)
     * - ngModel(mandatory): 初期選択表示に利用される、stDdSelectManualが指定されていない場合、自動で ngModel の変数を更新する
     * - stDdSelectManual(optional): 選択確定後に、独自の処理を実行する ($newValue, $oldValue, $isDiffValue を引数に利用可能)
     * - stDdSelectNothing(optional): 選択項目先頭に 「指定無し(null)」を追加する
     * - stDdSelectExclude(optional): 指定された文字列と一致する 値を持つ項目は一覧から除去される
     *
     * [sample]
     * <a st-dd-select="stage.code as stage.name for stage in $enums.selectionStageOptions orderBy stage.sortNo"
     *    ng-model="c.user.status" st-dd-select-nothing
     *    st-dd-select-manual="c.updateUserStatus($newValue, $oldValue, $isDiffValue)">
     *        現在のステータス: {% c.enums.userStatus[c.model.status].name %}
     * </a>
     *
     * [sample]
     * st-dd-select="key as obj.label for (key, obj) in $enums.someStatus"
     *
     *
     * TODO(kitaly) 2.x.x 複数選択対応(w/ 全て&クリア操作)、特定のパターンの配列/Objの自動処理
     *
     * st-dd-select="$enums.userStatusObject"
     * {
   *   ACT: {code: 'ACT', name: '有効', sortNo: 0},
   *   INT: {code: 'INT', name: '無効', sortNo: 1}
   * }
     *
     * st-dd-select="$enums.userStatusArray"
     * [
     *   { code: 'ACT', name: '有効', sortNo: 0},
     *   { code: 'INT', name: '無効', sortNo: 1},
     * ]
     */
      .directive('stDdSelect', ($compile: ng.ICompileService, $document: ng.IDocumentService) => {

        var DD_SELECT_REGEX = /^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+([\s\S]+?)(?:\s+orderBy\s+([\s\S]+?))?$/;
        var PROPERTY_REF_REGEX = /^\s*([^\.]+)\.([^\.]+)\s*$/
        var CALLBACK_REGEX = /^\s*([^\()]+)?\(([^\)]+)\)\s*$/
        var ORIGINAL_KEYNAME_HOLDER = "_____ST_DD_SELECT_KEY";

        var DD_POPUP_OVERLAY =
          '<div class="dd-popup-overlay" ng-click="cancel()"></div>';
        var DD_POPUP_TEMPLATE =
          '<div class="dd-popup-temp">' +
          '<ul>' +
          '<li class="control-area" >' +
          '<span ng-click="ok()" class="dd-popup-temp-btn">確定</span> - ' +
          '<span ng-show="enableNothing"><span ng-click="reset()" class="dd-popup-temp-btn">解除</span> - </span>' +
          '<span ng-click="cancel()" class="dd-popup-temp-btn">閉じる</span>' +
          '</li>' +
          '<li ng-repeat="elem in sortedArray" ng-click="clickOnItem(elem[valueProp])">' +
          '<span class="checkmark" ng-class="{\'checked\': isSelected(elem[valueProp])}" ></span> <span class="item">{% elem[labelProp] %}</span>' +
          ' </li>' +
          '</ul>' +
          '</div>';

        var errorFn = () => {
          throw new Error('Illegal use of stDdSelect: check expression provided for stDdSelect attribute');
        };

        // "myElem.code" -> "code"
        var extractProp = (expr: string, isArray: boolean, keyExpr: string) => {

          var match = expr.match(PROPERTY_REF_REGEX);
          if(isArray){
            if(!match) errorFn();
          } else {
            if(expr == keyExpr) return ORIGINAL_KEYNAME_HOLDER;
            else if(!match) errorFn();
          }
          return match[2];
        };

        var extractCallbackArgs = function (callbackExpr) {
          var callbackArgs = []; // [$newValue, hoge, $oldValue]
          var callbackFnExpr = null;
          if (callbackExpr) {
            var match = callbackExpr.match(CALLBACK_REGEX);
            if (!match) errorFn();

            callbackFnExpr = match[1];
            callbackArgs = _.map(match[2].split(','), (arg:string) => {
              return arg.trim();
            });
          }
          return {callbackArgs: callbackArgs, callbackFnExpr: callbackFnExpr};
        };

        return {
          restrict: 'A',
          require: 'ngModel',
          compile: ($element, $attr) => {

            // 各属性情報の抽出
            var selectExpr = $attr.stDdSelect;
            var ngModelExpr = $attr.ngModel;
            var callbackExpr = $attr.stDdSelectManual; // doSomethingOnClose($newValue, hoge, $oldValue)
            var enableNothing = ($attr.stDdSelectNothing != null); // 指定無し項目を使うか否か
            var excludeExpr = $attr.stDdSelectExclude;

            // シンタックスチェックして各要素の抽出
            var match = selectExpr.match(DD_SELECT_REGEX);
            if (!match) errorFn();

            var valueExpr = match[1]; // myElem.code
            var labelExpr = match[2]; // (as) myElem.name
            var elemExpr = match[3]; // (for) myElem
            var objKeyExpr = match[4]; // for (key, obj) -> key
            var objValExpr = match[5]; // for (key, obj) -> obj
            var enumExpr = match[6]; // (in) myArray
            var sortExpr = match[7];  // (orderBy) myElem.sortNo

            var isArray = (elemExpr) && (!objKeyExpr && !objValExpr);

            var valueProp = extractProp(valueExpr, isArray, objKeyExpr); // code (maybe ORIGINAL_KEYNAME_HOLDER)
            var labelProp = extractProp(labelExpr, isArray, objKeyExpr); // name (maybe ORIGINAL_KEYNAME_HOLDER)
            var sortProp = sortExpr ? extractProp(sortExpr, isArray, objKeyExpr) : null; // sortNo (maybe ORIGINAL_KEYNAME_HOLDER)


            // シンタックスチェックして引数部分の文字列を抽出
            var cbConfig = extractCallbackArgs(callbackExpr);

            // Link Function Here

            return ($scope:ng.IScope, $iElem, $iAttr, ngModelCtrl:ng.INgModelController) => {

              // Sort Array
              var arrayBeforeSort = setupArrayBeforeSort($scope);
              var excludedArray = excludeSomeElements(excludeExpr, arrayBeforeSort);
              var sortedArray = _.sortBy(excludedArray, (elem) => {
                return elem[sortProp];
              });

              // ポップアップのDOMおよびScopeの初期化
              var popupScope:any = $scope.$new();

              var popupOverlay = angular.element(DD_POPUP_OVERLAY);
              popupOverlay.appendTo('body');
              $compile(popupOverlay)(popupScope);

              var popupDom = angular.element(DD_POPUP_TEMPLATE);
              popupDom.appendTo('body');
              $compile(popupDom)(popupScope);

              // 重ねてポップアップ表示しようとしないように
              var isPopupVisible = false;


              // クリック時にポップアップ表示、同時に scope の内容をリフレッシュ
              $element.on('click', () => {
                if (!isPopupVisible) {
                  renewPopupScope();
                  popupOverlay.show();
                  popupDom.show();
                  popupDom.css({
                    top: $element.offset().top + $element.outerHeight() + 5,
                    left: $element.offset().left
                  });
                  popupScope.$apply();
                }
              });

              // ESCで閉じる
              $document.bind('keydown', function (evt) {
                if (evt.which === 27) {
                  evt.preventDefault();
                  hidePopup();
                }
              });

              function renewPopupScope():void {
                var initVal = $scope.$eval(ngModelExpr);

                popupScope.sortedArray = sortedArray;
                popupScope.initValue = initVal;
                popupScope.activeValue = initVal;
                popupScope.valueProp = valueProp;
                popupScope.labelProp = labelProp;
                popupScope.enableNothing = enableNothing;


                popupScope.clickOnItem = (value:string) => {
                  popupScope.activeValue = value;
                }

                popupScope.isSelected = (value:string) => {
                  return value == popupScope.activeValue;
                }

                popupScope.ok = () => {
                  if (callbackExpr) {
                    $scope.$eval(buildCallbackExpression());
                  } else { //特にコールバック指定がなければ勝手に update
                    ngModelCtrl.$setViewValue(popupScope.activeValue);
                    ngModelCtrl.$render();
                  }
                  hidePopup();
                }

                popupScope.reset = () => {
                  popupScope.activeValue = null;
                  popupScope.ok();
                }

                popupScope.cancel = () => {
                  hidePopup();
                }
              }

              function hidePopup():void {
                isPopupVisible = false;
                popupDom.hide();
                popupOverlay.hide();
              }

              function buildCallbackExpression():string {

                if (callbackExpr) {
                  var convertedArgs = _.map(cbConfig.callbackArgs, (arg) => {
                    if (arg == '$newValue') {
                      var final = popupScope.activeValue;
                      return final ? '"' + final + '"' : 'null';
                    } else if (arg == '$oldValue') {
                      var init = popupScope.initValue;
                      return init ? '"' + init + '"' : 'null';
                    } else if (arg == '$isDiffValue') {
                      return popupScope.initValue != popupScope.activeValue;
                    } else {
                      return arg;
                    }
                  });

                  return cbConfig.callbackFnExpr + '(' + convertedArgs.join(',') + ')';
                }
              }

              function setupArrayBeforeSort($scope) {
                var arrayBeforeSort:any[] = null;

                if (/^\$enums/.test(enumExpr)) {
                  /* tslint:disable:no-unused-variable no-eval */
                  var enums = angular.injector(['stanbyServices']).get('enums');
                  var evalStr = enumExpr.replace(/^\$enums/, 'enums');
                  arrayBeforeSort = eval(evalStr);
                  /* tslint:enable */
                  if (_.isEmpty(arrayBeforeSort)) {
                    throw new Error('Specified array for stDdSelect directive is null or empty!');
                  }
                } else {
                  arrayBeforeSort = $scope.$eval(enumExpr);
                }

                if ((isArray && !_.isArray(arrayBeforeSort)) || (!isArray && !_.isObject(arrayBeforeSort))) {
                  throw new Error('The specified enumeration type (object / array) is inconsistent');
                }

                if (!isArray) {
                  var tmpObj = arrayBeforeSort;
                  arrayBeforeSort = [];
                  _.forEach(tmpObj, (value, key) => {
                    value[ORIGINAL_KEYNAME_HOLDER] = key;
                    arrayBeforeSort.push(value);
                  });
                }
                return arrayBeforeSort;
              }

              function excludeSomeElements(excludeExpr: string, array: any[]): any[] {
                if(excludeExpr){
                  _.remove(array, (elem) => {
                    return elem[valueProp] == excludeExpr;
                  });
                }
                return array;
              }
            }
          }
        }
      })
      .directive('stTotop', () => {
        return {
          restrict: 'E',
          template: '<a href="javascript: void(0);" class="cm-totop" id="jsi-totop"></a>',
          link: (scope, $element) => {
            _.merge(scope, {
              $win: $(window),
              $htmlbody: $('html, body'),
              $base: $($element),
              $trigger: null,

              init: function () {
                this.$trigger = this.$base.find('a');

                this.showhideTrigger();
                this.bindEvents();
              },
              bindEvents: function () {
                this.$win.on('scroll', () => {
                  this.showhideTrigger();
                });
                this.$trigger.on('click', () => {
                  this.scrollToTop();
                });
              },
              scrollToTop: function () {
                this.$htmlbody.stop().animate({
                  scrollTop: 0
                }, 750);
              },
              showhideTrigger: function () {
                var
                  heightHalfWindow = this.$win.height() / 2,
                  scrollTopCurrent = this.$win.scrollTop();

                if (scrollTopCurrent > heightHalfWindow) {
                  this.show();
                } else {
                  this.hide();
                }
              },
              show: function () {
                this.$trigger.show().stop().animate({
                  opacity: 1
                }, 150);
              },
              hide: function () {
                this.$trigger.stop().animate({
                  opacity: 0
                }, 150, () => {
                  this.$trigger.hide();
                });
              }
            });

            scope.init();
          }
        }
      })

    /**
     * 要素らをD&Dで垂直に並び替えするDirective
     * - クローン要素をappendしていいセット（親）要素に st-draggable-set 属性を指定。
     *   この要素はAPI提供者として働きます。
     *   属性値に、紐付けたいモデルの'配列'を指定すればモデルを並び替えてくれます
     * - ドラッグ可能にしたい子要素に st-draggable 属性を指定
     * - ドロップ可能にしたい子要素に st-droppable 属性を指定
     * - ドラッグ中に、入れ替えるように退かしたい要素に st-dodgeable 属性を指定（TODO:これがなくても動くようにしたい。兄弟要素でdraggable以降はすべてdodgeableにしないと、下にずれてくれない）
     *
     *
     * @hideaki
     */
    // drag set (parent based)
      .directive('stDraggableSet', ( $document, $timeout ) => {
        return {
          scope: {
            items: '=stDraggableSet'
          },
          // transclude : true,
          // ↓thisを使いたいのでarrow関数式が使えない。よってfunction記述
          controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
            // 基準となる要素
            this.$draggableSet = $element;
            // ドラッグ対象の要素
            this.$target = null;
            // ドラッグ対象の要素をクローンした要素
            this.$clone = null;
            // 高さを補完するために $draggableSet の下に配置する見えない要素（ほんとはもっとスマートに...）
            this.$supplementHeight = null;
            // mousedown時のevent
            this.mousedown_e = null;
            // ドラッグをし始めて、要素がマウスの追随を開始するまでの距離（px）
            this.KEEP = 10;
            // 申し分なくここに書きます：
            // conditionalの条件式にあっていれば要素を入れ替える関数
            // Opts一覧（*は初期値）
            // - originalElem jQo 評価する要素
            // - replacedElem jQo 評価される要素
            // - direction    string *'vertical' | 'horizontal'
            // - animation    bool   *false
            // - conditional  bool を返す関数。条件式を書く。 null を返せば何もtransformしない
            this.replaceElems = (Opts) => {
              Opts = Opts || {};
              Opts.direction = Opts.direction || 'vertical';
              Opts.animation = Opts.animation || false;

              if (Opts.originalElem.is(Opts.replacedElem)) return true;

              if (Opts.conditional()==null){
                //Nothing to do
              }
              else if (Opts.conditional()) {
                if (Opts.replacedElem.css('transform') === 'none') {
                  // 下へどかす処理
                  if (Opts.animation) {
                    Opts.replacedElem.css({
                      transition: 'transform 250ms ease',
                      '-webkit-transition': 'transform 250ms ease',
                      transform: 'translate( 0, ' + Opts.originalElem.outerHeight() + 'px )'
                    });
                    $timeout(() => { Opts.replacedElem.css({ transition: '', '-webkit-transition':'' }) }, 250);
                  } else {
                    Opts.replacedElem.css({
                      transform: 'translate( 0, ' + Opts.originalElem.outerHeight() + 'px )'
                    });
                  }
                }
              }
              //x: その要素の下半分
              //x: else if (ctrl.$clone.offset().top > t + h / 2) {
              else {
                // 上にもどす処理
                if (Opts.animation) {
                  Opts.replacedElem.css({
                    transition: 'transform 250ms ease',
                    '-webkit-transition': 'transform 250ms ease',
                    transform: ''
                  });
                  $timeout(() => { Opts.replacedElem.css({ transition: '', '-webkit-transition': '' }) }, 250);
                } else {
                  Opts.replacedElem.css({
                    transform: ''
                  });
                }
              }
            };
            // 初期化（もっと少なく済みたかった...）
            this.destroyElements = () => {
              this.$supplementHeight ? this.$supplementHeight.remove() : null;
              this.$target ? this.$target.show() : null;
              this.$clone ? this.$clone.remove() : null;
              this.$draggableSet.css({ position: '', cursor: '', marginBottom: '' });
              this.$draggableSet.find('[st-dodgeable]').css({ transform: '', transition: '', '-webkit-transition': '' });
              $document.find('body').css({ userSelect: '' });
              this.$draggableSet.find('input, textarea').prop({ disabled: false });
              this.$supplementHeight = this.$target = this.$clone = this.mousedown_e = null;
            };
          }],
          link: (scope, el, attrs, ctrl) => {
            // window全体にバインドしたいのでwindowに
            $(window).on('mousemove', (e) => {
              var xDiff, yDiff;
              // mousedownしており、かつ、draggableハンドルの上でmousedownしたか
              if (e.which && ctrl.mousedown_e) {
                xDiff = e.pageX - ctrl.mousedown_e.pageX;
                yDiff = e.pageY - ctrl.mousedown_e.pageY;
                xDiff = Math.abs(xDiff);
                yDiff = Math.abs(yDiff);

                // mousedownしてから指定したpx動いた、かつクローンがまだない
                // mousemoveの中だが、D&Dの一連の動作で一度しか呼ばれない（ && !ctrl.$clone によって ）
                if ((xDiff > ctrl.KEEP || yDiff > ctrl.KEEP) && !ctrl.$clone) {
                  // クローンを生成&挿入&css
                  ctrl.$clone = ctrl.$target.clone()
                    .appendTo(ctrl.$draggableSet)
                    .addClass('st-draggable-clone')
                    .css({ position: 'absolute', width: '100%', boxShadow: '5px 10px 25px rgba(0,0,0,.2)', pointerEvents: 'none', transform: 'scale(1.02)' });
                  // eにもとづき位置(css)を適用
                  var top = e.pageY - ctrl.$draggableSet.offset().top;
                  ctrl.$clone.css({
                    // 右側の値を引くことで、mousedown時の位置にカーソルがくるようにする
                    top: top - ctrl.mousedown_e.offsetY
                  });
                  // ctrl.$draggableSet に position:staticだったらrelativeを指定
                  ctrl.$draggableSet.css('position') == 'static' ? ctrl.$draggableSet.css({ position: 'relative' }) : null;
                  ctrl.$draggableSet.css({ cursor: 'row-resize' });// or 'move'
                  // tableにも対応するため（また、使用中の要素にスタイルを書くことが避けれるため）
                  // 新しい要素を ctrl.$draggableSet の insertAfter し、hideしたctrl.$targetの高さ分を補完する
                  ctrl.$supplementHeight = $('<div>').insertAfter(ctrl.$draggableSet).css({ height: ctrl.$target.outerHeight() });
                  // 他の要素をどかす処理
                  ctrl.$draggableSet.find('[st-dodgeable]').each(function(i) {
                    var that = this;
                    // conditionalの条件式にあっていれば垂直にアニメーション付きで要素を入れ替える
                    return ctrl.replaceElems({
                      originalElem: ctrl.$clone,
                      replacedElem: $(this),
                      direction: 'vertical',
                      conditional: () => {
                        var t = $(that).offset().top;
                        var h = $(that).outerHeight();
                        // ctrl.$cloneのtopがその要素の上半分を超えてるなら、その要素を下にやる
                        // ctrl.$cloneのtopがその要素の上半分を超えてないなら、その要素をもどす
                        return ctrl.$clone.offset().top < t + h / 2;
                      }
                    });
                  });
                  // クローン元要素を非表示に
                  ctrl.$target.hide();
                }
                // クローンが表示されている
                else if (ctrl.$clone && ctrl.$clone.css('display') != 'none') {
                  // eにもとづき位置(css)を適用
                  top = e.pageY - ctrl.$draggableSet.offset().top;
                  ctrl.$clone.css({
                    // 右側の値を引くことで、mousedown時の位置にカーソルがくるようにする
                    top: top - ctrl.mousedown_e.offsetY
                  });
                  // 他の要素をどかす処理
                  // 急にマウスを上下したときに、その飛ばした要素も処理できるようeachで回す
                  ctrl.$draggableSet.find('[st-dodgeable]').each(function(i) {
                    var that = this;
                    // conditionalの条件式にあっていれば垂直にアニメーション付きで要素を入れ替える
                    return ctrl.replaceElems({
                      originalElem: ctrl.$clone,
                      replacedElem: $(this),
                      direction: 'vertical',
                      animation: true,
                      conditional: () => {
                        var t = $(that).offset().top;
                        var h = $(that).outerHeight();

                        // その要素の半分より clone top のほうが上
                        var isCloneTopHigher   = ctrl.$clone.offset().top < t + h / 2;
                        // その要素の半分より clone bottom のほうが下
                        var isCloneBottomLower = ctrl.$clone.offset().top + ctrl.$clone.outerHeight() > t + h / 2;

                        // transition中ならnullを返して何もしない
                        if (!($(that).css('transition') == 'all 0s ease 0s' || $(that).css('transition') == '')) {
                          return null;
                        }
                        else if (isCloneTopHigher && isCloneBottomLower) {
                          return $(that).css('transform') == 'none';
                        }
                        else {
                          return isCloneTopHigher;
                        }
                      }
                    });
                  });
                }
              }
            });
            $(window).on('mouseup', (e) => {
              // ctrl.$clone があれば要素をドラッグしていたとみなす
              if (ctrl.$target && ctrl.$clone) {
                //** 結果
                var $items = ctrl.$clone.siblings();
                var $droppableItems = $items.filter(function() {
                  var isClone = $(this).is('.st-draggable-clone');
                  return !isClone;
                });
                var $dodgeItems = $droppableItems.filter(function() {
                  var isTransform = $(this).css('transform') != 'none';
                  return isTransform;
                });
                var $undodgeItems = $droppableItems.filter(function() {
                  var isTransform = $(this).css('transform') != 'none';
                  return !isTransform;
                });

                // 入れ替えたい要素のindex
                var targetIndex = ctrl.$target.index('[st-draggable]');
                // 挿入先のindex
                var insertIndex = $dodgeItems.eq(0).index('[st-dodgeable]:visible');

                // もどす位置を計算
                var translateY;
                if ($undodgeItems.filter(':visible:eq(-1)').length) {
                  translateY = $undodgeItems.filter(':visible:eq(-1)').offset().top;
                  translateY += $undodgeItems.filter(':visible:eq(-1)').outerHeight();
                } else {
                  translateY = ctrl.$draggableSet.offset().top;
                }
                translateY -= ctrl.$clone.offset().top;
                // 指定した場所へアニメーション
                ctrl.$clone.css({
                  transition: 'transform 250ms ease',
                  '-webkit-transition': 'transform 250ms ease',
                  transform: 'translate( 0, ' + translateY + 'px )'
                });
                $timeout(() => {
                  // モデルの置き換え
                  scope.items.moveAndShift(targetIndex, insertIndex);
                  // $apply して要素の描画更新（これをするほうがjQueryで書く必要がないし、scopeに変更があったときにViewへの描画がバグることもない）
                  scope.$apply();

                  ctrl.destroyElements();
                }, 250);
              }
              else{// else if( ctrl.$target && !ctrl.$clone )
                ctrl.destroyElements();
              }
            });
          }
        }
      })
    // drag
      .directive('stDraggable', ( $document ) => {
        return {
          // scope: {},
          require: '^stDraggableSet',
          link: function(scope, el, attrs, ctrl) {
            // ※tableにも対応
            var $jQo = el.is('tr') ? el.find('>*:eq(0)') : el;
            // ドラッグするためのハンドル（st-draggablehandle）を作成
            var $handle = $('<div st-draggablehandle class="sg-box-header-arrow-top sg-box-header-arrow-bottom">').appendTo($jQo);
            // IEで、cellの高さに対してabsolute要素のheight:100%が効かないのでscriptで高さ指定（textareaの高さ可変にも対応できるようにwatch
            scope.$watch( () => el[0].offsetHeight, (newVal) => $handle.css({ height: newVal - 1 }) );
            // mouse down event
            el.on('mousedown', function(e) {
              // draggableハンドルの上でmousedownしたか　→　してればこの.draggableRow要素を保持
              if ($(e.target).is('[st-draggablehandle] , [st-draggablehandle] *')) {

                // Firefox が e.offsetX/Y に対応していないので自作
                e.offsetY = e.pageY - $(this).offset().top;

                // 保持
                ctrl.$target = $(this); ctrl.mousedown_e = e;

                // 青い選択範囲が表示されないように
                // * なぜかbodyやbody直下の要素に適用しないとドラッグ中に青い選択範囲がでてきてしまう
                $document.find('body').css({ userSelect: 'none' });
                // inputらに focus されるときがあり、それに誘発されてツールチップがでるので
                ctrl.$draggableSet.find('input, textarea').prop({ disabled: true });
              }
            });
          }
        }
      })
      .directive('stSetIframeHeight', () => {
        // set height of iframe container to content height
        return {
          restrict: 'A',
          link: function(scope, element, attrs){
            element.on('load', function(){
              var iHeight = element[0].contentWindow.document.body.scrollHeight + 'px';
              element.css('height', iHeight);
              })
          }
        }
      })

      .directive('stEditchecker', ['$timeout', '$window', ($timeout, $window) => {
        return {
          restrict: 'A',
          link: function (scope, $element, $attrs) {
            var isLeaving = false;
            // 当該フォームが編集された状態かどうかを取得
            var isDirty = () => {
              var formObj = scope[$element.attr('name')];
              return formObj && formObj.$pristine === false;
            };
            // 離脱防止アラートを表示
            var areYouSurePrompt = () => {
              if (isDirty()) {
                return '編集中の情報を破棄して移動しますか？';
              }
            };
            // binding events
            var bindEvents = () => {
              // リロード時に離脱防止アラートを表示
              $(window).bind('beforeunload', areYouSurePrompt);

              // エレメント破棄時は離脱防止アラートイベントも破棄
              $element.bind('$destroy', (event) => {
                $(window).unbind('beforeunload', areYouSurePrompt);
              });

              // angular上でURL変更イベントが発生した時
              scope.$on('$locationChangeStart', (event, next, current) => {
                var prompt = areYouSurePrompt();
                if (!prompt) {
                  return;
                }
                if ($element.find(':focus').length > 0) {
                  $element.find(':focus').blur();
                }
                if (!isLeaving) {
                  event.preventDefault();
                  $timeout(() => {
                    if (confirm(prompt)) {
                      isLeaving = true;
                      $window.location.href = next;
                    }
                  });
                }
              });
            };

            var init = function() {
              bindEvents();
            }

            // initialize execute
            init();

          }
        };
      }])
      .directive('stShowForm', ($rootScope: ng.IRootScopeService, $document) => {
          // 求人プレビュー閲覧時、親コンテナの高さは求人フォームに影響されるため、フォーム(ついでにフッター)を隠す
          return {
            link: function(scope, $element) {

              var viewPre = $rootScope.$on('viewingPreview', () => {
                $document.find('footer.cm-last-footer').css({ display: 'none' });
                $element.css({ display: 'none' });
              });

              var notViewPre = $rootScope.$on('notViewingPreview', () => {
                $document.find('footer.cm-last-footer').css({ display: ''});
                $element.css({ display: '' });
                })

              scope.$on('$destroy', () => {
                viewPre;
                notViewPre;
              });
            }
          }
      })
      .directive('loading',['$http','$document', ($http,$document) => {
       return {
           restrict: 'A',
           link: function (scope, elm, attrs){
               scope.isLoading = () => {
                   return $http.pendingRequests.length > 0;
               };
               scope.$watch(scope.isLoading,(v) => {
                   if(v){
                       $document.find('.js-loading').css({display:'noen'});
                       elm.show();
                   }else{
                       elm.hide();
                   }
               });
           }
       };
     }]);
  }
}
