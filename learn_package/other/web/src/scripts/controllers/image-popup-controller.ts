/// <reference path="../vendor_def/tsd.d.ts" />
/// <reference path="../services/common/routes.ts" />
/// <reference path="../directives/common/widgets.d.ts" />

/* -----------------------------------
              Image Service (stbImage)
 ------------------------------------ */

module service.images {

  import LogoImage = st.response.images.LogoImage;
  import InlineImage = st.response.images.InlineImage;
  import CoverImage = st.response.images.CoverImage;

  export class ImagePopupService{
    constructor(
      private stModal: std.Modal,
      private stUtils: std.Utils
    ){}

    public showCoverImagePopup(initialImage: any, cbOnClose: (res: CoverImage) => void): void {
      this.checkLegacyBrowser();

      var modalConfig = {
        templateUrl: '/templates/images/images-popup-cover.html',
        controller: 'CoverImagePopupCtrl as ipc',
        resolve: {
          initialImage: () => { return initialImage; },
          configPromise: (stbConfig: stb.ConfigService) => { return stbConfig.getConfigPromise();}
        }
      };

      this.stModal.modalCustom(modalConfig).result.then(cbOnClose);
    }

    public showLogoImagePopup(initialImage: any, cbOnClose: (res: LogoImage) => void): void {
      this.checkLegacyBrowser();

      var modalConfig = {
        templateUrl: '/templates/images/images-popup-logo.html',
        controller: 'LogoImagePopupCtrl as ipl',
        resolve: {
          initialImage: () => { return initialImage; },
          configPromise: (stbConfig: stb.ConfigService) => {return stbConfig.getConfigPromise();}
        }
      };

      this.stModal.modalCustom(modalConfig).result.then(cbOnClose);
    }


    public showInlineImagePopup(cbOnClose: (res: InlineImage[]) => void): void {

      this.checkLegacyBrowser();

      var modalConfig = {
        templateUrl: '/templates/images/images-popup-inline.html',
        controller: 'InlineImagePopupCtrl as ipi',
        resolve: {
          configPromise: (stbConfig: stb.ConfigService) => {return stbConfig.getConfigPromise();}
        }
      };

      this.stModal.modalCustom(modalConfig).result.then(cbOnClose);
    }

    private checkLegacyBrowser(){
      if (/msie [78]/i.test(navigator.userAgent)) {
        this.stUtils.toastDanger('Internet Explorer 9以降のバージョンのブラウザで画像の操作をしてください');
        return;
      }
    }
  }

  export class ImageService{
    constructor(
      private routes:st.Routes
    ){}

    public getTmpImageUrl(imageId: string, yearMonth: string): string {
      return '/api/tmp-images/' + yearMonth + '/' + imageId;
    }

    public getFullImageUrl(config: any, imageId: string, prefix: string): string {
      return config.configuration.image.rootPath + prefix + '/images/' + imageId + '_full';
    }

    public getThumbnailImageUrl(config: any, imageId: string, prefix: string): string{
      return config.configuration.image.rootPath + prefix + '/images/' + imageId + '_thumbnail';
    }

  }
}


/* -----------------------------------
                     Image Popup Base
 ------------------------------------ */
module controllers.images {
  import bs = ng.ui.bootstrap
  import PooledImage = st.response.images.PooledImage;
  import ConfigResponse = st.response.configuration.ConfigResponse

  export interface ImagePopup {
    /** クロップ用の一時保存画像 */
    temporaryFilesForCrop: any
    /** 公開用に選択した画像オブジェクト */
    selectedImage: any
    /** クロップするための一時保存画像 */
    cropTargetImage: any
    /** コンフィグ */
    config: ng.IHttpPromiseCallbackArg<ConfigResponse>
    /** ImageService */
    stbImage: service.images.ImageService
    /** ポップアップ上の選択を確定させてポップアップを閉じる処理 */
    ok: () => void
    /** ポップアップ上の選択をキャンセルしてポップアップを閉じる処理 */
    cancel: (result:any) => void
    /** 画像押下時の処理 */
    clickImage: (imageObj:any, event:any) => void
    /** 選択中の画像など明らかに削除すべきでない画像かの判定 */
    isDeletable: (imageId:string) => boolean
    /** ポップアップ上で選択中の画像か判定 */
    isSelectedImage: (imageId:string) => boolean
    /** イメージをクロップ */
    cropImage: (ipc:ImagePopup, options:any) => void
  }
  
