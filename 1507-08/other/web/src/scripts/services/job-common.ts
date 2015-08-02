/// <reference path="../vendor_def/tsd.d.ts" />
/// <reference path="./common/routes.ts" />
/// <reference path="../controllers/image-popup-controller.ts" />

module common.job {

  /**
   * 求人編集（create/update) の初期化処理を行う service
   */
  export class JobInitService {

    constructor(
      public enums:any,
      private routes: st.Routes,
      private jobValidator: JobValidator,
      private stUtils: std.Utils) {}

    /**
     * 新規求人登録時用の初期化処理
     * @returns {common.job.JobEditModel}
     */
    initModelForAdd(): JobEditModel {
      var model = new JobEditModel(this.routes);
      model.job = this.createJobBarebone();
      model.job.jobIdAlias = this.jobValidator.issueJobIdAlias();
      model.addLocation();
      return model;
    }

    private createJobBarebone():st.response.jobs.Job {
      return {
        id: null,
        openedAt: null,
        closeAt: null,
        jobIdAlias: null,
        noEndDate: true,
        name: null,
        versionNo: null,
        jobType: null,
        updatedBy: null,
        updatedAt: null,
        content: this.createJobDetailBarebone(),
        coverImage: {
          imageId: null,
          prefix: null
        }
      }
    }

    private createJobDetailBarebone(): st.response.jobs.JobDetails {
      return {
        jobAdTitle: null,
        salary: {unit: null, amountFrom: null, amountTo: null, supplement: null},
        locations: [],
        locationSupplement: null,
        descriptions: [],
        markdownFreeText: null
      };
    }

    /**
     * 求人更新用の初期化処理
     * @param data
     * @returns {common.job.JobEditModel}
     */
    initModelForEdit(data:st.response.jobs.Job):common.job.JobEditModel {
      var model = new JobEditModel(this.routes);
      model.job = data;
      if (model.job.closeAt) {
        model.closeAt = new Date(model.job.closeAt);
        model.closeAt.setDate(model.closeAt.getDate() - 1);
        model.job.noEndDate = false;
      }else{
        model.job.noEndDate = true;
      }
      return model;
    }

  }

  /**
   * 求人編集用(create/update)の サニタイズ・バリデーション処理を行う service
   */
  export class JobValidator {

    constructor(
      private routes: st.Routes) {}

    /*
     * Called from Controller
     */
    sanitize(model:JobEditModel):void {
      // JobIDAliasの指定が無ければ、勝手にタイムスタンプをIDにする
      if(!model.job.jobIdAlias){
        model.job.jobIdAlias = this.issueJobIdAlias();
      }
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

    /*
     *「追加項目」欄で term と description、両フィールドとも
     * 未記入のままになっている追加項目については削除する
     */
    trimTermDescItem(termDescItems:any):void {
      var descItem: any;
      for (var i = 0; i < termDescItems.length; ++i) {
        descItem = termDescItems[i];
        if (!descItem.term && !descItem.description) {
          termDescItems.splice(i, 1);
          i -= 1;
        }
      }
    }

    validZipcode( zipcode:string ):boolean {
      // 日本のみ
      return zipcode ? !!zipcode.match(/^\d{3}-?\d{4}$/) : false;
      // 海外にも対応版
      //return zipcode ? !!zipcode.match(/^(\d|\-){0,10}$/) : false;
    }

    issueJobIdAlias():string {
      if ( !Date.prototype.toISOString ) { //NOTE(kitaly): IE compatibility
        (function() {
          function pad(number) {
            var r = String(number);
            if ( r.length === 1 ) {
              r = '0' + r;
            }
            return r;
          }
          Date.prototype.toISOString = function() {
            return this.getUTCFullYear()
              + '-' + pad( this.getUTCMonth() + 1 )
              + '-' + pad( this.getUTCDate() )
              + 'T' + pad( this.getUTCHours() )
              + ':' + pad( this.getUTCMinutes() )
              + ':' + pad( this.getUTCSeconds() )
              + '.' + String( (this.getUTCMilliseconds()/1000).toFixed(3) ).slice( 2, 5 )
              + 'Z';
          };
        }() );
      }

      var tm = new Date;
      var iso = tm.toISOString(); // e.g. "2014-11-28T04:50:05.800Z"
      return iso.replace(/(\d\d)(\d\d)-(\d+)-(\d+)T(\d+):(\d+):(\d+)\..+/, '$2$3$4-$5$6$7') // e.g. "141128-045005"
    }

    validateJobIdAlias(aliasModelCtrl: ng.INgModelController, jobId: string): void {
      var VALIDITY_KEY = 'aliasDuplidate';
      var input = aliasModelCtrl.$viewValue;

      if(!input) {
        aliasModelCtrl.$setValidity(VALIDITY_KEY, true);
        return;
      }

      // 重複エラー以外のエラーが存在する場合は、重複エラーをリセットして終了する
      if(aliasModelCtrl.$invalid){
        var hasOtherError:boolean = false;
        _.forIn(aliasModelCtrl.$error, function(val, key) {
          if(key != VALIDITY_KEY && val) {hasOtherError = true};
        });
        if(hasOtherError){
          aliasModelCtrl.$setValidity(VALIDITY_KEY, true);
          return;
        }
      }

      // サーバ問い合わせて重複IDチェック
      var postData = {jobId: jobId, jobIdAlias: input};
      this.routes.jobs.validateAlias(postData)
        .success(function(data: any){
          aliasModelCtrl.$setValidity(VALIDITY_KEY, true);
        })
        .error(function(xhr, status){
           if(status == 400){
            aliasModelCtrl.$setValidity(VALIDITY_KEY, false);
           }
        });
    }
  }

