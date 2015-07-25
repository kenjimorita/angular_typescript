/// <reference path="../vendor_def/tsd.d.ts" />
/// <reference path="../services/common/routes.ts" />
/// <reference path="../services/common/enums.ts" />
/// <reference path="../directives/common/widgets.d.ts" />
/// <reference path="../controllers/image-popup-controller.ts" />

module controllers.corporates {
  import res = st.response.masters;

  /**
   * 企業情報の編集
   */
  export class CorporateProfileEdit {
    masters: any;
    corporate: any;
    images: any;
    flagFocusedMarkdown: boolean = false;
    logoImage: {imageId: string; prefix: string};
    isPreviewingMarkdown: boolean = false;
    logoImageUrl: string;
    coverImageUrl: string;
    imageRootPath: any;

    constructor(
      public enums: sb.Enums,            // template からアクセスするためpublic
      private $scope: any,
      private $compile: any,
      private stModal: std.Modal,
      private stUtils: std.Utils,
      private $location: ng.ILocationService,
      private $window: ng.IWindowService,
      private $state: ng.ui.IStateService,
      private routes: st.Routes,
      private $timeout: ng.ITimeoutService,
      public stbImage: service.images.ImageService,
      public stbImagePopup: service.images.ImagePopupService,
      public stbConfig: stb.ConfigService,
      public config: ng.IHttpPromiseCallbackArg<st.response.configuration.ConfigResponse>,
      public stStaticConfig: sb.StaticConfig
    ){}

    /**
     * データ取得
     */
    init():void {
      this.config = this.config.data;

      this.routes.corporatePublic.show().success((data) => {
        this.corporate = data;

        if (this.corporate.logo) {
          this.logoImage = {
            imageId: this.corporate.logo.imageId,
            prefix: this.corporate.logo.prefix
          };
        }

        if (!this.corporate.content) {
          this.corporate.content = {descriptions : []};
        }

      });
    }

    focusMarkdown(): void {
      this.flagFocusedMarkdown = true;
    }

    uploadInlineImageToInsertText($element, params): void {
      var _this = params.this;

      _this.routes.images.uploadInline(params.form)
        .success((res) => {
          var
            beforeText, afterText,
            text = $element.val(),
            urlImage = _this.stbImage.getFullImageUrl(_this.config, res.id, res.prefix),
            imageText = '![画像](' + urlImage + ' "画像")\n',
            position = $element[0].selectionStart;

          if (!_this.flagFocusedMarkdown || position === text.length) {
            position = 0;
          }

          if (position !== 0) {
            imageText = '\n' + imageText;
          }

          beforeText = text.slice(0, position);
          afterText = text.slice(position, text.length);

          text = beforeText + imageText + afterText;

          _this.corporate.content.markdownFreeText = text;
        })
        .error((err) => {
          //console.log(err);
        });
    }

    public addTdSet(): void {
      this.corporate.content.descriptions.push({term: null, description: null});
    }

    public deleteTdSet(index): void {
      this.corporate.content.descriptions.splice(index, 1);
      this.$scope.form1.$setDirty();
    }

    /**
     * 「追加項目」欄をバリデートする
     * フィールドがどちらか empty の場合は false(invalid) を返します
     */
    validateTerm(formScope, mainVal: any, relationVal: any): boolean {
      // 新しく項目追加を行った際は明示的に dirty をセット
      if (mainVal === null && relationVal === null) {
        formScope.termDescDescription.$setDirty();
        formScope.termDescTerm.$setDirty();
      }
      return (!mainVal && relationVal) ? false : true;
    }

    /**
     * サーバへ保存
     */
    saveDraft(form: ng.IFormController):void {
      var modal = this.stModal.modalConfirm({
        msg: '編集内容を保存します。続行しますか？'
      });

      modal.result.then(() => {
        this.trimTermDescItem(this.corporate.content.descriptions);
        this.routes.corporatePublic.update(this.corporate)
          .success(data => {
          this.stUtils.withUpdateOkMessage(() => {
            //Nothing
          });
          this.$state.reload();
          this.corporate.versionNo += 1;
          // 保存後は離脱防止アラートをオフにする
          this.$scope.form1.$setPristine();
        });
      });
    }

    /**
     *「追加項目」欄で term と description、両フィールドとも
     * 未記入のままになっている追加項目については削除する
    */
    private trimTermDescItem(termDescItems) {
      var descItem: any;
      for (var i = 0; i < termDescItems.length; ++i) {
        descItem = termDescItems[i];
        if (!descItem.term && !descItem.description) {
          termDescItems.splice(i, 1);
          i -= 1;
        }
      }
    }

    /**
     * MarkDow編集モード
     */
    public editMarkdown(): void {
      this.isPreviewingMarkdown = false;
      this.$timeout(function() {
        var $focusEl = $('.sg-form-markdown-textarea[name="markdownFreeText"]');
        if ($focusEl.length === 1) {
          $focusEl.focus();
        }
      });
    }