  export class ImagePopupBase { //NOTE(kitaly): ts バージョンあげたらprotected使用したい

    /* --------------
            Constants
     ---------------- */
    private DRAGGING_CLASS = 'dragging';
  
    private ACTION_MODE = {
      Select: {code: 'SEL'},
      Upload: {code: 'UPL'},
      Delete: {code: 'DEL'},
      Crop: {code: 'CRP'}
    }

    static ASPECT_RATIO_TYPE = {
      Logo: {code: 'LGO'},
      Cover: {code: 'CVR'},
      Inline: {code: 'INL'}
    }

    /* --------------
               Fields
     ---------------- */
    public pooledImages: Array<PooledImage>;
    public actionMode: string = 'SEL';
    public aspectRatioType: string;
    public temporaryFilesForCrop: any;
    public selectedImage: any;
    public cropTargetImage: any;
    public config: st.response.configuration.ConfigResponse;
    public isDragging: boolean = false;

    constructor(
      protected $modalInstance: bs.IModalServiceInstance,
      protected routes: st.Routes,
      protected stUtils: std.Utils,
      protected stModal: std.Modal,
      private stbImageUpload: service.images.ImageUploadService,
      public stbImage: service.images.ImageService,
      aspectRatioType: string
    ){
      this.aspectRatioType = aspectRatioType;

      this.fetchPooledImages((data) => {
        if(!(data.length > 0)) {
          this.switchToUploadMode();
        }
      });
    }


    /* --------------
     * Drag Animation
     --------------- */
    setDraggingStyle(e):void {
      this.isDragging = true;
      e.preventDefault();
    }
  
    resetDraggingStyle(e):void {
      this.isDragging = false;

      if (e) {
        e.preventDefault();
      }
    }

    /* -------------
     * Image Upload
     -------------- */
    dropImages(e):void {
      e.preventDefault();
      e.stopPropagation();

      $(e.target).removeClass(this.DRAGGING_CLASS);

      var files = e.originalEvent.dataTransfer.files;
      this.temporaryFilesForCrop = files;

      this.uploadTemporarilyOrPermanently(files);
      this.resetDraggingStyle(null);
    }
  
    selectUploadFile(e):void {
      var files = $(e.target)[0].files || $(e.target).val();

      this.temporaryFilesForCrop = files;

      this.uploadTemporarilyOrPermanently(files);
    }

    /**
     * Cover, Logo については一時アップロード
     * Inline については 永続アップロード
     * NOTE(kitaly): Baseクラスの方でかなり縦横比別対応を意識してるのでリファクタしないと…
     */
    uploadTemporarilyOrPermanently(files):void {
      var that = this;

      that.stbImageUpload.uploadTemporarilyOrPermanently(files, this.aspectRatioType, () => {
          // Nothing To DO
        })
        .success((res) => {
          if(this.aspectRatioType == ImagePopupBase.ASPECT_RATIO_TYPE.Inline.code){ //NOTE(kitaly): インラインだけは永続アップロード（汚い…)
            that.switchToSelectMode();
          } else {
            that.cropTargetImage = {imageId: res.id, yearMonth: res.yearMonth};
            that.switchToCropMode();
          }
        });
    }

    cropImage(ipc, options):void {
      ipc.stbImageUpload.uploadCroppedImages(options, ipc.aspectRatioType, () => {
        ipc.switchToSelectMode();
      });
    }