  /**
   * 求人編集中の求人データ／状態を保持するモデルクラス
   */
  export class JobEditModel{
    static NO_SALARY_AMOUNT_LIST: Array<string> = ["NEG", "NOP"];

    job: st.response.jobs.Job;
    noEndDate: boolean = true;
    closeAt: Date = new Date();

    constructor(
      private routes: st.Routes
    ){}

    addLocation(): void {
      this.job.content.locations.push({postalCode: null, address: null});
    }
    addTdSet(): void {
      this.job.content.descriptions.push({term: null, description: null});
    }
    deleteLocation(index): void {
      this.job.content.locations.splice(index, 1);
    }
    deleteTdSet(index): void {
      this.job.content.descriptions.splice(index, 1);
    }

    getAddress(indexTarget): void {
      var code = this.job.content.locations[indexTarget].postalCode;

      this.routes.masters.address(code).success((data:any) => {
        this.job.content.locations[indexTarget].address = data.address;
      });
    }

    isSalaryAmountInputRequired(): boolean {
      return _.contains(JobEditModel.NO_SALARY_AMOUNT_LIST, this.job.content.salary.unit);
    }
  }

  /**
   * 求人更新ボタン押下時の処理
   */
  export class JobSubmitService {

    constructor(
      private stModal: std.Modal,
      private jobValidator: common.job.JobValidator
    ){}

    validateOnDraftSave(form): Array<string>{
      var errArray: string[] = [];
      if(form.jobIdAlias.$error['aliasDuplidate']) errArray.push("他の求人で使用している求人IDが入力されています");
      if(form.jobName.$error['required']) errArray.push("募集職種名を入力してください");
      if(form.jobTypeRadio.$error['required']) errArray.push("雇用形態を選択してください");
      return errArray;
    }

    modalOnAction(title: string = '変更を保存します。よろしいですか？') {
      return this.stModal.modalConfirm({
        msg: title
      }).result;
    }
  }
}

module stanby.routing.jobcommon {
  export function initRouting(){

    /*
     * サービスコンポーネントのDI登録
     */
    angular.module('stanbyControllers')
      .service('jobValidator', common.job.JobValidator)
      .service('jobInitService', common.job.JobInitService)
      .service('jobSubmitService', common.job.JobSubmitService)
      .directive('stJobForm', function(){
        return {
          restrict: 'E',
          replace: true,
          templateUrl: '/internal/parts/jobs/edit-form'
        }
      });
  }
}
