/// <reference path="../vendor_def/tsd.d.ts" />
/// <reference path="../services/common/routes.ts" />
/// <reference path="../services/common/enums.ts" />
/// <reference path="../services/job-common.ts" />

module controllers.job {
  import res = st.response;

  /**
   * 求人一覧
   */
  export class JobList {
    jobs: res.jobs.JobWithApplicationCount[];
    account: res.account.AccountInfo;
    searchParams: res.jobs.JobSearchParams = {};
    sortDefault: string = 'jobIdAlias';
    private applicationCounts: res.applications.ApplicationCountByJob[];

    constructor(
      public enums: sb.Enums,
      private routes:st.Routes,
      private stbUser:stb.UserService,
      private stUtils: std.Utils,
      private stModal: std.Modal,
      private $state: ng.ui.IStateService,
      private $scope: ng.IScope,
      private $filter: ng.IFilterService
    ){}

    init(): void {
      var mergeToJobs = () => {
        if (this.applicationCounts && this.jobs) {
          this.jobs = _.map(this.jobs, (job: res.jobs.JobWithApplicationCount) => {
            var found = _.find<res.applications.ApplicationCountByJob>(this.applicationCounts, (ac) => {
              return ac.jobId === job.id;
            });

            // NOTE(hikishima): countAllとcountNoActionが空のとき、0を入れるよう変更
            if (found) {
              job.countAll = found.countAll ? found.countAll : 0;
              job.countNoAction = found.countNoAction ? found.countNoAction : 0;
            } else {
              job.countAll = job.countNoAction = 0;
            }

            // NOTE(hikishima): 募集終了日を設定
            job.deadline = this.getApplicableStatus(job.jobStatus, job.closeAt);

            return job;
          });
        }
      };

      this.stbUser.getAccountInfo((data: any) => {
        this.account = data.account;
      });

      this.routes.applications.overviews().success((data:res.applications.ApplicationOverviewsResponse) => {
        this.applicationCounts = data.overviews;
        mergeToJobs();
      });
      //this.fafa = this.routes.jobs.list;
      console.log(this.routes.jobs.list());
      this.routes.jobs.list().success((data: res.jobs.JobListResponse) => {
          this.initJobFilteringWatch();
          this.jobs = data.jobs;
          mergeToJobs();
          //this.feeee = promise;
          //return this.feeee;
      });
    }

    private initJobFilteringWatch(): void{
      this.$scope.$watch(() => {
        return this.searchParams;
      }, (newValue: res.jobs.JobSearchParams) => {
        _.forEach(this.jobs, (job) => {
          job.matchingSearchCond = this.matchJobConditions(job, this.searchParams);
        });
      }, true); // Deep Watch
    }

    private matchJobConditions(job: res.jobs.Job, params: res.jobs.JobSearchParams): boolean {
      if(params.jobStatus && params.jobStatus != job.jobStatus){
        return false;
      }
      if(params.name && !_.contains(job.name, params.name)){
        return false;
      }
      if(params.indexingStatus && params.indexingStatus != job.indexingStatus){
        return false;
      }
      return true;
    }

    getApplicableStatus(status, closeAt): string {
      var now = new Date();
      var close = new Date( closeAt );

      if (status == this.enums.jobStatus.PUB.code) {
        if (closeAt != undefined && close > now) {
          // 掲載終了日は翌日０時だから表示だけ本日に直す。
          close.setDate(close.getDate() - 1);
          return this.$filter('date')(close, 'yyyy/MM/dd', '+0900');
        } else if (close <= now) {
          return this.enums.jobApplicableStatus.CLS.name;
        } else {
          return '無期限';
        }
      } else {
        return this.enums.jobApplicableStatus.OTH.name;
      }
    }

    publish(jobId: string): void {
      this.routes.jobs.applyPublishing(jobId).success(res => {
        this.init();
        this.stUtils.toastInfo("公開されました。反映されるまで数時間かかることがあります。「公開企業プロフィール」の設定もあわせてご確認ください");
      });
    }

    privatize(jobId: string): void {
      this.routes.jobs.withdrawPublishing(jobId).success(res => {
        this.init();
        this.stUtils.toastInfo("公開は取り下げられました。反映されるまで数時間かかることがあります");
      });
    }

    showReason(rejectReason: string, jobId: string): void {
      var rejectReasonText: string = rejectReason.replace(/[\r\n]+/g, '<br/>');
      var modal = this.stModal.modalConfirm({
          title: 'スタンバイ掲載審査否認の理由',
          msg: '<p class="pg-deny-reason-description">スタンバイへの掲載を見合わせることとさせていただきました。下記をご確認の上、求人情報を更新をお願いいたします。</p><dl class="pg-deny-reason-definition"><dt>掲載見合わせ理由:</dt><dd>' + rejectReasonText + '</dd></dl>',
        cancelButton: 'ウィンドウを閉じる',
        okButton: '求人情報を修正して再審査を申請する'
      });

      modal.result.then(() => {
        this.$state.transitionTo('edit', {jobId: jobId});
      });
    }

    getMatchingJobCount(): number {
      return this.jobs ? _.filter(this.jobs, (job) => {
        return job.matchingSearchCond;
      }).length : 0;
    }

    countPublishedJobs(): number {
      return this.jobs ? _.filter(this.jobs, (job) => {
        return job.jobStatus == this.enums.jobStatus.PUB.code;
      }).length : 0;
    }
  }

  /**
   * 求人編集
   */
  export class JobEdit {