    /* -------------
     * Image Delete
     -------------- */
    deleteImage(clickedImage, $event):void {
      if ($($event.target).hasClass('disabled')) {
        return;
      }

      var that = this;

      var onSuccess = (imageId) => {
        that.stUtils.toastInfo('画像を削除しました');

        _.remove(that.pooledImages, (obj) => {
          return obj.id == imageId;
        });
      }

      var onFailure = (errData, status) => {
        if(status == 400 && errData.key == 'error.image.imageUsed'){
          that.stUtils.toastDanger('既に企業ロゴまたは求人画像に指定されている画像のため削除できません。')
        }
      }

      that.stModal
        .modalConfirm({ msg: '本当に選択した画像を削除しますか？'})
        .result.then(() => {
          that.routes.images.deleteImage(clickedImage.imageId)
            .success(() => {
              onSuccess(clickedImage.imageId);
              this.selectedImage = null;
            })
            .error((errData, status) => onFailure(errData, status));
        });
    }

    /* ---------------
     * Action Switcher
     ---------------- */
    switchToUploadMode():void {
      this.actionMode = this.ACTION_MODE.Upload.code;
    }

    switchToDeleteMode():void {
      this.fetchPooledImages(() => {
        this.actionMode = this.ACTION_MODE.Delete.code;
      });
    }

    switchToSelectMode():void {
      this.fetchPooledImages(() => {
        this.actionMode = this.ACTION_MODE.Select.code;
      });
    }

    switchToCropMode():void {
      this.actionMode = this.ACTION_MODE.Crop.code;
    }

    /* ------------
     * Sub-Routines
     ------------ */
    private fetchPooledImages(cbOnSuccess:(data) => void){

      var callback = (data) => {
        this.pooledImages = data;
        cbOnSuccess(data);
      };

      var aspectRatioType = ImagePopupBase.ASPECT_RATIO_TYPE;
      var imageRoutes = this.routes.images;

      switch(this.aspectRatioType){
        case (aspectRatioType.Logo.code):
          imageRoutes.listLogos().success(callback);
          break;
        case (aspectRatioType.Cover.code):
          imageRoutes.listCovers().success(callback);
          break;
        case (aspectRatioType.Inline.code):
          imageRoutes.listInlines().success(callback);
          break;
      }
    }
  }
}



/* -----------------------------------
                    Cover Image Popup
 ------------------------------------ */
module controllers.images {
  import bs = ng.ui.bootstrap
  import LogoImage = st.response.images.LogoImage;
  import InlineImage = st.response.images.InlineImage;
  import CoverImage = st.response.images.CoverImage;
  import PooledImage = st.response.images.PooledImage;


  export class CoverImagePopup extends ImagePopupBase implements ImagePopup {

    public selectedImage: CoverImage; //popup上で選択中の画像
    public cropTargetImage: any; //popup上で選択中の画像
    public buttonLabels: any;
    private initialImage: any; //popup初期化時点で選択中の画像

    constructor(
      $modalInstance: bs.IModalServiceInstance,
      routes: st.Routes,
      stUtils: std.Utils,
      stModal: std.Modal,
      stbImageUpload: service.images.ImageUploadService,
      stbImage: service.images.ImageService,
      initialImage: any,
      configPromise: ng.IHttpPromiseCallbackArg<st.response.configuration.ConfigResponse>
    ){
      super($modalInstance, routes, stUtils, stModal, stbImageUpload, stbImage, ImagePopupBase.ASPECT_RATIO_TYPE.Cover.code);
      this.selectedImage = initialImage;
      this.initialImage = initialImage;
      this.config = configPromise.data;
      this.buttonLabels = {
        'ok': 'カバー画像に決定'
      };
    }

    getThumbnailImageUrl (imageId: string, prefix: string) {
      return this.stbImage.getThumbnailImageUrl(this.config, imageId, prefix);
    }

    getAspectRatioType() {return ImagePopupBase.ASPECT_RATIO_TYPE.Cover.code}

    ok(): void { this.$modalInstance.close(this.selectedImage); }

    cancel(): void { this.$modalInstance.dismiss(); }

    isSelectedImage(imageId: string): boolean {
      return this.selectedImage ? (this.selectedImage.imageId == imageId) : false;
    }