    /**
     * HTMLプレビュー
     */
    previewHTML(): void {
      this.routes.utils.convertMarkdownToHtml(this.corporate.content.markdownFreeText)
        .success((data:res.HtmlText) => {
          this.corporate.htmlFreeText = data.htmlText;
          this.isPreviewingMarkdown = true;
        });
    }


    /**
     * インライン画像を挿入する
     */
    showInlineImagePopup(textAreaId: string): void {

      var that = this;

      this.stbImagePopup.showInlineImagePopup((results: st.response.images.InlineImage[]) => {
        if(results && results.length > 0) {
          var
            $element = $('#jsi-markdown-freetext'), //NOTE(kitaly): controller で DOM を触ってしまい、すいません
            $textArea: any = $element[0],
            beforeText, afterText,
            text = $element.val(),
            position = $textArea.selectionStart;


          var imgListTxt = _.map(results, (res: st.response.images.InlineImage) => {
            var imageUrl = that.stbImage.getFullImageUrl(that.config, res.imageId, res.prefix);
            return '![画像](' + imageUrl + ' "画像")\n';
          }).join('\n');


          if (!that.flagFocusedMarkdown || position === text.length) {
            position = 0;
          }

          if (position !== 0) {
            imgListTxt = '\n' + imgListTxt;
          }

          beforeText = text.slice(0, position);
          afterText = text.slice(position, text.length);

          text = beforeText + imgListTxt + afterText;

          that.corporate.content.markdownFreeText = text;
          that.$scope.form1.$setDirty();
        }
      });
    }

    showCorporateImagePopup(): void {
      var initialImage = this.corporate.logoImage;
      this.stbImagePopup.showLogoImagePopup(initialImage, (result) => {
        this.corporate.logoImage = result;
        this.$scope.form1.$setDirty();
      });
    }

    showCoverImagePopup(): void {
      var initialImage = this.corporate.coverImage;
      this.stbImagePopup.showCoverImagePopup(initialImage, (result) => {
        this.corporate.coverImage = result;
        if (result) {
          this.coverImageUrl = this.stbImage.getFullImageUrl(this.config, result.imageId, result.prefix);
        }
        this.$scope.form1.$setDirty();
      });
    }
    showCoverInstruction(): void {
      var modal = this.stModal.modalConfirm({
        title: 'カバー画像とは',
        msg: '<p class="sg-modal-instruction sg-corporate-cover-instruction">「カバー画像」は、求人一覧ページで上部に掲載される画像です。<br>オフィスや職場の雰囲気が伝わる画像、会社の雰囲気がイメージしやすい画像を掲載することにより、求職者が求人に興味を持ちやすくなります。<ul class="sg-cover-list"><li>JPEG、PNG、GIFが登録可能な画像ファイルの形式です</li><li>画像ファイルの最大容量は5MB、最小サイズは横幅500px、縦幅200pxです</li></ul>',
        okButton: 'カバー画像を変更する',
        cancelButton: 'ウィンドウを閉じる'
      });
      modal.result.then(() => {
        this.showCoverImagePopup();
      });
    }
    showLogoInstruction(): void {
      var modal = this.stModal.modalConfirm({
        title: '企業ロゴとは',
        msg: '<p class="sg-modal-instruction sg-corporate-logo-instruction">「企業ロゴ」は、求人一覧ページや求人詳細ページの上部に表示される企業やサービスのロゴ画像です。<br>企業ロゴが登録されていない場合は、会社名がテキストで表示されます。<ul class="sg-cover-list"><li>JPEG、PNG、GIFが登録可能な画像ファイルの形式です</li><li>画像ファイルの最大容量は5MB、最小サイズは横幅50px、縦幅50pxです</li></ul>',
        okButton: '企業ロゴを変更する',
        cancelButton: 'ウィンドウを閉じる'
      });
      modal.result.then(() => {
        this.showCorporateImagePopup();
      });
    }
  }
}


module stanby.routing.corporate {
  export function initRouting(){

    angular.module('stanbyControllers')
      .controller('CorporateEditCtrl', controllers.corporates.CorporateProfileEdit)
      .config( ($stateProvider, $urlRouterProvider, enums: sb.Enums) => {

        $urlRouterProvider.otherwise('/edit');

        $stateProvider
          .state('corporateEdit', {
            url: '/edit',
            templateUrl: '/templates/corporate/edit.html',
            controller: 'CorporateEditCtrl as c',
            roles: [enums.userRole.ADM.code, enums.userRole.REC.code],
            resolve: {
              config: (stbConfig: stb.ConfigService) => {
                return stbConfig.getConfigPromise();
              }
            },
            onEnter: ($rootScope) => {
              $rootScope.$emit('breadcrumbs', [
                { url: '/', text: 'Stanby Recruiting' },
                { url: '', text: '公開企業プロフィール' }
              ]);
            }
          });
      })
    ;
  }
}