    model: common.job.JobEditModel;
    isPreviewingMarkdown: boolean = false;
    flagFocusedMarkdown: boolean = false;
    account: res.account.AccountInfo; // NOTE(omiend): ステータス（募集中）の公開ページリンクに使用
    applicationId: string; // NOTE(omiend): 応募詳細画面から遷移してきた場合に使用

    public publishMenu: boolean = false;


    /**
     * Constructor for JobDetailEditCtrl
     */
    constructor(
      public enums: sb.Enums,
      public jobValidator: common.job.JobValidator,
      public config: ng.IHttpPromiseCallbackArg<st.response.configuration.ConfigResponse>,
      private routes: st.Routes,
      private jobFetchPromise: ng.IHttpPromiseCallbackArg<st.response.jobs.Job>,
      private accountPromise,
      private stbImagePopup: service.images.ImagePopupService,
      private stbImage: service.images.ImageService,
      private jobInitService: common.job.JobInitService,
      private jobSubmitService: common.job.JobSubmitService,
      private stUtils: std.Utils,
      private stModal: std.Modal,
      private $state: any,
      // private $scope: ng.IScope,
      private _: _.LoDashStatic,
      private $stateParams: ng.ui.IStateParamsService,
      private stbUser:stb.UserService,
      private $scope: any,
      private $timeout: ng.ITimeoutService,
      public stStaticConfig: sb.StaticConfig
    ) {
      this.applicationId = $stateParams['applicationId'];
    }

    /**
     * 初期化処理
     */
    init(): void {
      var job = this.jobFetchPromise.data;
      this.account = this.accountPromise.data.account;
      this.config = this.config.data;
      this.model = this.jobInitService.initModelForEdit(job);
      this.stbUser.getAccountInfo((data: any) => {
        this.account = data.account;
      });

    }

    /**
     * 現在のステータスを取得する
     */
    getStatus(status, closeAt):string {

      var now = new Date();
      var close = new Date(closeAt);
      if (status == 'PUB') {
        if (closeAt == null || close > now) {
          return '募集中';
        } else if (close <= now) {
          return '停止中';
        };
      } else {
        return '-';
      };
    }

    /**
     * 掲載終了日、審査関係で翌日の0時になってるから、表示には１日巻き戻す必要あり。
     */
    getCloseDate():Date {
      var close = new Date(this.model.job.closeAt)
      close.setDate(close.getDate() - 1);
      return close;
    }

    /* 求人ID再生し、自動入力する*/
    getJobIdAlias():void {
      this.model.job.jobIdAlias = this.jobValidator.issueJobIdAlias();
    }

    isInvalidCloseDate(): boolean {
      if(this.model.job.noEndDate){
        return false;
      }else{
        return this.isPastDate(this.model.closeAt);
      }
    }

    isPastDate(date):boolean {
      if(date == null){
        return false
      }
      var now = new Date();
      var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return date < today;
    }

    /**
     * カバー画像
     */
    showCoverImagePopup(){
      var initialImage = this.model.job.coverImage;
      this.stbImagePopup.showCoverImagePopup(initialImage, (result) => {
        this.model.job.coverImage = result;
      });
    }

    showCoverInstruction(): void {
      var modal = this.stModal.modalConfirm({
        title: 'カバー画像とは',
        msg: '<p class="sg-modal-instruction sg-job-cover-instruction">「カバー画像」は、公開求人ページで上部に掲載される画像です。<br>オフィスや職場の雰囲気が伝わる画像、仕事内容がイメージしやすい画像を掲載することにより、求職者が求人に興味を持ちやすくなります。<ul class="sg-cover-list"><li>JPEG、PNG、GIFが登録可能な画像ファイルの形式です</li><li>画像ファイルの最大容量は5MB、最小サイズは横幅500px、縦幅200pxです</li></ul>',
        okButton: 'カバー画像を変更する',
        cancelButton: 'ウィンドウを閉じる'
      });
      modal.result.then(() => {
        this.showCoverImagePopup();
      });
    }