    public isDeletable(): boolean {
      if (
        this.selectedImage && !this.initialImage
      ) {
        return true;
      }

      if (!this.selectedImage || !this.initialImage) {
        return false;
      }

      return this.initialImage.imageId !== this.selectedImage.imageId;
    }

    clickImage(imageObj: any, e:any): void {
      if(this.isSelectedImage(imageObj.id)) {
        this.selectedImage = null;
        // 画像が設定済みの状態でかつ登録済み画像選択が解除された場合のみ解除ラベルをセット
        if (!_.isEmpty(this.initialImage)) {
          this.buttonLabels.ok = 'カバー画像を解除';
        }
      } else {
        this.selectedImage = {imageId: imageObj.id, prefix: imageObj.prefix};
        this.buttonLabels.ok = 'カバー画像に決定';
      }
    }
  }

  export class LogoImagePopup extends ImagePopupBase implements ImagePopup {

    public selectedImage: LogoImage; //popup上で選択中の画像
    public cropTargetImage: any; //popup上で選択中の画像
    private initialImage: any; //popup初期化時点で選択中の画像
    public buttonLabels: any; // ボタンのラベル名

    constructor(
      $modalInstance: bs.IModalServiceInstance,
      routes: st.Routes,
      stUtils: std.Utils,
      stModal: std.Modal,
      stbImageUpload: service.images.ImageUploadService,
      stbImage: service.images.ImageService,
      initialImage: any,
      configPromise: ng.IHttpPromiseCallbackArg<st.response.configuration.ConfigResponse>
    ){
      super($modalInstance, routes, stUtils, stModal, stbImageUpload, stbImage, ImagePopupBase.ASPECT_RATIO_TYPE.Logo.code);
      this.selectedImage = initialImage;
      this.initialImage = initialImage;
      this.config = configPromise.data;
      this.buttonLabels = {
        'ok': 'ロゴ画像に決定'
      };
    }

    getThumbnailImageUrl (imageId: string, prefix: string) {
      return this.stbImage.getThumbnailImageUrl(this.config, imageId, prefix);
    }

    getAspectRatioType() {return ImagePopupBase.ASPECT_RATIO_TYPE.Logo.code}

    ok(): void { this.$modalInstance.close(this.selectedImage); }

    cancel(): void { this.$modalInstance.dismiss(); }

    isSelectedImage(imageId: string): boolean {
      return this.selectedImage ? (this.selectedImage.imageId == imageId) : false;
    }

    public isDeletable(): boolean {
      if (
        this.selectedImage && !this.initialImage
      ) {
        return true;
      }

      if (!this.selectedImage || !this.initialImage) {
        return false;
      }

      return this.initialImage.imageId !== this.selectedImage.imageId;
    }

    clickImage(imageObj: any, e:any): void {
      if(this.isSelectedImage(imageObj.id)) {
        this.selectedImage = null;
        // 画像が設定済みの状態でかつ登録済み画像選択が解除された場合のみ解除ラベルをセット
        if (!_.isEmpty(this.initialImage)) {
          this.buttonLabels.ok = 'ロゴ画像を解除';
        }
      } else {
        this.selectedImage = {imageId: imageObj.id, prefix: imageObj.prefix};
        this.buttonLabels.ok = 'ロゴ画像に決定';
      }
    }
  }

  export class InlineImagePopup extends ImagePopupBase implements ImagePopup {

    public selectedImages: Array<InlineImage> = []; //popup上で選択中の画像(複数可)

    constructor(
      $modalInstance: bs.IModalServiceInstance,
      routes: st.Routes,
      stUtils: std.Utils,
      stModal: std.Modal,
      stbImageUpload: service.images.ImageUploadService,
      stbImage: service.images.ImageService,
      configPromise: ng.IHttpPromiseCallbackArg<st.response.configuration.ConfigResponse>
    ){
      super($modalInstance, routes, stUtils, stModal, stbImageUpload, stbImage, ImagePopupBase.ASPECT_RATIO_TYPE.Inline.code);
      this.config = configPromise.data;
    }