    /**
     * インライン画像を挿入する
     * TODO(kitaly): 2.0.x DOMを触ってしまってるし、同じようなコードが散らばってるので directive 等に共通化すべし
     */
    showInlineImagePopup(): void {
      var that = this;
      this.stbImagePopup.showInlineImagePopup((results: any[]) => {

        if(results && results.length > 0) {
          var
            $element = $('#jsi-markdown-freetext'),
            $textArea: any = $element[0],
            beforeText, afterText,
            text = $element.val(),
            position = $textArea.selectionStart;

          var imgListTxt = _.map(results, (res: res.images.InlineImage) => {
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

          that.model.job.content.markdownFreeText = text;
        }
      })
    }

    uploadInlineImageToInsertText($element, params): void {
      var _this = params.this;

      _this.routes.images.uploadInline(params.form)
        .success((res) => {
          var
            beforeText, afterText,
            text = $element.val(),
            imageUrl = _this.stbImage.getFullImageUrl(_this.config, res.id, res.prefix),
            imageText = '![画像](' + imageUrl + ' "画像")\n',
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

          _this.model.job.content.markdownFreeText = text;
        })
        .error((err) => {
          //console.log(err);
        });
    }

    /**
     * 追加項目を削除するボタンの動作
     * JobModel で定義済みのメソッドを呼び出し form を dirty にセット
     */
    deleteTdSet(index): void {
      this.model.deleteTdSet(index);
      this.$scope.termDescForm.$setDirty();
    }

    /**
     * 更新処理
     */
    saveDraft(form) {
      var errList = this.jobSubmitService.validateOnDraftSave(form);
      if(!_.isEmpty(errList)){
        this.stUtils.toastDanger(errList.join('<br/>'));
        return;
      }

      if (this.model.job.noEndDate) { /* if 掲載終了日未設定 */
        this.model.closeAt = null;
        this.model.job.closeAt = null;
      }

      //掲載終了時間を翌日の0時に変更。
      if (this.model.closeAt) {
        var closeDate = new Date(this.model.closeAt.getTime());
        closeDate.setDate(closeDate.getDate() + 1);
        this.model.job.closeAt = closeDate.toISOString();
      }

      // 未記入の追加項目フィールドは除去
      this.jobValidator.trimTermDescItem(this.model.job.content.descriptions);

      var that = this;
      this.jobSubmitService.modalOnAction().then(function() {
        that.jobValidator.sanitize(that.model);

        var clonedJob = _.clone(that.model.job);
        clonedJob.jobStatus = 'RDY';

        that.routes.jobs.update(clonedJob.id, clonedJob)
          .success(function(res){
            that.$state.reload();
            that.model.job.versionNo += 1;
            // 保存後は離脱防止アラートをオフにする
            that.$scope.form.$setPristine();
            that.stUtils.toastInfo('求人情報を更新しました。');
          });
      });
    }

    /**
     * HTMLプレビュー
     */
    previewHTML(): void {
      if (this.model.job.content.markdownFreeText) {
        this.routes.utils.convertMarkdownToHtml(this.model.job.content.markdownFreeText)
          .success((data:res.masters.HtmlText) => {
            this.model.job.htmlFreeText = data.htmlText;
            this.isPreviewingMarkdown = true;
          });
      }
    }

    editMarkdown(): void {
      this.isPreviewingMarkdown = false;
      this.$timeout(function() {
        var $focusEl = $('.sg-form-markdown-textarea[name="markdownFreeText"]');
        if ($focusEl.length === 1) {
          $focusEl.focus();
        }
      });
    }

    focusMarkdown(): void {
      this.flagFocusedMarkdown = true;
    }

    switchToPreview(): void {
      this.$scope.$emit('viewingPreview');
      if (this.model.job.noEndDate) { /* if 掲載終了日未設定 */
        this.model.closeAt = null;
        this.model.job.closeAt = null;
      };

      // 掲載終了時間を翌日の0時に変更。
      if (this.model.closeAt) {
        var closeDate = new Date(this.model.closeAt.getTime());
        closeDate.setDate(closeDate.getDate() + 1);
        this.model.job.closeAt = closeDate.toISOString();
      };

      // 未記入の追加項目フィールドは除去
      this.jobValidator.trimTermDescItem(this.model.job.content.descriptions);

      if (this.model.job.content.markdownFreeText) {
        this.routes.utils.convertMarkdownToHtml(this.model.job.content.markdownFreeText)
          .success((data:res.masters.HtmlText) => {
            this.model.job.htmlFreeText = data.htmlText;
            this.$state.go('edit.preview', {jobId: this.model.job.id});
          });
      } else {
        this.model.job.htmlFreeText = "";
        this.$state.go('edit.preview', {jobId: this.model.job.id});
      }
    }

    cloneJob(): void {
      this.$state.go('add', {copySourceId: this.model.job.id});
    }

    clearSalalyAmount():void {
      if (this.model.job.content.salary.unit==='NEG' || this.model.job.content.salary.unit==='NOP') {
        this.model.job.content.salary.amountFrom = null;
        this.model.job.content.salary.amountTo = null;
      }
    }

    public withdraw() {
      var modal = this.stModal.modalConfirm({
        title: '求人の公開停止',
        msg: '求人を公開停止すると、掲載審査依頼が取り下げられ、求人が公開中の場合は非公開となります。<br>続行してよろしいですか？'
      });
      modal.result.then(() => {
        this.routes.jobs.withdrawPublishing(this.model.job.id).success(res => {
          this.stUtils.toastInfo("求人を取り下げました。");
          this.$state.go('list');
        })
      });
    }

    public confirmPublish() {
      var modal = this.stModal.modalConfirm({
        title: '求人の作成・公開',
        msg:
        '<ul>'
        + '<li>検索エンジン「スタンバイ」への掲載を準備させていただきます。求人は最大3営業日以内に掲載されます。</li>'
        + '<li>また、スタンバイへの掲載とは別に独自の求人ページが作成されます。貴社ウェブサイトの採用ページ等にご利用いただくことが可能です。</li>'
        + '<li>求人ページ上に表示される「会社情報」は、「公開企業プロフィール」ページで編集できます。</li>'
        + '<ul>'
        + '<br>続行してもよろしいですか？'
      });
      modal.result.then(() => {
        // 未記入の追加項目フィールドは除去
        this.jobValidator.trimTermDescItem(this.model.job.content.descriptions);
        this.publishDefault();
      });
    }

    public publishDefault() {
      if ( this.model.job.noEndDate ) { /* if 掲載終了日未設定 */
        this.model.closeAt = null;
        this.model.job.closeAt = null;
      }

      //掲載終了時間を翌日の0時に変更。
      if (this.model.closeAt) {
        var closeDate = new Date(this.model.closeAt.setHours(0,0,0,0));
        closeDate.setDate(closeDate.getDate() + 1);
        this.model.job.closeAt = closeDate.toISOString();
      }

      // 非公開・応相談の場合は amountTo/Fromはなし
      if (this.model.job.content.salary.unit === "NOP" || this.model.job.content.salary.unit === "NEG") {
        delete this.model.job.content.salary.amountTo;
        delete this.model.job.content.salary.amountFrom;
      }

      // 公開 function
      this.model.job.jobStatus = 'PUB';
      var that = this;

      var publish = function(jobId, job) {
        that.routes.jobs.update(jobId, job).success(res => {
          that.$scope.$emit('stGlobalNavShow');
          that.stUtils.toastInfo("公開されました。反映されるまで数時間かかることがあります。「公開企業プロフィール」の設定もあわせてご確認ください");
          that.$state.go('list');
        });
      };

      publish(this.model.job.id, that.model.job);

    }

  }

  /**
   * 求人新規追加
   */
  export class JobAdd {

    model: common.job.JobEditModel;
    isPreviewingMarkdown: boolean = false;
    flagFocusedMarkdown: boolean = false;

    public publishMenu: boolean = false;

    /**
     * Constructor for JobDetailAddCtrl
     */
    constructor(
      public enums: sb.Enums,
      public jobValidator: common.job.JobValidator,
      public config: ng.IHttpPromiseCallbackArg<st.response.configuration.ConfigResponse>,
      private stbImagePopup: service.images.ImagePopupService,
      private routes: st.Routes,
      private $state: any,
      private $scope: any,
      private $location: ng.ILocationService,
      private jobInitService: common.job.JobInitService,
      private jobSubmitService: common.job.JobSubmitService,
      private stUtils: std.Utils,
      private stModal: std.Modal,
      private $timeout: ng.ITimeoutService,
      public stbImage: service.images.ImageService,
      private copySourcePromise: ng.IHttpPromiseCallbackArg<st.response.jobs.Job>,
      public stStaticConfig: sb.StaticConfig
    ){}

    /**
     * 初期化処理
     */
    init(): void {
      this.config = this.config.data;
      this.model = this.jobInitService.initModelForAdd();
      if(this.copySourcePromise && this.copySourcePromise.data){
        this.setUpModelWithCopySource(this.copySourcePromise.data);
      }
      this.model.job.content.markdownFreeText = '';
    }

    /**
     * 求人コピー
     */
    private setUpModelWithCopySource(copySource: st.response.jobs.Job): void {
      this.model.job.content = copySource.content;
      this.model.job.jobType = copySource.jobType;
      this.model.job.name = copySource.name;
      this.model.job.coverImage = copySource.coverImage;
      this.model.job.jobIdAlias = "copy_of_" + this.model.job.jobIdAlias;
    }

    /* 求人ID再生し、自動入力する */
    getJobIdAlias():void {
      this.model.job.jobIdAlias = this.jobValidator.issueJobIdAlias();
    }

    isInvalidCloseDate(): boolean {
      if(this.model.job.noEndDate){
        return false;
      }else{
        return this.isPastDate(this.model.closeAt);
      }
    }

    isPastDate(date):boolean {
      if(date == null){
        return false
      }
      var now = new Date();
      var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return date < today;
    }

    /**
     * カバー画像
     */
    showCoverImagePopup(): void {
      var initialImage = this.model.job.coverImage;
      this.stbImagePopup.showCoverImagePopup(initialImage, (result) => {
        this.model.job.coverImage = result;
      });
    }

    showCoverInstruction(): void {
      var modal = this.stModal.modalConfirm({
        title: 'カバー画像とは',
        msg: '<p class="sg-modal-instruction sg-job-cover-instruction">「カバー画像」は、公開求人ページで上部に掲載される画像です。<br>オフィスや職場の雰囲気が伝わる画像、仕事内容がイメージしやすい画像を掲載することにより、求職者が求人に興味を持ちやすくなります。<ul class="sg-cover-list"><li>JPEG、PNG、GIFが登録可能な画像ファイルの形式です</li><li>画像ファイルの最大容量は5MB、最小サイズは横幅500px、縦幅200pxです</li></ul>',
        okButton: 'カバー画像を変更する',
        cancelButton: 'ウィンドウを閉じる'
      });
      modal.result.then(() => {
        this.showCoverImagePopup();
      });
    }

    /**
     * インライン画像を挿入する
     * TODO(kitaly): 2.0.x DOMを触ってしまってるし、同じようなコードが散らばってるので directive 等に共通化すべし
     */
    showInlineImagePopup(textAreaId: string): void {

      var that = this;

      this.stbImagePopup.showInlineImagePopup((results: res.images.InlineImage[]) => {
        if(results && results.length > 0) {
          var
            $element = $('#jsi-markdown-freetext'),
            $textArea: any = $element[0],
            beforeText, afterText,
            text = $element.val(),
            position = $textArea.selectionStart;

          var imgListTxt = _.map(results, (res: res.images.InlineImage) => {
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

          that.model.job.content.markdownFreeText = text;
        }
      });
    }

    uploadInlineImageToInsertText($element, params): void {
      var _this = params.this;

      _this.routes.images.uploadInline(params.form)
        .success((res) => {
          var
            beforeText, afterText,
            text = $element.val(),
            imageUrl = _this.stbImage.getFullImageUrl(_this.config, res.id, res.prefix),
            imageText = '![画像](' + imageUrl + ' "画像")\n',
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

          _this.model.job.content.markdownFreeText = text;
        })
        .error((err) => {
          //console.log(err);
        });
    }

    /**
     * 追加項目を削除するボタンの動作
     * JobModel で定義済みのメソッドを呼び出し form を dirty にセット
     */
    deleteTdSet(index): void {
      this.model.deleteTdSet(index);
      this.$scope.termDescForm.$setDirty();
    }

    /**
     * 下書き保存クリック時
     */
    saveDraft(form: ng.IFormController) {
      var errList = this.jobSubmitService.validateOnDraftSave(form);
      if(!_.isEmpty(errList)){
        this.stUtils.toastDanger(errList.join('<br/>'));
        return;
      }

      if (this.model.job.noEndDate) { /* if 掲載終了日未設定 */
        this.model.closeAt = null;
        this.model.job.closeAt = null;
      }

      //掲載終了時間を翌日の0時に変更。
      if (this.model.closeAt) {
        var closeDate = new Date(this.model.closeAt.getTime());
        closeDate.setDate(closeDate.getDate() + 1);
        this.model.job.closeAt = closeDate.toISOString();
      }

      // 未記入の追加項目フィールドは除去
      this.jobValidator.trimTermDescItem(this.model.job.content.descriptions);

      var that = this;
      this.jobSubmitService.modalOnAction().then(function() {
        that.jobValidator.sanitize(that.model);

        var clonedJob = _.clone(that.model.job);
        clonedJob.jobStatus = 'RDY';

        that.routes.jobs.create(clonedJob)
          .success(function(res){
            that.stUtils.toastInfo('求人情報を登録しました。');
            that.$state.transitionTo('edit', {jobId: res.jobId});
          });
      });
    }

    /**
     * HTMLプレビュー
     */
    previewHTML(): void {
      if (this.model.job.content.markdownFreeText) {
        this.routes.utils.convertMarkdownToHtml(this.model.job.content.markdownFreeText)
          .success((data:res.masters.HtmlText) => {
            this.model.job.htmlFreeText = data.htmlText;
            this.isPreviewingMarkdown = true;
          });
      }
    }

    editMarkdown(): void {
      this.isPreviewingMarkdown = false;
      this.$timeout(function() {
        var $focusEl = $('.sg-form-markdown-textarea[name="markdownFreeText"]');
        if ($focusEl.length === 1) {
          $focusEl.focus();
        }
      });
    }

    focusMarkdown(): void {
      this.flagFocusedMarkdown = true;
    }

    switchToPreview(): void {
      this.$scope.$emit('viewingPreview');
      if (this.model.job.noEndDate) { /* if 掲載終了日未設定 */
        this.model.closeAt = null;
        this.model.job.closeAt = null;
      };

      //掲載終了時間を翌日の0時に変更。
      if (this.model.closeAt) {
        var closeDate = new Date(this.model.closeAt.getTime());
        closeDate.setDate(closeDate.getDate() + 1);
        this.model.job.closeAt = closeDate.toISOString();
      };

      // 未記入の追加項目フィールドは除去
      this.jobValidator.trimTermDescItem(this.model.job.content.descriptions);

      if (this.model.job.content.markdownFreeText) {
        this.routes.utils.convertMarkdownToHtml(this.model.job.content.markdownFreeText)
          .success((data:res.masters.HtmlText) => {
            this.model.job.htmlFreeText = data.htmlText;
            this.$state.go('add.preview');
          });
      } else {
        this.model.job.htmlFreeText = "";
        this.$state.go('add.preview');
      }
    }

    clearSalalyAmount():void {
      if (this.model.job.content.salary.unit==='NEG' || this.model.job.content.salary.unit==='NOP') {
        this.model.job.content.salary.amountFrom = null;
        this.model.job.content.salary.amountTo = null;
      }
    }

    public confirmPublish() {
      var modal = this.stModal.modalConfirm({
        title: '求人の作成・公開',
        msg:
        '<ul>'
        + '<li>検索エンジン「スタンバイ」への掲載を準備させていただきます。求人は最大3営業日以内に掲載されます。</li>'
        + '<li>また、スタンバイへの掲載とは別に独自の求人ページが作成されます。貴社ウェブサイトの採用ページ等にご利用いただくことが可能です。</li>'
        + '<li>求人ページ上に表示される「会社情報」は、「公開企業プロフィール」ページで編集できます。</li>'
        + '<ul>'
        + '<br/>続行してもよろしいですか？'
      });
      modal.result.then(() => {
        // 未記入の追加項目フィールドは除去
        this.jobValidator.trimTermDescItem(this.model.job.content.descriptions);
        this.publishDefault();
      });
    }

    public publishDefault() {
      if ( this.model.job.noEndDate) { /* if 掲載終了日未設定 */
        this.model.closeAt = null;
        this.model.job.closeAt = null;
      }

      // 掲載終了時間を翌日の0時に変更。
      if ( this.model.closeAt ) {
        var closeDate = new Date(this.model.closeAt.getTime());
        closeDate.setDate(closeDate.getDate() + 1);
        this.model.job.closeAt = closeDate.toISOString();
      };

      // 非公開・応相談の場合は amountTo/Fromはなし
      if (this.model.job.content.salary.unit === "NOP" || this.model.job.content.salary.unit === "NEG") {
        delete this.model.job.content.salary.amountTo;
        delete this.model.job.content.salary.amountFrom;
      }

      // 公開 function
      this.model.job.jobStatus = 'PUB';
      var that = this;
      var ifNew = _.clone(this);

      var publish = function(jobId, job) {
        that.routes.jobs.update(jobId, job).success(res => {
          that.$scope.$emit('stGlobalNavShow');
          that.stUtils.toastInfo("公開されました。反映されるまで数時間かかることがあります。「公開企業プロフィール」の設定もあわせてご確認ください");
          that.$state.go('list');
        });
      };

      // 公開する
      ifNew.routes.jobs.create(ifNew.model.job).success(function(res) {
        // refresh job object
        that.routes.jobs.detail(res.jobId).success(function(newJob) {
          publish(newJob.id, newJob);
        });
      });
    }
  }


  export class JobPreview {

    public isPcMode: boolean = true; // true -> PC, false -> Mobile
    private job: st.response.jobs.Job; // Preview Target
    private jobId: string;
    public publishMenu: boolean = false;

    constructor(
      private jobFetchPromise: any,
      private $scope: ng.IScope,
      private $state: ng.ui.IStateService,
      private $stateParams: ng.ui.IStateParamsService,
      private $http: ng.IHttpService,
      private stModal: std.Modal,
      private stUtils: std.Utils,
      private routes: st.Routes
    ){}

    public init(){
      this.$scope.$emit('stGlobalNavHide'); //NOTE(kitaly): Notifies root scope so global navi is hidden (see stanby-app.ts)
      this.jobId = this.$stateParams['jobId'];
      var parentCtrl = this.$scope.$parent['c'];
      if(parentCtrl && parentCtrl.model && parentCtrl.model.job){
        this.job = parentCtrl.model.job;
      } else if(this.jobFetchPromise) {
        this.job = this.jobFetchPromise.data;
      } else {
        this.$scope.$emit('stGlobalNavShow');
        this.$state.go('add');
      }
    }

    public switchToPcMode() {
      this.isPcMode = true;
    }

    public switchToMobileMode() {
      this.isPcMode = false;
    }

    public backToEdit() {
      this.$scope.$emit('notViewingPreview')
      this.$scope.$emit('stGlobalNavShow');
      // Editからの遷移時はjobIdを保持しているので、jobIdの有無で[Back to Edit]ボタンクリック時の挙動を判定
      if (this.jobId) {
        this.$state.go('edit', {jobId: this.jobId});
      } else {
        this.$state.go('add');
      }
    }

    public confirmPublish() {
      var modal = this.stModal.modalConfirm({
        title: '求人の作成・公開',
        msg:
        '<ul>'
        + '<li>検索エンジン「スタンバイ」への掲載を準備させていただきます。求人は最大3営業日以内に掲載されます。</li>'
        + '<li>また、スタンバイへの掲載とは別に独自の求人ページが作成されます。貴社ウェブサイトの採用ページ等にご利用いただくことが可能です。</li>'
        + '<li>求人ページ上に表示される「会社情報」は、「公開企業プロフィール」ページで編集できます。</li>'
        + '<ul>'
        + '<br>続行してもよろしいですか？'
      });
      modal.result.then(() => {
        this.publishDefault();
      });
    }

    public publishDefault() {
      if (this.job.noEndDate) { /* if 掲載終了日未設定 */
        this.job.closeAt = null;
      }

      //掲載終了時間を翌日の0時に変更。
      if (this.job.closeAt) {
        var closeDate = new Date(this.job.closeAt);
        // closeDate.setDate(closeDate.getDate() + 1);
        this.job.closeAt = closeDate.toISOString();
      };

      // 非公開・応相談の場合は amountTo/Fromはなし
      if (this.job.content.salary.unit === "NOP" || this.job.content.salary.unit === "NEG") {
        delete this.job.content.salary.amountTo;
        delete this.job.content.salary.amountFrom;
      }

      // 公開 function
      this.job.jobStatus = 'PUB';
      var that = this;
      var ifNew = _.clone(this);

      var publish = function(jobId, job) {
        that.routes.jobs.update(jobId, job).success(res => {
          that.$scope.$emit('stGlobalNavShow');
          that.stUtils.toastInfo("公開されました。反映されるまで数時間かかることがあります。「公開企業プロフィール」の設定もあわせてご確認ください");
          that.$state.go('list');
        });
      };

      // 公開する
      if (!ifNew.job.id) { // 新規の場合
        ifNew.routes.jobs.create(ifNew.job)
          .success(function(res) {
            // refresh job object
            that.routes.jobs.detail(res.jobId).success(function(newJob) {
              publish(newJob.id, newJob);
            });
          });
      } else { // 新規じゃない場合
        publish(that.jobId, that.job);
      }
    }

    //NOTE(kitaly): 今だと開く度にリクエストが飛ぶのでキャッシュできるようにする
    public postToPcPreviewApi() {
      // NOTE(CONVOY).数字をstringからintに変換する
      this.job.content.salary.amountTo = Number(String(this.job.content.salary.amountTo));
      this.job.content.salary.amountFrom = Number(String(this.job.content.salary.amountFrom));

      // note(CONVOY) remove coverImg obj if empty.
      if (this.job.coverImage && !this.job.coverImage.imageId) {
        delete this.job.coverImage;
      }
      return this.routes.jobs.previewAsPc(this.job);
    }

    //NOTE(kitaly): 今だと開く度にリクエストが飛ぶのでキャッシュできるようにする
    public postToMobilePreviewApi() {
      return this.routes.jobs.previewAsMobile(this.job);
    }
  }

}


module stanby.directives.jobs {

  var SALARY_UNIT_EXPR = 'ctrl.salaryUnit'; //NOTE(kitaly): stSalaryFormCtrl で $watch してるので気軽に名前変えない
  var SALARY_UNIT_CTRL_EXPR = 'salaryUnit';

  var VALID_KEY_AMOUNT = 'salaryAmount';
  var VALID_KEY_FROM_REQUIRED = 'fromRequired';
  var VALID_KEY_AMOUNT_REVERSE = 'amountReversed';

  var YEN_AMOUNT_REGEX = /^\s*[0-9]+(,[0-9]{3})*\s*$/;
  var MANYEN_AMOUNT_REGEX = /^\s*[0-9]+(,[0-9]{3})*(\.[0-9]+)?\s*$/;


  export class JobSalaryForm {

    public salaryUnit:string;
    public amountFrom:number;
    public amountTo:number;
    public supplement:string;
    private ngModel:ng.INgModelController;

    constructor(public enums:sb.Enums,
                public $element,
                public $scope) {
      this.ngModel = $element.controller('ngModel');
      this.registerModelValueFormatter();
      this.initNgModelSync();
    }

    public isAmountRequired() {
      var unitEnum = this.enums.salaryUnitEnum;
      return !(this.salaryUnit == unitEnum.Negotiable.code || this.salaryUnit == unitEnum.NotOpen.code || this.salaryUnit == null);
    }

    public isManyenUnit() {
      var unitEnum = this.enums.salaryUnitEnum;
      return (this.salaryUnit == unitEnum.Monthly.code || this.salaryUnit == unitEnum.Yearly.code);
    }

    private registerModelValueFormatter() {
      this.ngModel.$formatters.push((obj:st.response.jobs.JobSalary) => {
        if (obj != null) {
          this.$scope.ctrl.salaryUnit = obj.unit;
          this.$scope.ctrl.amountFrom = obj.amountFrom;
          this.$scope.ctrl.amountTo = obj.amountTo;
          this.$scope.ctrl.supplement = obj.supplement;
        } else {
          this.$scope.ctrl.salaryUnit = this.enums.salaryUnitEnum.Monthly.code;
          this.$scope.ctrl.amountFrom = null;
          this.$scope.ctrl.amountTo = null;
          this.$scope.ctrl.supplement = null;
        }
      });
    }

    private initNgModelSync() {
      this.$scope.$watchCollection(() => { //NOTE(kitaly): ただの $watch だと digest loop エラーになる
        return [this.salaryUnit, this.amountFrom, this.amountTo, this.supplement];
      }, (newVal) => {
        this.checkOverallValidity();
        this.syncWithSalaryObjectNgModel();
      });
    }

    private checkOverallValidity() {

      var salaryForm:ng.IFormController = this.$scope.salaryForm;
      var salaryUnitController:ng.INgModelController = salaryForm[SALARY_UNIT_CTRL_EXPR];

      salaryForm.$setValidity(VALID_KEY_FROM_REQUIRED, true, salaryUnitController);
      salaryForm.$setValidity(VALID_KEY_AMOUNT_REVERSE, true, salaryUnitController);

      if (this.isAmountRequired()) {
        if (this.amountFrom == null) {
          salaryForm.$setValidity(VALID_KEY_FROM_REQUIRED, false, salaryUnitController);

        } else if (this.amountTo != null && this.amountFrom > this.amountTo) {
          salaryForm.$setValidity(VALID_KEY_AMOUNT_REVERSE, false, salaryUnitController);
        }
      }
    }

    private syncWithSalaryObjectNgModel() {
      var initFlg = false;
      if (this.ngModel.$viewValue == null) {
        this.ngModel.$viewValue = {};
        initFlg = true;
      }
      var viewValue = this.ngModel.$viewValue;
      viewValue.unit = this.salaryUnit;
      viewValue.amountFrom = this.amountFrom;
      viewValue.amountTo = this.amountTo;
      viewValue.supplement = this.supplement;
      this.ngModel.$setViewValue(viewValue);
      // init(初回ロード)時は form離脱防止アラートをオフにするため pristine に設定
      if (initFlg) {
        this.$scope.$parent.form.$setPristine();
      }
    }
  }

  export function initJobDirectives(){

    angular.module('stanbyDirectives')
      .controller('JobSalaryFormCtrl', directives.jobs.JobSalaryForm)
      .directive('stJobSalaryForm', () => {
        return {
          restrict: 'E',
          replace: true,
          require: 'ngModel',
          scope: true,
          templateUrl: '/internal/parts/jobs/salary-form',
          link: (scope, element, attrs) => {
            // タイミング的な問題なのか、なぜか.prop()でundefinedが返る
            if ($(element).attr('required') == 'required'){
              scope.required = true;
            }
          },
          controller: 'JobSalaryFormCtrl as ctrl'
        }
      })
      .directive('stSalaryAmountInput', ($filter:ng.IFilterService, enums:sb.Enums) => {
        return {
          restrict: 'A',
          require: 'ngModel',
          link: (scope, iElem, iAttr, ngModel:ng.INgModelController) => {
            var unitEnum = enums.salaryUnitEnum;
            var isNoAmountUnit = (unit:string):boolean => {
              return (unit == unitEnum.Negotiable.code || unit == unitEnum.NotOpen.code);
            }
            var isYenAmountUnit = (unit:string):boolean => {
              return (unit == unitEnum.Hourly.code || unit == unitEnum.Daily.code);
            }
            var isManyenAmountUnit = (unit:string):boolean => {
              return (unit == unitEnum.Monthly.code || unit == unitEnum.Yearly.code);
            }

            initUnitWatching(); //給与額の単位が変更された場合、給与額をクリア
            ngModel.$formatters.push(formatModelValue); //数値→UI上文字列
            ngModel.$parsers.push(parseViewValue); //UI上文字列→数値


            /* ===============================
             Sub-Routines Below
             =============================== */

            function initUnitWatching() {
              scope.$watch(SALARY_UNIT_EXPR, (newVal, oldVal) => {

                if (!oldVal) return; // Modelの初期化時点では動かさない

                if (isNoAmountUnit(newVal)
                  || (isYenAmountUnit(newVal) && isManyenAmountUnit(oldVal))
                  || (isManyenAmountUnit(newVal) && isYenAmountUnit(oldVal))
                ) {
                  ngModel.$setViewValue(null);
                  iElem.val(null);
                }
              });
            }

            function formatModelValue(modelValue:number) {
              var unitCode = scope.$eval(SALARY_UNIT_EXPR);

              if (modelValue == null || isNoAmountUnit(unitCode)) {
                return null;
              }

              if (isYenAmountUnit(unitCode)) {
                return $filter('number')(modelValue, 0);
              }

              if (isManyenAmountUnit(unitCode)) {
                return $filter('number')(modelValue / 10000);
              }
            }

            function parseViewValue(viewValue:string) {

              var unitCode = scope.$eval(SALARY_UNIT_EXPR);

              if (viewValue == null || viewValue.trim().length == 0 || isNoAmountUnit(unitCode)) {
                ngModel.$setValidity(VALID_KEY_AMOUNT, true);
                return null;
              }


              var normalizedStr: string;
              var normalized: number;
              if (isYenAmountUnit(unitCode) && viewValue.match(YEN_AMOUNT_REGEX)) {
                normalizedStr = viewValue.trim().replace(/,/g, '');
                normalized = parseInt(normalizedStr);

                if (normalized > 0) {
                  ngModel.$setValidity(VALID_KEY_AMOUNT, true);
                  return normalized;
                }
              }

              if (isManyenAmountUnit(unitCode) && viewValue.match(MANYEN_AMOUNT_REGEX)) {
                normalizedStr = viewValue.trim().replace(',', '');
                normalized = Math.floor(parseFloat(normalizedStr) * 10000);
                if (normalized > 0) {
                  ngModel.$setValidity(VALID_KEY_AMOUNT, true);
                  return normalized;
                }
              }

              ngModel.$setValidity(VALID_KEY_AMOUNT, false);
              return null;
            }

          }
        }
      });
  }
}


module stanby.routing.jobs {

  export function initRouting() {

    angular
      .module('stanbyControllers')
      .controller('JobListCtrl', controllers.job.JobList)
      .controller('JobAddCtrl', controllers.job.JobAdd)
      .controller('JobEditCtrl', controllers.job.JobEdit)
      .controller('JobPreviewCtrl', controllers.job.JobPreview)
      // .controller('PreviewDatePickerCtrl', controllers.job.PreviewDatePicker) // NOTE(baba): PreviewDatePickerが無くなったのでコメントアウト
      .config(($stateProvider, $urlRouterProvider, enums: sb.Enums) => {

        $urlRouterProvider.otherwise('/');

        $stateProvider
          .state('list', {
            url: '/',
            templateUrl: '/internal/controllers/jobs/list',
            controller: 'JobListCtrl as c',
            roles: [enums.userRole.ADM.code, enums.userRole.REC.code],
            onEnter: ($rootScope) => {
              $rootScope.$emit('breadcrumbs', [
                { url: '/', text: 'Stanby Recruiting' },
                { url: '', text: '求人' }
              ]);
            }
          })
          .state('add', {
            url: '/add?copySourceId',
            templateUrl: '/internal/controllers/jobs/add',
            controller: 'JobAddCtrl as c',
            roles: [enums.userRole.ADM.code, enums.userRole.REC.code],
            resolve: {
              jobFetchPromise: function($stateParams: ng.ui.IStateParamsService, routes: st.Routes): ng.IHttpPromise<st.response.jobs.Job> {
                return null;
              },
              copySourcePromise: function($stateParams: ng.ui.IStateParamsService, routes: st.Routes): ng.IHttpPromise<st.response.jobs.Job> {
                var copySourceId = $stateParams['copySourceId'];
                if(copySourceId){
                  return routes.jobs.detail(copySourceId);
                } else {
                  return null;
                }
              },
              config: (stbConfig: stb.ConfigService) => {
                return stbConfig.getConfigPromise();
              }
            },
            onEnter: ($rootScope) => {
              $rootScope.$emit('breadcrumbs', [
                { url: '/', text: 'Stanby Recruiting' },
                { url: '/jobs#/', text: '求人' },
                { url: '', text: '新しい求人を作成' }
              ]);
            }
          })
          .state('edit', {
            url: '/:jobId/edit/:applicationId',
            templateUrl: '/internal/controllers/jobs/edit',
            controller: 'JobEditCtrl as c',
            roles: [enums.userRole.ADM.code, enums.userRole.REC.code],
            resolve: {
              jobFetchPromise: function($stateParams: ng.ui.IStateParamsService, routes: st.Routes): ng.IHttpPromise<st.response.jobs.Job> {
                var jobId = $stateParams['jobId'];
                return routes.jobs.detail(jobId)
                  .success((job: st.response.jobs.Job) => {
                    return job;
                  });
              },
              accountPromise: (routes: st.Routes): ng.IPromise<st.response.account.AccountInfo> => {
                return routes.account.getAccountInfo();
              },
              config: (stbConfig: stb.ConfigService) => {
                return stbConfig.getConfigPromise();
              }
            },
            onEnter: ($rootScope, jobFetchPromise) => {
              var job = jobFetchPromise.data;

              $rootScope.$emit('breadcrumbs', [
                { url: '/', text: 'Stanby Recruiting' },
                { url: '/jobs#/', text: '求人' },
                { url: '', text: job.name }
              ]);
            }
          })
          .state('add.preview', {
            templateUrl: '/internal/controllers/jobs/preview',
            controller: 'JobPreviewCtrl as c',
            roles: [enums.userRole.ADM.code, enums.userRole.REC.code]
          })
          .state('edit.preview', {
            templateUrl: '/internal/controllers/jobs/preview',
            controller: 'JobPreviewCtrl as c',
            roles: [enums.userRole.ADM.code, enums.userRole.REC.code]
          });
      });
  }
}