    getThumbnailImageUrl (imageId: string, prefix: string) {
      return this.stbImage.getThumbnailImageUrl(this.config, imageId, prefix);
    }

    getAspectRatioType() {return ImagePopupBase.ASPECT_RATIO_TYPE.Inline.code}

    ok(): void { this.$modalInstance.close(this.selectedImages); }

    cancel(): void { this.$modalInstance.dismiss(); }

    isSelectedImage(imageId: string): boolean {

      if(_.isEmpty(this.selectedImages)) {
        return false;
      } else {
        var found = _.find(this.selectedImages, (image) => {
          return image.imageId == imageId;
        });

        return (found != null);
      }
    }

    isDeletable(imageId: string): boolean {

      //Popup上で選択中の画像
      if (!_.isEmpty(this.selectedImages)){

        var foundInSelectedList = _.find(this.selectedImages, (image) => {
          return image.imageId == imageId;
        });
        if(foundInSelectedList) return false;
      }

      //プール内画像を見て deleteFlg を✓する
      if(!_.isEmpty(this.pooledImages)) {

        var foundInPooledList = _.find(this.pooledImages, (pooled: PooledImage) => {
          return pooled.id == imageId;
        });

        if(foundInPooledList && !foundInPooledList.deletable) return false;
      }

      return true;
    }

    clickImage(imageObj: PooledImage, e:any): void {
      if(this.isSelectedImage(imageObj.id)) {
        _.remove(this.selectedImages, (selected: InlineImage) => {
          return selected.imageId == imageObj.id;
        });
      } else {
        this.selectedImages.push({imageId: imageObj.id, prefix: imageObj.prefix});
      }
    }

  }
}



/* -----------------------------------
 ImageUploadService
 ------------------------------------ */

module service.images {
  export class ImageUploadService {

    constructor(
      private $q: ng.IQService,
      private routes: st.Routes,
      private stUtils: std.Utils,
      private stStaticConfig: sb.StaticConfig
    ){}

    /**
     * アップロード処理とその前後のバリデーション・エラー処理を行う
     */
    public uploadTemporarilyOrPermanently(files, ratioType, callback: () => void):any {
      var that = this;

      if(!that.validateTooLargeImage(files)) {
        return;
      }

      var file = files[0];

      var allPromises =  that.uploadInternal(file, ratioType, (errData, status) => {
          that.handleUploadError(errData, status, ratioType);
      });

      this.$q.all(allPromises)['finally'](callback);

      return allPromises;
    }

    public uploadCroppedImages(options, ratioType, callback: () => void):void {
      var that = this;

      if(!that.validateTooLargeImage(options.files)) {
        return;
      }

      var allPromises = _.map(options.files, function (file) {
        return that.cropInternal({
          file: file,
          startX: options.startX,
          startY: options.startY,
          cropWidth: options.cropWidth,
          cropHeight: options.cropHeight,
          resizeWidth: options.resizeWidth,
          resizeHeight: options.resizeHeight,
          ratioType: ratioType
        }, (errData, status) => {
          that.handleUploadError(errData, status, ratioType);
        });
      });

      this.$q.all(allPromises)['finally'](callback);
    }

    private validateTooLargeImage(files): boolean {

      // Max Image Size is 5242880(5MB x 1024 x 1024)
      var hasTooLargeImg = _.find(files, (file:any) => {
        return (file.size > 5242880);
      });

      if(hasTooLargeImg) {
        this.stUtils.toastDanger("5MBを超える画像を含んでいます。");
      }

      return !hasTooLargeImg;
    }

    /**
     * 単一ファイルのアップロード処理
     */
    private uploadInternal(file, ratioType, cbOnError) {
      var form = new FormData();
      form.append('image', file);

      var aspectRatioType = controllers.images.ImagePopupBase.ASPECT_RATIO_TYPE;
      var imageRoutes = this.routes.images;

      var uploadFunc:Function = null;

      switch(ratioType){
         case (aspectRatioType.Logo.code):
           uploadFunc = imageRoutes.uploadTemporaryLogo;
           break;
         case (aspectRatioType.Cover.code):
           uploadFunc = imageRoutes.uploadTemporaryCover;
           break;
         case (aspectRatioType.Inline.code):
           uploadFunc = imageRoutes.uploadInline; //NOTE(kitaly): インライン画像だけはいきなし永続アップロード
           break;
      }

      return uploadFunc(form).error(cbOnError);
    }

    private cropInternal(options, cbOnError) {
      var form = new FormData();

      form.append('image', options.file);
      form.append('startX', options.startX);
      form.append('startY', options.startY);
      form.append('cropWidth', options.cropWidth);
      form.append('cropHeight', options.cropHeight);
      form.append('resizeWidth', options.resizeWidth);
      form.append('resizeHeight', options.resizeHeight);

      var aspectRatioType = controllers.images.ImagePopupBase.ASPECT_RATIO_TYPE;
      var imageRoutes = this.routes.images;

      var uploadFunc:Function = null;

      switch(options.ratioType){
        case (aspectRatioType.Logo.code):
          uploadFunc = imageRoutes.uploadLogo;
          break;
        case (aspectRatioType.Cover.code):
          uploadFunc = imageRoutes.uploadCover;
          break;
        case (aspectRatioType.Inline.code):
          throw new Error('Crop Upload is not supposed to be used at the moment');
          //break; //Unreachable due to the 'throw'
      }

      return uploadFunc(form).error(cbOnError);
    }

    private handleUploadError(errData, status, ratioType) {
      var aspectRatioType = controllers.images.ImagePopupBase.ASPECT_RATIO_TYPE;

      if (status == 400) {
        var errorToast = this.stUtils.toastDanger;

        if (errData.key == 'error.image.maximumNumberOfImagesExceeded') {
          errorToast('画像の上限枚数に達しているためアップロードに失敗しました。');
        } else if (errData.key == 'error.image.invalidImageType' || errData.key == 'error.image.imageFileMissing') {
          errorToast('不正なファイル形式です');
        } else if (errData.key == 'error.image.invalidFile') {
          errorToast('不正なファイルです');
        } else if (errData.key == 'error.image.maximumImageSizeExceeded') {
          errorToast('アップロード可能な画像の最大サイズは5MBです');
        } else if (errData.key == 'error.image.imageSizeTooSmall'){

          if(ratioType == aspectRatioType.Inline.code){
            var inlineConf = this.stStaticConfig.images.inline;
            errorToast(`画像の最低サイズは 横${inlineConf.minWidth}px × 縦${inlineConf.minHeight}px です`);
          }
        } else if (errData.key == 'error.image.temporaryImageSizeTooSmall'){

          if(ratioType == aspectRatioType.Cover.code){
            var coverConf = this.stStaticConfig.images.cover;
            errorToast(`画像の最低サイズは 横${coverConf.minWidth}px × 縦${coverConf.minHeight}px です`);
          }
          if(ratioType == aspectRatioType.Logo.code){
            var logoConf = this.stStaticConfig.images.logo;
            errorToast(`画像の最低サイズは 横${logoConf.minWidth}px × 縦${logoConf.minHeight}px です`);
          }
        }
      } else if (status == 413){
        errorToast('アップロード可能な画像の最大サイズは5MBです');
      } else {
        errorToast('画像のアップロードに失敗しました。');
      }
    }
  }
}


/* -----------------------------------
                           DI Register
  ------------------------------------ */

module stanby.routing.imagepopup {
  export function initRouting(){
    angular.module('stanbyControllers')
      .controller('CoverImagePopupCtrl', controllers.images.CoverImagePopup)
      .controller('LogoImagePopupCtrl', controllers.images.LogoImagePopup)
      .controller('InlineImagePopupCtrl', controllers.images.InlineImagePopup)
      .service('stbImage', service.images.ImageService)
      .service('stbImagePopup', service.images.ImagePopupService)
      .service('stbImageUpload', service.images.ImageUploadService);
  }
}
