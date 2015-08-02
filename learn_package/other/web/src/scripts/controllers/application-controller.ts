/// <reference path="../vendor_def/tsd.d.ts" />
/// <reference path="../services/common/routes.ts" />
/// <reference path="../services/common/enums.ts" />
/// <reference path="../directives/common/widgets.d.ts" />
/// <reference path="../controllers/pagination-controller.ts" />

/**
 * 応募関連画面のコントローラ
 */
module controllers.application {
  import res = st.response
  import ApplicationInfo = res.applications.ApplicationInfo
  import QueryResultResponse = res.wrapper.QueryResultResponse
  import bs = ng.ui.bootstrap;

  /**
   * 画面間でのパラメータ
   */
  export interface ApplicationParams extends ng.ui.IStateParamsService {
    applicationId: string;
  }

  /**
   * タイムライン上のアイテム(面接設定等)を収めるWrapper
   */
  export interface TimelineItem {
    timelineType: string;
    content: any;
  }

  export interface TimelineUpdateEventProps {
    item: TimelineItem;
  }

  export interface TimelineEventHandler {
    (event: ng.IAngularEvent, timelineItem: TimelineUpdateEventProps, errData: any): void
  }

  export class ApplicationEventsService {

    constructor(
      private $rootScope: ng.IRootScopeService
    ){}

    //NOTE(kitaly): このへんは scope わざわざ渡してもらわずに、このService側で $rootScope を injectすれば良かった
    private doNotify(eventName: string): Function {
      return ($scope: ng.IScope, props: TimelineUpdateEventProps, errData: any) => {
        $scope.$broadcast(eventName, props, errData);
      }
    }

    private doListen(eventName: string): Function {
      return ($scope: ng.IScope, handler: TimelineEventHandler, errData: any) => {
        $scope.$on(eventName, (event, props, errData) => {
          handler(event, props, errData);
        });
      }
    }

    /* =============================================
     * タイムライン項目追加系
     * 各種パーツ
     * -> ApplicationTimelineCtrl (タイムライン更新)
     * -> ApplicationDetailCtrl (versionNo++)
     * ============================================= */
    private ADD_TIMELINE_START = 'stTimelineAddRequestStart';
    notifyAddTimelineStart = this.doNotify(this.ADD_TIMELINE_START);
    listenAddTimelineStart = this.doListen(this.ADD_TIMELINE_START);

    private ADD_TIME_SUCCESS = 'stTimelineAddRequestSuccess';
    notifyAddTimelineSuccess = this.doNotify(this.ADD_TIME_SUCCESS);
    listenAddTimelineSuccess = this.doListen(this.ADD_TIME_SUCCESS);

    private ADD_TIMELINE_FAILURE = 'stTimelineAddRequestFailure';
    notifyAddTimelineFailure = this.doNotify(this.ADD_TIMELINE_FAILURE);
    listenAddTimelineFailure = this.doListen(this.ADD_TIMELINE_FAILURE);

    /* =============================================
     * タイムライン項目更新系
     * 各種パーツ
     * -> ApplicationTimelineCtrl (タイムライン更新)
     * -> ApplicationDetailCtrl (versionNo++)
     * ============================================= */
    private UPD_TIMELINE_START = 'stTimelineUpdateRequestStart';
    notifyUpdTimelineStart = this.doNotify(this.UPD_TIMELINE_START);
    listenUpdTimelineStart = this.doListen(this.UPD_TIMELINE_START);

    private UPD_TIMELINE_SUCCESS = 'stTimelineUpdateRequestSuccess';
    notifyUpdTimelineSuccess = this.doNotify(this.UPD_TIMELINE_SUCCESS);
    listenUpdTimelineSuccess = this.doListen(this.UPD_TIMELINE_SUCCESS);

    private UPD_TIMELINE_FAILURE = 'stTimelineUpdateRequestFailure';
    notifyUpdTimelineFailure = this.doNotify(this.UPD_TIMELINE_FAILURE);
    listenUpdTimelineFailure = this.doListen(this.UPD_TIMELINE_FAILURE);

    /* =============================================
     * 応募モデルの更新は ApplicationDetailCtrl に集約
     * ApplicationTimelineCtrl: タイムラインの変更を通知
     * ApplicationDetailNavCtrl: 添付ファイルの追加を通知
     * ============================================= */
    private TIMELINE_CHANGED = 'stTimelineChanged';
    notifyTimelineChanged = ($scope: ng.IScope, timeline: Array<TimelineItem>): void => {
      $scope.$broadcast(this.TIMELINE_CHANGED, timeline);
    }
    listenTimelineChanged = ($scope: ng.IScope, handler: Function): void => {
      $scope.$on(this.TIMELINE_CHANGED, (evt, timeline) => {
        handler(evt, timeline);
      });
    }

    private ATTACHMENT_ADDED = 'stApplcationAttachmentAdded'
    notifyAttachmentAdded = (attachment: res.applications.AttachmentInfo): void => {
      this.$rootScope.$broadcast(this.ATTACHMENT_ADDED, attachment);
    }
    listenAttachmentAdded = ($scope: ng.IScope, handler: Function): void => {
      $scope.$on(this.ATTACHMENT_ADDED, (evt, timeline) => {
        handler(evt, timeline);
      });
    }
  }

  import ApplicationSearchParams = res.applications.ApplicationSearchParams;
  /**
   * 応募状況一覧 画面
   */
  export class ApplicationList extends controllers.base.PaginationControllerBase<ApplicationInfo, ApplicationSearchParams> {

    keyword: string;
    jobId: string;
    statuses: string;
    selectionStageOptions: any;
    applications: res.applications.ApplicationInfo[];

    constructor(
      private routes: st.Routes,
      protected $state: ng.ui.IStateService,
      private stApplicationDetailNavService: service.interview.ApplicationDetailNavService,
      public enums: sb.Enums,
      $scope
    ) {
      super($state, $scope);
      this.selectionStageOptions = null;
      this.selectionStageOptions = _.cloneDeep(this.enums.selectionStageOptions);
      this.selectionStageOptions.unshift({code: "", name: "指定なし", sortNo : -1});
    }

    protected transitionToSelfState(params: ApplicationSearchParams) {
      this.$state.go('list', params);
    }
    protected getDefaultSearchConditions(): ApplicationSearchParams {
      return {limit: this.defaultPageSize};
    }

    protected setFromNormalizedParams(params: ApplicationSearchParams): void {
      this.keyword = params.keyword;
      if (params.statuses) {
        this.statuses = params.statuses;
      } else {
        this.statuses = "";
      }
      this.jobId = params.jobId;
    }
    protected getNewConditions(): ApplicationSearchParams {
      return {keyword: this.keyword, statuses: this.statuses, jobId: this.jobId};
    }

    searchWithSelectionStage(newStage: string): void {
      this.statuses = newStage;
      this.search();
    }

    protected doSearch(params: ApplicationSearchParams): ng.IHttpPromise<QueryResultResponse<ApplicationInfo>> {
      return this.routes.applications.list(params);
    }
    protected setFromQueryResult(res: QueryResultResponse<ApplicationInfo>): void {
      this.applications = res.hits;
    }

    moveToDetail(id: string, index: number): void {
      this.stApplicationDetailNavService.intoDetailFromApplications(this.params, this.applications, index, this.totalHits);
      this.$state.transitionTo('details', {
        applicationId: id
      });
    }
  }

  /**
   * 画面の特定のパーツには関与せず、大元の応募モデルの操作を唯一行うべきコントローラ
   * 各パーツ上の操作がイベントとして発火されるので、それをキャッチしてモデルの更新を行うのが基本方針
   */
  export class ApplicationDetail {
    application: st.response.applications.ApplicationInfo;
    timeline: Array<TimelineItem>;

    constructor(
      private applicationPromise: st.response.applications.ApplicationInfo,
      private $scope: any,
      private enums: sb.Enums,
      private applicationEventsService: ApplicationEventsService,
      private stUtils: std.Utils,
      private $timeout: ng.ITimeoutService,
      private accountInfoPromise: res.account.AccountInfo
    ) {}

    init(): void {
      this.application = this.applicationPromise;
      this.listenTimelineChangedEvents();
      this.listenSuccessEvents();
      this.listenFailureEvents();
    }

    public hasRecruiterRole(): boolean {
      var found = _.find(this.accountInfoPromise.roles, (role) => {
        return this.enums.userRole.REC.code == role;
      });
      return found != null;
    }

    private listenTimelineChangedEvents(): void {
      var typEnum = this.enums.timelineType;

      this.applicationEventsService.listenTimelineChanged(this.$scope, (evt, timeline: Array<TimelineItem>) => {

        var notes: Array<res.applications.ApplicationNote> = _.filter(timeline, (item: TimelineItem) => {
            return item.timelineType == typEnum.note;
          }).map((item: TimelineItem) => {
            return item.content;
          });

        var interviews: Array<res.interview.Interview> = _.filter(timeline, (item: TimelineItem) => {
            return item.timelineType == typEnum.interview;
          }).map((item: TimelineItem) => {
            return item.content;
          });

        var docScreenings: Array<res.interview.Interview> = _.filter(timeline, (item: TimelineItem) => {
            return item.timelineType == typEnum.docscreening;
          }).map((item: TimelineItem) => {
            return item.content;
          });

        var selectionHistory: Array<res.applications.ApplicationStatus> = _.filter(timeline, (item: TimelineItem) => {
            return item.timelineType == typEnum.stage;
          }).map((item: TimelineItem) => {
            return item.content;
          });

        this.applicationPromise.notes = notes;
        this.applicationPromise.interviews = _.union(interviews, docScreenings); //NOTE(kitaly): 順序性は担保できていない
        this.applicationPromise.selectionHistory = selectionHistory;

        //NOTE(kitaly): feedbacks については ApplicationTimelineCtrl 内で interviews 側に同期が取られている前提
        //var feedbacks: Array<res.interview.InterviewFeedback> = _.filter(timeline, (item: TimelineItem) => {
      });
    }

    private listenSuccessEvents() {
      this.applicationEventsService.listenAddTimelineSuccess(this.$scope, (evt, props) => {
        var content = props.item.content;
        var typEnum = this.enums.timelineType;
        var typ = props.item.timelineType;

        if(typ == typEnum.stage){
          this.applicationPromise.selectionStage = content.selectionStage;
          this.incrementVersionNo();
        } else if (typ == typEnum.note) {
          this.incrementVersionNo();
        }

      });

      this.applicationEventsService.listenUpdTimelineSuccess(this.$scope, (evt, props: TimelineUpdateEventProps) => {
        var typEnum = this.enums.timelineType;
        var typ = props.item.timelineType;

        if (typ == typEnum.note) {
          this.incrementVersionNo();
        }
      });

      this.applicationEventsService.listenAttachmentAdded(this.$scope, (evt, attached: res.applications.AttachmentInfo) => {
        var attachments = this.applicationPromise.attachments;
        this.applicationPromise.attachments = attachments ? attachments : [];

        this.$timeout(() => { //NOTE(kitaly): 即反映すると、PDFViewerから叩くDownloadAPIが400を吐くので少し遅らせる
          this.applicationPromise.attachments.push(attached);
        }, 2000);


        this.incrementVersionNo();
      });
    }

    private incrementVersionNo() {
      this.applicationPromise.versionNo += 1;
    }

    private listenFailureEvents() {
      this.applicationEventsService.listenAddTimelineFailure(this.$scope, (evt, props, errData) => {　
        this.toastFailureMessage(errData);
      });
      this.applicationEventsService.listenUpdTimelineFailure(this.$scope, (evt, props, errData) => {

        this.toastFailureMessage(errData);
      });
    }

    private toastFailureMessage(errData) {
      var genericError = 'エラーが発生しました。画面を更新してください。';

      // check for application controller specific errors
      if (errData) {
        if (errData.key == 'error.interview.interviewTimeIsInvalid') {
          this.stUtils.toastDanger('面接日時を正しく入力してください');
        }
        else if (errData.key === "error.data.basicValidation") {
          this.stUtils.toastDanger("フォームを正しく入力してください。");
        }
        else {
          this.stUtils.toastDanger(genericError);
        }
      }
      else {
        this.stUtils.toastDanger(genericError);
      }
    }

  }

  export class ApplicationDetailNav {

    constructor(
      public enums: sb.Enums,
      private $stateParams: ApplicationParams,
      private routes: st.Routes,
      private $scope: ng.IScope,
      private applicationEventsService: ApplicationEventsService,
      private applicationPromise: ApplicationInfo,
      private accountInfoPromise: res.account.AccountInfo,
      private stModal: std.Modal,
      private stUtils: std.Utils,
      private stApplicationDetailNavService: service.interview.ApplicationDetailNavService
  ){}

    /* =======================================================================
       Authority Control
       ======================================================================= */
    public hasRecruiterRole(): boolean {
      var found = _.find(this.accountInfoPromise.roles, (role) => {
        return this.enums.userRole.REC.code == role;
      })
      return found != null;
    }

    public isEditableResume(): boolean {
      var isManual = this.applicationPromise.applicationSource == this.enums.applicationSource.MNL.code;
      return this.hasRecruiterRole() && isManual;
    }
    /* END Authority Control */

    /* =======================================================================
       Search Results Handling (Active only when transitioned from list stage)
       ======================================================================= */
    public isSearchResultsActive()          : boolean { return this.stApplicationDetailNavService.isActive(); }

    public activeListName()    : string {return this.stApplicationDetailNavService.activeListName(); }
    public conditionsText()    : string {return this.stApplicationDetailNavService.conditionsText(); }

    public existsNextItem()    : boolean { return this.stApplicationDetailNavService.existsNextItem(); }
    public existsPrevItem()    : boolean { return this.stApplicationDetailNavService.existsPrevItem(); }

    public currentItemNumber() : number { return this.stApplicationDetailNavService.currentItemNumber(); }
    public totalHits()         : number { return this.stApplicationDetailNavService.totalHitsNumber(); }

    public transitionToNextItem(): void { this.stApplicationDetailNavService.transitionToNextItem(); }
    public transitionToPrevItem(): void { this.stApplicationDetailNavService.transitionToPrevItem(); }
    public backToList()          : void { this.stApplicationDetailNavService.backToList(); }
    /* END Search Results Handling */


    /* =======================================================================
       Status Update Handling
       ======================================================================= */
    /**
     * 応募者の選考ステージを変更する
     */
    public updateStatus(newStage: string, isDiffValue: boolean): void {

      var evtProps = {
        item: {
          timelineType: this.enums.timelineType.stage,
          content:{
            selectionStage: newStage
          }
        }
      };

      this.applicationEventsService.notifyAddTimelineStart(this.$scope.$root, evtProps);

      if(isDiffValue) {
        this.routes.applications.updateStatus(this.applicationPromise.id, newStage, this.applicationPromise.versionNo)
          .success(() => {
            this.applicationEventsService.notifyAddTimelineSuccess(this.$scope.$root, evtProps);
          }).error(() => {
            this.applicationEventsService.notifyAddTimelineFailure(this.$scope.$root, evtProps);
          });
      }
    }
    /* END Status Update Handling */


    /* =====================================
       File Attachment Handling
       ===================================== */
    public turnOnFileAttachmentModal(): void {
      var settings: bs.IModalSettings = {
        templateUrl: '/internal/parts/applications/file-upload-modal',
        controller: FileAttachment
      };

      this.stModal.modalCustom(settings)
        .result.then((file) => {
          if(file) {
            this.uploadAttachment(file).success((uploaded) => {
              this.applicationEventsService.notifyAttachmentAdded(uploaded);
            })
          }
        });
    }

    private uploadAttachment(file: File): ng.IHttpPromise<res.applications.AttachmentInfo> {

      var successToast = (res: res.applications.AttachmentInfo) => {
        var name = res.fileName;
        if(name.length > 30){
          name = name.substring(0, 30) + ' …';
        }
        this.stUtils.toastInfo(`登録されました: ${name}`);
      }

      var form = new FormData();
      form.append('attachment', file);

      return this.routes.applications.attachFile(this.$stateParams.applicationId, form)
        .success((res: res.applications.AttachmentInfo) => {
          successToast(res);
        });
    }
    /* END File Attachment Handling */

  }

  export class ApplicationSummary {
    public email: string;
    public phone: string;

    constructor(
      public enums: sb.Enums,
      private applicationPromise: st.response.applications.ApplicationInfo,
      private accountInfoPromise: st.response.account.AccountInfo,
      private routes: st.Routes
    ){
    }

    public hasRecruiterRole(): boolean {
      var found = _.find(this.accountInfoPromise.roles, (role) => {
        return this.enums.userRole.REC.code == role;
      });
      return found != null;
    }


    public fetchEmail(): void {
      this.routes.applications.fetchEmail(this.applicationPromise.id).success((data: any) => {
        if (data.email) {
          this.email = data.email;
        } else {
          this.email = "メールアドレスが登録されていません";
        }
      })
    }

    public fetchPhone(): void {
      this.routes.applications.fetchPhone(this.applicationPromise.id).success((data: any) => {
        if (data.phone) {
          this.phone = data.phone;
        } else {
          this.phone = "電話番号が登録されていません";
        }
      })
    }
  }

  export class ApplicationAction {

    public latestItemCreatedAt: Date;
    public nowDate: Date;

    constructor(
      private $scope,
      private applicationPromise: res.applications.ApplicationInfo,
      private applicationEventsService: ApplicationEventsService,
      private accountInfoPromise: res.account.AccountInfo,
      private enums: sb.Enums,
      private $interval: ng.IIntervalService
    ){
    }

    public init(): void {
      this.listenTimelineChanged();
      this.startPollingNowDate();
    }

    private startPollingNowDate() {
      this.nowDate = new Date();
      // 1分毎に nowDate を更新
      this.$interval(() => {
        this.nowDate = new Date();
      }, 1000 * 60);
    }

    private listenTimelineChanged() {
      this.applicationEventsService.listenTimelineChanged(this.$scope, (evt, timeline:Array<TimelineItem>) => {
        if (timeline) {
          var latestItem = timeline[0];
          if (latestItem.timelineType == this.enums.timelineType.message) { //NOTE(kitaly): メッセージの場合、createdAtを保持しない
            this.latestItemCreatedAt = new Date(this.applicationPromise.createdAt);
          } else {
            this.latestItemCreatedAt = latestItem.content.createdAt;
          }
        }
      });
    }

    /**
     * 採用担当者のみ利用可能な機能の表示・非表示制御のため
     */
    public hasRecruiterRole(): boolean {
      var found = _.find(this.accountInfoPromise.roles, (role) => {
        return this.enums.userRole.REC.code == role;
      });
      return found != null;
    }
  }

  export class ApplicationTimeline {
    timeline: Array<TimelineItem>

    constructor(
        private $scope: ng.IScope,
        private applicationEventsService: ApplicationEventsService,
        private applicationPromise: ApplicationInfo,
        private accountInfoPromise: res.account.AccountInfo,
        private enums: sb.Enums
    ){}

    public init(): void {
      this.timeline = this.listTimelineItems(this.applicationPromise);
      this.timeline = this.markingTimelineItems(this.timeline);
      this.applicationEventsService.notifyTimelineChanged(this.$scope.$root, this.timeline); //NOTE(kitaly): 手始めに初期値を notify しておく
      this.watchTimeline();
      this.listenItemManipulations();
    }


    /* ========================================
       Authority Control
       ======================================== */
    public hasRecruiterRole(): boolean {
      var found = _.find(this.accountInfoPromise.roles, (role) => {
        return this.enums.userRole.REC.code == role;
      });
      return found != null;
    }

    // 採用担当者もしくは担当面接官のみ評価の追加が可能、また既に評価済の場合も無効
    public isEvaluatableInterview(interview: res.interview.Interview): boolean {
      var interviewerId = interview.interviewer ? interview.interviewer.userId : null;
      var myUserId = this.accountInfoPromise.userId;
      var existsFeedback = interview.feedbacks && (interview.feedbacks.length > 0);

      return ((myUserId == interviewerId) || this.hasRecruiterRole()) && !existsFeedback;
    }

    public isUpdatableNote(note: res.applications.ApplicationNote): boolean {
      var noteOwnerId = note.userId;
      var myId = this.accountInfoPromise.userId;
      return noteOwnerId == myId;
    }
    /* END Authority Control */

    private markingTimelineItems(timelineItems): any {
      var
        isMarkedPrimary = false,
        isMarkedSecondary = false;

      for (var i = 0; i < timelineItems.length; i++) {
        if (!timelineItems[i].content) {
          continue;
        }

        if (!timelineItems[i].content.updatedBy) {
          continue;
        }

        if (!isMarkedPrimary) {
          if (timelineItems[i].content.updatedBy.userId === this.accountInfoPromise.userId) {
            timelineItems[i].mark = 'primary';
            isMarkedPrimary = true;
          }
        }

        if (!isMarkedSecondary) {
          if (timelineItems[i].content.updatedBy.userId !== this.accountInfoPromise.userId) {
            timelineItems[i].mark = 'secondary';
            isMarkedSecondary = true;
          }
        }

        if (isMarkedPrimary && isMarkedSecondary) {
          break;
        }
      }

      return  timelineItems;
    }

    /**
     * 大元の応募からTimeline表示用のモデルを導出する
     * NOTE(kitaly): Timelineモデルは元のモデルと同期しないため、独自に同期処理をする必要がある
     */
    private listTimelineItems(app: res.applications.ApplicationInfo): any {
      //NOTE(kitaly): 後々 親の interviewId が特定できないと辛いことになる
      _.forEach(app.interviews, (interview) => {
        _.map(interview.feedbacks, (fb: res.interview.InterviewFeedback) => {
          fb.interviewType = interview.interviewType;
          fb.interviewTitle = interview.title;
          fb.interviewId = interview.id;
          return fb;
        });
      });

      return _.sortBy<TimelineItem, number>(
          _.union(
              _.map<res.applications.ApplicationNote, TimelineItem>(app.notes, (i) => { return {timelineType: this.enums.timelineType.note, content: i}}),
              _.map<res.interview.Interview, TimelineItem>(app.interviews, (i: res.interview.Interview) => {
                if (i.interviewType === this.enums.interviewType.INT.code) {
                  return {timelineType: this.enums.timelineType.interview, content: i}
                } else {
                  return {timelineType: this.enums.timelineType.docscreening, content: i}
                }
              }),
              _.map<res.applications.ApplicationStatus, TimelineItem>(app.selectionHistory, (i) => { return {timelineType: this.enums.timelineType.stage, content: i}}),
              _.map(_.flatten(_.compact(_.pluck(app.interviews, 'feedbacks'))), (i) => { return {timelineType: this.enums.timelineType.feedback, content: i}}),
              [{timelineType: this.enums.timelineType.message, content:app.message}]
          ),
          (i) => {
            if (!i.content) {
              return;
            }

            return Date.parse(i.content.createdAt) * -1;
          });
    }


    /* ========================================
       Timeline Item Handling
       ======================================== */
    private listenItemManipulations(): void {

      this.applicationEventsService.listenUpdTimelineSuccess(this.$scope, (evt, props) => {

        this.checkForInterviewVersionNoIncrement(props.item);

        angular.forEach(this.timeline, (item) => {
          if(this.compareFakeItemAndExistingItem(props.item, item)){
            var supplemented = this.supplementFakeInfo(props.item);
            item.content = _.cloneDeep(supplemented.content);
          }
        });
      });

      this.applicationEventsService.listenAddTimelineSuccess(this.$scope, (evt, props) => {
        this.checkForInterviewVersionNoIncrement(props.item);
        var supplemented = this.supplementFakeInfo(props.item);
        var supplementedMore = this.supplementFakeAddInfo(supplemented);
        this.timeline.unshift(supplementedMore);
      });
    }

    private checkForInterviewVersionNoIncrement(updated: TimelineItem): void {
      if(updated.timelineType == this.enums.timelineType.feedback){

        angular.forEach(this.timeline, (existing: TimelineItem) => {
          if(existing.timelineType == this.enums.timelineType.interview
          || existing.timelineType == this.enums.timelineType.docscreening){

            if(existing.content.id == updated.content.interviewId){
              existing.content.versionNo++;
            }
          }
        });
      }
    }

    private compareFakeItemAndExistingItem(fake: TimelineItem, existing: TimelineItem): boolean {
      var typ = this.enums.timelineType;
      var existingContent = existing.content;

      if(existingContent != null && fake.timelineType == existing.timelineType){ //NOTE(kialy): 手動追加の場合 message の項目が content:null

        if(fake.timelineType == typ.note){
          return fake.content.noteId == existingContent.noteId;

        } else if(fake.timelineType == typ.interview) {
          return fake.content.id == existingContent.id;

        } else if (fake.timelineType == typ.docscreening) {
          return fake.content.id = existingContent.id;

        } else if (fake.timelineType == typ.feedback){
          return fake.content.feedbackId == existingContent.feedbackId;
        }
      }
      return false;
    }

    private supplementFakeInfo(item: TimelineItem): TimelineItem {
      var accountInfo = this.accountInfoPromise;

      item.content.updatedAt = new Date().toISOString();
      item.content.updatedBy = {
        name: accountInfo.fullName,
        userId: accountInfo.userId
      }

      if (!item.content.createdAt) {
        item.content.createdAt = new Date().toISOString();
      }
      return item;
    }

    private supplementFakeAddInfo(item: TimelineItem): TimelineItem {
      var typEnum = this.enums.timelineType;
      var myId = this.accountInfoPromise.userId;

      if(  (typEnum.note == item.timelineType)
        || (typEnum.interview == item.timelineType)
        || (typEnum.docscreening == item.timelineType)
        || (typEnum.feedback == item.timelineType) ){

        item.content.userId = myId;
      }

      return item;
    }
    /* END Timeline Item Handling */


    /* ========================================
       Timeline Watcher
       ======================================== */
    private watchTimeline(): void {
      this.$scope.$watch(() => {
        return this.timeline;
      }, () => {
        this.syncFeedbacksAndInterviews(() => {
          this.applicationEventsService.notifyTimelineChanged(this.$scope, this.timeline);
        });
      }, true); //NOTE(kitaly): そこそこパフォーマンスに悪影響かも
    }

    private syncFeedbacksAndInterviews(callback: Function): void {
      var typEnum = this.enums.timelineType;

      if(this.timeline){
        var feedbacks = _.map(_.filter(this.timeline, (item: TimelineItem) => {
            return item.timelineType == typEnum.feedback
          }), (fbItem) => {
            return fbItem.content;
          });

        _.forEach(this.timeline, (item: TimelineItem) => {

          if(item.timelineType == typEnum.interview){
            var interviewFeedbacks = _.filter(feedbacks, (fb) => { return fb.interviewId == item.content.id });
            if(interviewFeedbacks == null) interviewFeedbacks = [];
            item.content.feedbacks = interviewFeedbacks;

          } else if (item.timelineType == typEnum.docscreening) {
            var docFeedbacks = _.filter(feedbacks, (fb) => { return fb.interviewId == item.content.id });
            if(docFeedbacks == null) docFeedbacks = [];
            item.content.feedbacks = docFeedbacks;
          }
        });
      }

      callback();
    }
    /* Timeline Watcher */
  }

  export class ApplicationOriginal {
    public messageHtml: string;
    public resumeHtml: string;

    constructor(
      public enums: sb.Enums,
      public applicationPromise: ApplicationInfo,
      public messageMarkdownToHtmlPromise,
      public resumeMarkdownToHtmlPromise
    ){}

    public init():void {
      if (this.messageMarkdownToHtmlPromise) {
        this.messageHtml = this.messageMarkdownToHtmlPromise.data.htmlText;
      }
      if (this.resumeMarkdownToHtmlPromise) {
        this.resumeHtml = this.resumeMarkdownToHtmlPromise.data.htmlText;
      }
    }

    public getAttachmentDownloadLink(attachment: res.applications.AttachmentInfo): string {
      var id = this.applicationPromise.id;
      var prefix = attachment.s3Prefix;
      var fileId = attachment.fileId;
      return `/api/applications/${id}/attachments/${prefix}/${fileId}`;
    }

    public isPdfFile(attachment: res.applications.AttachmentInfo): boolean {
      return attachment.fileName.substr(-4, 4).toLowerCase() == '.pdf';
    }

    public getPdfViewerLink(attachment: res.applications.AttachmentInfo): string {
      var download = this.getAttachmentDownloadLink(attachment);
      var encoded = encodeURIComponent(download);
      return `/pdfviewer/web/viewer.html?file=${encoded}`;
    }

    /**
     * 前回のアクションからの期間を取得
     */
    public getDuration(obj: any): string {
      if (obj.startDate) {
        var
            differenceYear = 0,
            differenceMonth = 0,
            differenceStartToEnd = 0,
            isMonthlyBasis = false,
            dateStart,
            dateEnd = new Date();

        if (angular.isNumber(obj.startDate.month)) {
          dateStart = new Date(obj.startDate.year, obj.startDate.month - 1);
          isMonthlyBasis = true;
        } else {
          dateStart = new Date(obj.startDate.year, 0);
        }

        if (obj.endDate) {
          if (isMonthlyBasis && angular.isNumber(obj.endDate.month)) {
            dateEnd = new Date(obj.endDate.year, obj.endDate.month - 1);
          } else {
            dateEnd = new Date(obj.endDate.year, 0);
          }
        }

        dateEnd.setDate(1);
        dateEnd.setHours(0);
        dateEnd.setMinutes(0);
        dateEnd.setSeconds(0);
        dateEnd.setMilliseconds(0);

        differenceStartToEnd = dateEnd.getTime() - dateStart.getTime();
        differenceStartToEnd = differenceStartToEnd / 1000 / 60 / 60 / 24;
        differenceYear = Math.round(differenceStartToEnd / 365)

        if (differenceYear > 0) {
          differenceMonth = Math.round((differenceStartToEnd - (differenceYear * 365)) / 31);

          if (differenceMonth > 0) {
            return differenceYear + '年' + differenceMonth + 'ヶ月';
          } else {
            return differenceYear + '年';
          }
        } else {
          differenceMonth = Math.round(differenceStartToEnd / 31);

          return differenceMonth + 'ヶ月';
        }
      }
    }
  }


  /**
   * NOTE(kitaly): 添付はElasticsearchの都合上、短時間に連続でアップロードすると矛盾が発生するので1ファイル縛りにする
   */
  export class FileAttachment {

    constructor(
      private $rootScope,
      private $scope,
      $modalInstance: bs.IModalServiceInstance,
      private stStaticConfig: any,
      private stUtils: std.Utils
    ){
      $scope.file = null;
      $scope.isDragging = false;

      $scope.setDraggingStyle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        $(e.target).addClass('dragging');
        $scope.isDragging = true;
      };

      $scope.resetDraggingStyle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        $(e.target).removeClass('dragging');
        $scope.isDragging = false;
      };

      $scope.setDropped = (e) => {
        e.preventDefault();
        e.stopPropagation();
        $scope.resetDraggingStyle(e);

        var dropped: any[] = e.originalEvent.dataTransfer.files;

        this.validateAndSetFiles(dropped);
      };

      $scope.selectUploadFile = (e) => {
        var selected = $(e.target)[0].files || $(e.target).val();
        this.validateAndSetFiles(selected);
      };

      $scope.ok = () => {
        $modalInstance.close($scope.file);
      };

      $scope.cancel = () => {
        $modalInstance.dismiss();
      };
    }

    private validateAndSetFiles(files: File[]) {
      if(files.length > 1){
        this.stUtils.toastDanger('一度にアップロードできるのは1ファイルまでです');
      } else if (!/\.pdf/.test(files[0].name)) {
        this.stUtils.toastDanger('PDF形式のファイルのみアップロードできます');
        return false;
      } else {
        var file = files[0];
        var maxFileSize = this.stStaticConfig.applications.attachments.maxFileSize;
        var maxMegabytes = Math.ceil((maxFileSize * 10) / (1024 * 1024)) / 10

        if(file.size > maxFileSize){
          this.stUtils.toastInfo(`ファイルサイズの上限は${maxMegabytes}MBです`);
        } else {
          this.$rootScope.$broadcast('uploadedAttachment');
          this.$scope.file = file;
          this.$scope.ok();
        }
      }
    }
  }


  /**
   * 応募追加・更新
   */
  export class ApplicationEdit {
    public jobList: Array<st.response.jobs.Job>;
    public jobId: string;
    public isEdit: boolean; // 更新画面
    public birthDateYear: String = '';
    public birthDateMonth: String = '';
    public birthDateDay: String = '';
    public years: Array<string>;
    public isEditMessageMD: boolean; // 自由記入欄編集フラグ
    public isEditResumeFreeTextMD: boolean; // レジュメ編集フラグ
    public htmlMessage: string;  // 自由記入欄HTML
    public htmlResumeFreeText: string; //レジュメHTML
    public model: res.applications.ApplicationInfo;
    public newAttachments: res.applications.AttachmentInfo[] = [];
    public delAttachments: res.applications.AttachmentInfo[] = [];

    constructor(
      private $scope,
      public enums: sb.Enums, // 画面の選考ステータス選択で利用
      private routes: st.Routes,
      private stUtils: std.Utils,
      private $state: any,
      private applicationFetchPromise: ng.IHttpPromiseCallbackArg<st.response.applications.ApplicationResponse>,
      private jobListPromise: ng.IHttpPromiseCallbackArg<res.jobs.JobListResponse>,
      private stModal: std.Modal,
      private $timeout: ng.ITimeoutService
    ) {
    }

    /**
     * 初期化処理
     */
    init(): void {

      if (this.applicationFetchPromise) { // 更新（Promiseで応募情報が取得できた場合）
        this.model = this.applicationFetchPromise.data.application;
        if (this.model.applicationSource != 'MNL') {
          this.stUtils.toastInfo("手入力された応募者基本情報のみ編集することができます");
          this.$state.go('details', {applicationId: this.model.id});
        } else {
          this.jobId = this.model.job.jobId;
          if (this.model.profile.birthDate) {
            this.birthDateYear = String(this.model.profile.birthDate.year);
            this.birthDateMonth = String(this.model.profile.birthDate.month);
            this.birthDateDay = String(this.model.profile.birthDate.day);
          }
          this.isEditMessageMD = true;
          this.isEditResumeFreeTextMD = true;
          if (this.model.message) this.previewHTML('message');
          if (this.model.resumeFreeText) this.previewHTML('resumeFreeText');
          this.isEdit = true;
          this.routes.applications.fetchPhone(this.model.id)
            .success((res:any) => {
              this.model.profile.phone = res.phone;
            })
          this.routes.applications.fetchEmail(this.model.id)
            .success((res:any) => {
              this.model.profile.email = res.email;
            })
        }
      // 追加（Promiseではnullを返却）
      } else {
        this.model = this.initApplicationInfo();
        this.isEdit = false;
      }
      this.years = this.getYearsForBirthDate();
      this.isEditMessageMD = true;
      this.isEditResumeFreeTextMD = true;
      if (!this.model.message) this.model.message = '';
      if (!this.model.resumeFreeText) this.model.resumeFreeText = '';
      if (this.jobListPromise) {
        this.jobList = this.jobListPromise.data.jobs;
      }

      this.$scope.$on('uploadedAttachment', () => {
        this.$scope.appForm.$setDirty();
      });
    }

    getYearsForBirthDate() {
      var
        yearsResponse = [],
        dateCurrent = new Date(),
        yearCurrent = dateCurrent.getFullYear(),
        YEAR_PAST_START = 16,
        YEAR_PAST_MAX = 80;
      yearsResponse.push({value: '', name: ''});
      for (var i = YEAR_PAST_START; i < YEAR_PAST_MAX; i++) {
        yearsResponse.push({value: String(yearCurrent - i), name: (yearCurrent - i) + "年"});
      }
      return yearsResponse;
    }

    /**
     * 保存処理
     */
    save(form: any): void {

      // パラメータの整形
      this.paramCheck();

      // バリデーション
      var errList = this.beforeValidator(form);
      if(!_.isEmpty(errList)){
        this.stUtils.toastDanger(errList.join('<br/>'));
        return;
      }

      var that = this;
      this.routes.jobs.detail(this.jobId)
        .success(function(job){

          that.model.job.jobId = job.id;
          that.model.job.jobName = job.name;
          that.model.job.jobAdTitle = job.content.jobAdTitle;

          //NOTE(kitaly): 一時アップロードのレスポンスをそのまま使うとデータ不整合等こわいので API側で attachmentIdInfo を要求するようにしている
          angular.forEach(that.delAttachments, (attach) => {
            if(!that.model.delAttachmentIds) that.model.delAttachmentIds = [];
            that.model.delAttachmentIds.push({fileId: attach.fileId, prefix: attach.s3Prefix});
          });
          angular.forEach(that.newAttachments, (attach) => {
            if(!that.model.attachmentIds) that.model.attachmentIds = [];
            if(!that.model.addAttachmentIds) that.model.addAttachmentIds = [];
            that.model.attachmentIds.push({fileId: attach.fileId, yearMonth: attach.yearMonth});
            that.model.addAttachmentIds.push({fileId: attach.fileId, yearMonth: attach.yearMonth});
          })

          // 更新
          if (that.isEdit) {
            that.routes.applications.update(that.model.id, that.model)
              .success(function(res){
                that.stUtils.toastInfo('応募情報を更新しました。');
                that.$state.transitionTo('details', {applicationId : that.model.id});
              })
              .error(function(err){
                var errList = that.afterValidator(err);
                if(!_.isEmpty(errList)){
                  that.stUtils.toastDanger(errList.join('<br/>'));
                }
              });
          // 追加
          } else {
            that.routes.applications.create(that.model)
              .success(function(res){
                that.stUtils.toastInfo('応募が追加されました。一覧にまもなく反映されます。');
                that.$state.transitionTo('list');
              })
              .error(function(err){
                var errList = that.afterValidator(err);
                if(!_.isEmpty(errList)){
                  that.stUtils.toastDanger(errList.join('<br/>'));
                }
              });
          }
      });
    }

    cancel(): void {
      if (this.isEdit) {
        // go back to application detail view
        this.$state.transitionTo('details', {applicationId: this.model.id});
      }
      else {
        // go to list view
        this.$state.transitionTo('list');
      }
    }
    /**
     * パラメータの整形
     */
    private paramCheck(): void {
      if (!this.model.profile.phone) this.model.profile.phone = null;
      if (!this.model.profile.email) this.model.profile.email = null;
      if (!this.birthDateYear || !this.birthDateMonth || !this.birthDateDay) {
        this.model.profile.birthDate = null;
      } else {
        var birthDate = new Date(this.birthDateYear + "/" + this.birthDateMonth + "/" + this.birthDateDay); // JST
        if (birthDate && !this.model.profile.birthDate) {
          this.model.profile.birthDate = {year: null, month: null, day: null};
        }
        if (birthDate) {
          this.model.profile.birthDate.year = birthDate.getFullYear();
          this.model.profile.birthDate.month = birthDate.getMonth() + 1;
          this.model.profile.birthDate.day = birthDate.getDate();
        }
      }
    }

    /**
     * 画面バリデーション
     */
    private beforeValidator(form: any): String[] {
      var errList = [];
      if (this.model.profile.birthDate && isNaN(this.model.profile.birthDate.year)) errList.push('生年月日が日付形式ではありません');
      if (!this.model.profile.phone && !this.model.profile.email) errList.push('携帯電話番号かメールアドレスのどちらかを入力してください');
      return errList;
    }

    /**
     * API戻り値によるバリデーション
     */
    private afterValidator(err: any): String[] {
      var errList = [];
      if (err.key == 'error.application.eitherPhoneOrEmailMustBeIncluded') errList.push('携帯電話番号かメールアドレスのどちらかを入力してください');
      if (err.details) {
        err.details.map(errKey => {
          if (errKey == 'profile.fullName') errList.push('氏名は必須項目です');
          if (errKey == 'profile.fullNameKana') errList.push('氏名(かな)は必須項目です');
          if (errKey == 'profile.phone') errList.push('携帯電話番号の形式を確認してください');
          if (errKey == 'profile.email') errList.push('メールアドレスの形式を確認してください');
        });
      }
      return errList;
    }

    /**
     * Markdow編集モード切り替え
     */
    editMarkdown(target): void {
      if (target == 'message') {
        this.isEditMessageMD = true;
      } else {
        this.isEditResumeFreeTextMD = true;
      }
      this.$timeout(function() {
        var $focusEl = $('.sg-form-markdown-textarea[name="' + target + '"]');
        if ($focusEl.length === 1) {
          $focusEl.focus();
        }
      });
    }

    /**
     * HTMLプレビュー
     */
    previewHTML(target): void {
      if (target == 'message' && this.isEditMessageMD) {
        this.routes.utils.convertMarkdownToHtml(this.model.message)
          .success((data:res.masters.HtmlText) => {
            this.htmlMessage = data.htmlText;
            this.isEditMessageMD = false;
          });
      } else if (target == 'resumeFreeText' && this.isEditResumeFreeTextMD) {
        this.routes.utils.convertMarkdownToHtml(this.model.resumeFreeText)
          .success((data:res.masters.HtmlText) => {
            this.htmlResumeFreeText = data.htmlText;
            this.isEditResumeFreeTextMD = false;
          });
      }
    }

    /** 追加時の初期化用 */
    private initApplicationInfo():any {
      return {
        id: null,
        profile: this.initApplicationProfole(),
        resumeFreeText: null,
        selectionStage: "NOA", // 選考ステータス＝未対応(オンコード)
        job: {
          jobId: null,
          jobName: null,
          jobAdTitle: null
        },
        message: null
      };
    }
    /** 追加時の初期化用 */
    private initApplicationProfole():any {
      return {
        fullName: null,
        fullNameKana: null,
        lastOrganization: null,
        lastTitle: null,
        birthDate: {
          year: null,
          month: null,
          day: null
        },
        email: null,
        phone: null
     };
    }

    turnOnFileAttachmentModal(): void {
      var settings: bs.IModalSettings = {
        templateUrl: '/internal/parts/applications/file-upload-modal',
        controller: FileAttachment
      };

      this.stModal.modalCustom(settings)
        .result.then((file) => {
          if(file) {
            this.uploadTemporarily(file).success((temp) => {
                this.newAttachments.push(temp);
            });
          }
        });
    }

    private uploadTemporarily(file): ng.IHttpPromise<res.applications.AttachmentInfo> {
      var form = new FormData();
      form.append('attachment', file);
      return this.routes.applications.uploadTempFile(form);
    }

    public unselectAttachment(index: number): void {
      if(this.model.attachments){
        var target = this.model.attachments[index];
        this.delAttachments.push(target);
        this.model.attachments.splice(index, 1);
      }
    }

    public removeNewAttachment(index: number): void {
      if(this.newAttachments){
        this.newAttachments.splice(index, 1);
      }
    }
  }
}

module controllers.interview {
  import res = st.response
  import QueryResultResponse = res.wrapper.QueryResultResponse
  import InterviewSearchParams = res.interview.InterviewSearchParams
  import Interview = res.interview.Interview

  /**
   * 採用担当者用 面接リスト
   */
  export class RecruiterList extends controllers.base.PaginationControllerBase<Interview, InterviewSearchParams> {

    /* Search Results */
    public interviews: res.interview.Interview[];

    /* Search Conditions */
    public feedback: string; // Y or N or null
    public searchFrom: Date; // get last month's date
    public searchTo: Date;

    /* Date Popup Visible Flg */
    public isOpenFromPopup: boolean = false;
    public isOpenToPopup: boolean = false;

    constructor(
      private applicationControllers: application.ApplicationControllers,
      private routes: st.Routes,
      protected $state: ng.ui.IStateService,
      private stApplicationDetailNavService: service.interview.ApplicationDetailNavService,
      $scope,
      public enums: sb.Enums
    ) {
      super($state, $scope);
    }

    //デフォルト条件として、本日以降の面接を表示する
    protected getDefaultSearchConditions(): InterviewSearchParams {
      var defaultFrom = new Date();
      defaultFrom.setHours(0, 0 , 0, 0);
      return {limit: this.defaultPageSize, from: defaultFrom.toISOString()}
    }

    //From と Toの日付を正規化する
    protected normalizeMore(params: InterviewSearchParams): InterviewSearchParams {
      if(angular.isString(params.from) && angular.isDate(new Date(params.from))){
        var fromDate = new Date(params.from);
        fromDate.setHours(0, 0, 0, 0); //in Locale Time
        params.from = fromDate;
      }

      if(angular.isString(params.to) && angular.isDate(new Date(params.to))){
        var toDate = new Date(params.to);
        toDate.setHours(23, 59, 59, 999); // in locale time
        params.to = toDate;
      }

      return params;
    }

    //実際の検索条件を表示上の検索条件用モデルへ詰め替え
    protected setFromNormalizedParams(params: InterviewSearchParams): void {
      this.feedback = params.feedback;
      if(params.from) this.searchFrom = new Date(params.from);
      if(params.to) this.searchTo = new Date(params.to);
    }

    protected doSearch(params: InterviewSearchParams): ng.IHttpPromise<QueryResultResponse<Interview>> {
      return this.routes.interviews.listAll(params);
    }

    protected setFromQueryResult(res: QueryResultResponse<Interview>): void{
      this.interviews = res.hits;
    }

    protected getNewConditions(): InterviewSearchParams {
      //NOTE(kitaly): Datepicker で時刻まで強制できないためPOST前に時刻を強制
      if(this.searchFrom) this.searchFrom.setHours(0, 0, 0, 0);
      if(this.searchTo) this.searchTo.setHours(23, 59, 59, 999);

      return {
        feedback: this.feedback,
        from: this.searchFrom ? this.searchFrom.toISOString() : null,
        to: this.searchTo ? this.searchTo.toISOString() : null
      };
    }

    protected transitionToSelfState(params: InterviewSearchParams): void {
      this.$state.go(this.applicationControllers.allInterviewList.name, params);
    }


    public showFromPopup(e): void {
      e.preventDefault();
      e.stopPropagation();
      this.isOpenFromPopup = true;
    }

    public showToPopup(e): void {
      e.preventDefault();
      e.stopPropagation();
      this.isOpenToPopup = true;
    }

    public searchWithFeedbackFlg(flg: string, isDiff: boolean): void {
      if(isDiff) {
        this.feedback = flg;
        this.search();
      }
    }

    public existsFeedbackText(feedbacks: res.interview.InterviewFeedback[]): boolean {
      return (feedbacks && !_.isEmpty(feedbacks));
    }

    public moveToDetail(applicationId, index): void {
      this.stApplicationDetailNavService.intoDetailFromAllInterviews(this.params, this.interviews, index, this.totalHits)
      this.$state.go('details', {applicationId: applicationId});
    }
  }


  /**
   * 面接官用 面接リスト
   */
  export class InterviewerList extends controllers.base.PaginationControllerBase<Interview, InterviewSearchParams> {

    /* Search Results */
    public interviews:res.interview.Interview[];

    /* Search Conditions */
    public feedback:string; // Y or N or null
    public searchFrom: Date;
    public searchTo: Date;

    /* Date Popup Visible Flg */
    public isOpenFromPopup: boolean = false;
    public isOpenToPopup: boolean = false;

    constructor(
      private routes:st.Routes,
      protected $state:ng.ui.IStateService,
      private stApplicationDetailNavService: service.interview.ApplicationDetailNavService,
      $scope,
      public enums: sb.Enums
    ) {
      super($state, $scope);
    }

    public searchWithFromDate(): void {
      this.search();
    }

    protected getDefaultSearchConditions():InterviewSearchParams {
      return {limit: this.defaultPageSize, feedback: 'N'}
    }

    protected normalizeMore(params: InterviewSearchParams): InterviewSearchParams {
      if(angular.isString(params.from) && angular.isDate(new Date(params.from))){
        var fromDate = new Date(params.from);
        fromDate.setHours(0, 0, 0, 0); //in Locale Time
        params.from = fromDate;
      }

      if(angular.isString(params.to) && angular.isDate(new Date(params.to))){
        var toDate = new Date(params.to);
        toDate.setHours(23, 59, 59, 999); // in locale time
        params.to = toDate;
      }

      return params;
    }

    //実際の検索条件を表示上の検索条件用モデルへ詰め替え
    protected setFromNormalizedParams(params:InterviewSearchParams):void {
      this.feedback = params.feedback;
      this.searchFrom = params.from;
      this.searchTo = params.to;
    }

    protected doSearch(params:InterviewSearchParams):ng.IHttpPromise<QueryResultResponse<Interview>> {
      return this.routes.interviews.listMine(params);
    }

    protected setFromQueryResult(res:QueryResultResponse<Interview>):void {
      this.interviews = res.hits;
    }

    protected getNewConditions():InterviewSearchParams {
      if(this.searchFrom) this.searchFrom.setHours(0, 0, 0, 0);
      if(this.searchTo) this.searchTo.setHours(23, 59, 59, 999);

      return {
        feedback: this.feedback,
        from: this.searchFrom ? this.searchFrom.toISOString() : null,
        to: this.searchTo ? this.searchTo.toISOString() : null
      }
    }

    protected transitionToSelfState(params:InterviewSearchParams):void {
      this.$state.go('int_interviews', params);
    }

    public showFromPopup(e): void {
      e.preventDefault();
      e.stopPropagation();
      this.isOpenFromPopup = true;
    }

    public showToPopup(e): void {
      e.preventDefault();
      e.stopPropagation();
      this.isOpenToPopup = true;
      }

    public searchWithFeedbackFlg(flg: string, isDiff: boolean): void {
      if(isDiff) {
        this.feedback = flg;
        this.search();
      }
    }

    public existsFeedbackText(feedbacks: res.interview.InterviewFeedback[]): boolean {
      return (feedbacks && !_.isEmpty(feedbacks));
    }

    public moveToDetail(applicationId, index):void {
      this.stApplicationDetailNavService.intoDetailFromMyInterviews(this.params, this.interviews, index, this.totalHits);
      this.$state.go('details', {applicationId: applicationId});
    }
  }
}


module service.interview {
  import res = st.response
  import QueryResultResponse = res.wrapper.QueryResultResponse
  import PagingConditions = res.pagination.PagingConditions

  export class ApplicationDetailNavService {

    private activeMode: controllers.application.StState; //Use State Name
    private conditions: PagingConditions;
    private indexOnPage: number;
    private currentPage: any[];
    private totalHits: number;

    constructor(
      private applicationControllers: controllers.application.ApplicationControllers,
      private $state: ng.ui.IStateService,
      private routes: st.Routes
    ){}

    // From List to Details
    intoDetailFromApplications(cond: PagingConditions, page: any[], indexOnPage: number, totalHits: number){
      this.activeMode = this.applicationControllers.applicationList;
      this.setUpListInfo(cond, page, indexOnPage, totalHits);
    }

    intoDetailFromAllInterviews(cond: PagingConditions, page: any[], indexOnPage: number, totalHits: number){
      this.activeMode = this.applicationControllers.allInterviewList;
      this.setUpListInfo(cond, page, indexOnPage, totalHits);
    }

    intoDetailFromMyInterviews(cond: PagingConditions, page: any[], indexOnPage: number, totalHits: number){
      this.activeMode = this.applicationControllers.myInterviewList;
      this.setUpListInfo(cond, page, indexOnPage, totalHits);
    }

    private setUpListInfo(cond:PagingConditions, page:any[], indexOnPage:number, totalHits:number):void {
      this.conditions = cond;
      this.currentPage = page;
      this.indexOnPage = indexOnPage;
      this.totalHits = totalHits;
    }

    // Current Item Info
    isActive()          : boolean { return this.activeMode != null; }
    activeListName()    : string  { return this.activeMode.data.listName; }
    currentItemNumber() : number  { return this.conditions.offset + this.indexOnPage + 1; }
    totalHitsNumber()   : number  { return this.totalHits; }
    existsNextItem()    : boolean { return this.currentItemNumber() < this.totalHits; }
    existsPrevItem()    : boolean { return this.currentItemNumber() > 1;}
    conditionsText()    : string  { return angular.toJson(this.conditions); }


    // Transition bet. adjacent items
    transitionToNextItem(): void {
      this.getNextItem().then((item) => {
        this.transitionWithItem(item);
      });
    }

    transitionToPrevItem(): void {
      this.getPrevItem().then((item) => {
        this.transitionWithItem(item);
      });
    }

    private transitionWithItem(item: any): void {
      var applicationId = this.extractApplicationIdFromItem(item);
      this.$state.go('details', {applicationId: applicationId});
    }

    // NOTE: next → 応募者リストの下の項目（古い応募者）へ移動
    private getNextItem(): ng.IPromise<any> {
      if(this.indexOnPage >= (this.conditions.limit - 1)){ //もしページキャッシュの終端の場合
        this.conditions.offset = this.conditions.offset + this.conditions.limit;
        return this.fetchPageForAnotherItem(this.conditions, 0);

      } else { // ページキャッシュ内
        this.indexOnPage = this.indexOnPage + 1;
        return this.returnAsPromise(this.currentPage[this.indexOnPage]);
      }
    }

    // NOTE: prev → 応募者リストの上の項目（新しい応募者）へ移動
    private getPrevItem(): ng.IPromise<any> {
      if(this.indexOnPage == 0){ //もしページキャッシュの先頭の場合
        this.conditions.offset = this.conditions.offset - this.conditions.limit;
        return this.fetchPageForAnotherItem(this.conditions, this.conditions.limit - 1);

      } else { // ページキャッシュ内
        this.indexOnPage = this.indexOnPage - 1;
        return this.returnAsPromise(this.currentPage[this.indexOnPage]);
      }
    }

    private fetchPageForAnotherItem(params: PagingConditions, newIndex: number): ng.IPromise<any> {
      var fetcher = this.getActveFetcher();
      return fetcher(params).then((res) => {
        this.indexOnPage = newIndex;
        this.currentPage = res.data.hits;
        this.totalHits = res.data.resultInfo.totalHits;
        return res.data.hits[newIndex];
      });
    }

    private getActveFetcher(): (params: PagingConditions) => ng.IHttpPromise<QueryResultResponse<any>> {
      if(this.activeMode.name == this.applicationControllers.applicationList.name){
        return this.routes.applications.list;
      }
      if(this.activeMode.name == this.applicationControllers.allInterviewList.name){
        return this.routes.interviews.listAll;
      }
      if(this.activeMode.name == this.applicationControllers.myInterviewList.name){
        return this.routes.interviews.listMine;
      }
    }

    private extractApplicationIdFromItem(item: any): string {
      if(this.activeMode.name == this.applicationControllers.applicationList.name){
        var applicationInfo: res.applications.ApplicationInfo = item;
        return applicationInfo.id;
      }
      if(this.activeMode.name == this.applicationControllers.allInterviewList.name
      || this.activeMode.name == this.applicationControllers.myInterviewList.name){
        var interview: res.interview.Interview = item;
        return interview.application.applicationId;
      }
    }


    // From Details to List
    backToList(){
      this.$state.go(this.activeMode.name, this.conditions);
    }


    private returnAsPromise(obj: any): ng.IPromise<any> {
      var injector = angular.injector(['ng']);
      var $q: ng.IQService = injector.get('$q');
      var deferred = $q.defer();
      deferred.resolve(obj);
      return deferred.promise;
    }
  }
}

module stanby.directives.applications {

  import UserOverview = stanby.models.users.UserOverview;
  import UserListResponse = stanby.models.users.UserListResponse;

  export interface StCollapseDirectiveConfig{
    prefix: string; // st-note-form-click -> stNoteForm
    controller: string; // NoteFormCtrl as c
    templateUrl: string;
  }

  export interface StCollapseDirectiveScope<T> extends ng.IScope {
    isUpdate: boolean;
    targetModel: T;
    isCollapsed: boolean;
    resolved: any;
    collapseForm: Function;
  }


  export class NoteForm {
    note: st.response.applications.ApplicationNote;
    addNoteForm: ng.IFormController;

    constructor(
      private enums: sb.Enums,
      private routes: st.Routes,
      private $scope: StCollapseDirectiveScope<st.response.applications.ApplicationNote>,
      private $stateParams: controllers.application.ApplicationParams,
      private stModal: std.Modal,
      private applicationEventsService: controllers.application.ApplicationEventsService
    ){}

    public init(): void {

      //NOTE(kitaly): 即実行してもタイミング問題でNullに見えるので、クリックのタイミングを待つ
      this.$scope.$watch(() => {
        return this.$scope.isCollapsed;
      }, (newVal, oldVal) => {
        if(!newVal && oldVal) this.refreshNoteForm();
      });
    }

    public submitNote(): void {

      this.sanitizeNoteForm();

      var applicationId = this.$stateParams.applicationId;
      var props = {
        item: {
          timelineType: this.enums.timelineType.note,
          content: this.note
        }
      }

      if(this.$scope.isUpdate){
        this.updateNote(props, applicationId);
      } else {
        this.createNote(props, applicationId);
      }
    }

    private updateNote(props, applicationId) {
      this.applicationEventsService.notifyUpdTimelineStart(this.$scope.$root, props);

      this.routes.applications.updateNote(applicationId, this.note.noteId, this.note)
        .success((res) => {
          this.applicationEventsService.notifyUpdTimelineSuccess(this.$scope.$root, props);
          this.closeSelf();
          this.refreshNoteForm();
        })
        .error(() => {
          this.applicationEventsService.notifyUpdTimelineFailure(this.$scope.$root, props);
        });
    }

    private createNote(props, applicationId) {
      this.applicationEventsService.notifyAddTimelineStart(this.$scope.$root, props);

      this.routes.applications.addNote(applicationId, this.note)
        .success((res) => {
          props.item.content.noteId = res.noteId;
          this.applicationEventsService.notifyAddTimelineSuccess(this.$scope.$root, props);
          this.closeSelf();
          this.refreshNoteForm();
        }).error(() => {
          this.applicationEventsService.notifyAddTimelineFailure(this.$scope.$root, props);
        });
    }



    public discardNote(): void {
      if (_.isEmpty(this.note)) {
        this.closeSelf();

      } else {
        this.stModal.modalConfirm({msg: '編集中のコメントがありますが取り消しますか？'})
          .result.then(() => {
            this.closeSelf();
            this.refreshNoteForm();
          });
      }
    }

    private sanitizeNoteForm(): void {
      if(this.$scope.isUpdate){
        if(this.note.noteId == null)throw new Error('No comment id is specified');
      }
    }

    private refreshNoteForm(): void {
      if (this.addNoteForm) {
        this.addNoteForm.$setPristine();
      }

      if(this.$scope.isUpdate){
        this.note = _.clone(this.$scope.targetModel); //NOTE(kitaly): TL上の表示がフォームの内容に追随してしまうので
      } else {
        this.note = {note: null, isRecOnly: false};
      }
    }

    private closeSelf(): void {
      this.$scope.isCollapsed = true;
    }
  }


  export class InterviewForm {
    public interview:st.response.interview.Interview;
    public interviewers:Array<UserOverview>;
    public keyword:string;
    public isInterviewersListActive:boolean = false;
    public interviewDate = new Date().toISOString;
    public interviewForm: ng.IFormController;

    public noInterviewTime: boolean;
    public startDate: Date;
    public startAtOpened: boolean = false;
    public endDate: Date;
    public endAtOpened: boolean = false;

    constructor(private $scope: StCollapseDirectiveScope<st.response.interview.Interview>,
                private routes:st.Routes,
                private enums:sb.Enums,
                private stModal:std.Modal,
                private applicationEventsService:controllers.application.ApplicationEventsService,
                private $stateParams:controllers.application.ApplicationParams) {
    }

    public openStartPicker($event): void {
      $event.preventDefault();
      $event.stopPropagation();
      this.startAtOpened = true;
    }

    public openEndPicker($event): void {
      $event.preventDefault();
      $event.stopPropagation();
      this.endAtOpened = true;
    }

    public init():void {

      //NOTE(kitaly): 即実行してもタイミング問題でNullに見えるので、クリックのタイミングを待つ
      this.$scope.$watch(() => {
        return this.$scope.isCollapsed;
      }, (newVal, oldVal) => {
        if(!newVal && oldVal) this.refreshInterviewForm();
      });

      //NOTE(kitaly): startDate/endDate が有効でない限りは startAt/endAt を null にする
      this.syncInterviewTimeVariables();

      this.routes.users.list(null, this.enums.userRole.INT.code)
        .success((list:UserListResponse) => {
          this.interviewers = list.users;
        });
    }

    private syncInterviewTimeVariables() {
      this.$scope.$watchCollection(() => {
        return [this.noInterviewTime, this.startDate, this.endDate];
      }, (newArray) => {
        if (this.interview == null) {
          return;
        }

        if (newArray[0] && newArray[0] == true) {
          this.interview.startAt = null;
          this.interview.endAt = null;

        } else if (angular.isDate(newArray[1]) && angular.isDate(newArray[2])) {
          var tmpEndDate: any = null;
          // 日付の差を計算
          if (angular.isDate(this.interview.startAt)) {
            // 入力された日付（時間は含まない）でDate型を生成
            var startDate = angular.copy(newArray[1]);
            startDate.setHours(0, 0, 0, 0);
            // 前回入力された日付（時間は含まない）でDate型を生成
            var oldStartDate = angular.copy(this.interview.startAt);
            oldStartDate.setHours(0, 0, 0, 0);
            // 日数の差分を取得
            // 日にちに差がある場合は終了日時側の日付部分だけ開始日に合わせる
            var startDayDiff = Math.floor((startDate.getTime() - oldStartDate.getTime()) / (1000 * 60 * 60 * 24));
            if (startDayDiff !== 0) {
              tmpEndDate = angular.copy(newArray[1]);
              tmpEndDate.setHours(
                newArray[2].getHours(),
                newArray[2].getMinutes(),
                newArray[2].getSeconds(),
                newArray[2].getMilliseconds());
              this.endDate = tmpEndDate;
            }
          }
          this.interview.startAt = newArray[1];
          this.interview.endAt = _.isNull(tmpEndDate) ? newArray[2] : tmpEndDate;

        } else {
          this.interview.startAt = null;
          this.interview.endAt = null;
        }
      });
    }

    public checkFormValidity(): boolean {

      if(this.interview && !_.isEmpty(this.interview.title)){

        if(this.noInterviewTime == true){
          return true;
        } else if (angular.isDate(this.interview.startAt) && angular.isDate(this.interview.endAt) &&
          this.interview.startAt < this.interview.endAt){
          return true;
        }
      }

      return false;
    }

    public incrementalSearchInterviewers():void {

      var invalidWord = _.isEmpty(this.keyword) || this.keyword.trim().length == 0;

      angular.forEach(this.interviewers, (user) => {
        if (invalidWord) {
          user.__NonMatching = false;
        } else {
          var regex = new RegExp(this.keyword);
          user.__NonMatching = !(user.email.match(regex) || user.fullName.match(regex));
        }
      });
    }

    public setInterviewer(user:UserOverview):void {
      this.interview.interviewer.name = user.fullName;
      this.interview.interviewer.userId = user.id;
      this.isInterviewersListActive = false; //TODO(kitaly): 2.0.x 現状のUIだと選択中なのか否かわからない
    }

    public submitInterview() {

      this.sanitizeInterviewForm(this.$scope.isUpdate);

      var props = {
        item: {
          timelineType: this.enums.timelineType.interview,
          content: this.interview
        }
      };

      if (this.$scope.isUpdate) {
        this.updateInterview(props);
      } else {
        this.createInterview(props);
      }
    }

    public discardInterview() {
      this.stModal.modalConfirm({msg: '編集中の情報は保存されていません。'})
        .result.then(() => {
          this.refreshInterviewForm();
          this.closeSelf();
        });
    }

    private updateInterview(props):void {
      this.applicationEventsService.notifyUpdTimelineStart(this.$scope.$root, props);

      //NOTE(kitaly): 評価の更新などで versionNo がインクリメントされている可能性がある
      var currentVersionNo = this.$scope.targetModel.versionNo;
      this.interview.versionNo = currentVersionNo.toString();

      this.routes.interviews.update(this.interview.id, this.interview)
        .success(() => {
          var versionNo: number = parseInt(props.item.content.versionNo);
          props.item.content.versionNo = (versionNo + 1).toString();
          this.applicationEventsService.notifyUpdTimelineSuccess(this.$scope.$root, props);
          this.refreshInterviewForm();
          this.closeSelf();
        })
        .error(() => {
          this.applicationEventsService.notifyUpdTimelineFailure(this.$scope.$root, props);
        });
    }

    private createInterview(props):void {

      this.applicationEventsService.notifyAddTimelineStart(this.$scope.$root, props);

      this.routes.interviews.create(this.interview)
        .success((res) => {
          props.item.content.id = res.interviewId;
          props.item.content.versionNo = '0'; //TODO(kitaly): 2.0.x 追加したばかりのものについて versionNo を入れるのがキモい、string型なのがキモイ
          this.applicationEventsService.notifyAddTimelineSuccess(this.$scope.$root, props);
          this.refreshInterviewForm();
          this.closeSelf();
        })
        .error((error) => {
          this.applicationEventsService.notifyAddTimelineFailure(this.$scope.$root, props, error);
        });
    }

    private sanitizeInterviewForm(isUpdate):void {

      //現状UserID指定してるかどうか分からないUIなので…
      if (this.interview.interviewer && this.interview.interviewer.userId) {
        var found = _.find(this.interviewers, (user) => {
          return user.id == this.interview.interviewer.userId;
        });

        if (this.interview.interviewer.name == null) {
          this.interview.interviewer.userId = null;
        } else if (this.interview.interviewer.name.trim() != found.fullName) {
          this.interview.interviewer.userId = null;
        }
      }

      if(isUpdate){
        this.interview.versionNo = this.interview.versionNo.toString();
      }

      //新規 or 更新 にともなってIDの有無チェック
      if (isUpdate && !this.interview.id) throw new Error('Interview ID is not specified');
      if (!isUpdate && this.interview.id) throw new Error('Interview ID must not be specified');

      this.interview.applicationId = this.$stateParams.applicationId;
    }

    private refreshInterviewForm() {
      if (this.interviewForm) {
        this.interviewForm.$setPristine();
      }

      if(this.$scope.isUpdate){

        this.interview = _.clone(this.$scope.targetModel); //NOTE(kitaly): TL上の表示がフォームの内容に追随してしまうので

        //NOTE(kitaly): datepicker がいけてないので空気読んであげる
        if(this.interview.startAt || this.interview.endAt){
          this.noInterviewTime = false;
          this.startDate = new Date(this.interview.startAt);
          this.endDate = new Date(this.interview.endAt);
        } else {
          this.noInterviewTime =true;
          this.resetStartEndDates();
        }
      } else {

        this.interview = {
          title: null,
          interviewer: {
            userId: null,
            name: null
          },
          interviewType: this.enums.interviewType.INT.code
        };

        //NOTE(kitaly): datepicker がいけてないので空気読んであげる
        this.noInterviewTime = false;
        this.resetStartEndDates();
      }
    }

    private resetStartEndDates(): void {
      var start = new Date();
      start.setMinutes(0, 0, 0);
      this.startDate = start;

      var end = new Date();
      end.setHours(end.getHours() + 1, 0, 0, 0);
      this.endDate = end;
    }

    private closeSelf() {
      this.$scope.isCollapsed = true;
    }
  }


  export class DocscreeningForm {
    public docScreening:st.response.interview.Interview;
    public interviewers:Array<UserOverview>;
    public keyword:string;
    public isInterviewersListActive:boolean = false;
    public docscreeningForm: ng.IFormController;

    constructor(private $scope: StCollapseDirectiveScope<st.response.interview.Interview>,
                private routes:st.Routes,
                private enums:sb.Enums,
                private stModal:std.Modal,
                private applicationEventsService:controllers.application.ApplicationEventsService,
                private $stateParams:controllers.application.ApplicationParams) {
    }

    public init():void {

      //NOTE(kitaly): 即実行してもタイミング問題でNullに見えるので、クリックのタイミングを待つ
      this.$scope.$watch(() => {
        return this.$scope.isCollapsed;
      }, (newVal, oldVal) => {
        if(!newVal && oldVal) this.refreshDocScreeningForm();
      });

      this.routes.users.list(null, this.enums.userRole.INT.code)
        .success((list:UserListResponse) => {
          this.interviewers = list.users;
        });
    }

    public incrementalSearchInterviewers():void {

      var invalidWord = _.isEmpty(this.keyword) || this.keyword.trim().length == 0;

      angular.forEach(this.interviewers, (user) => {
        if (invalidWord) {
          user.__NonMatching = false;
        } else {
          var regex = new RegExp(this.keyword);
          user.__NonMatching = !(user.email.match(regex) || user.fullName.match(regex));
        }
      });
    }

    public setInterviewer(user:UserOverview):void {
      this.docScreening.title = '書類選考依頼';
      this.docScreening.interviewer.name = user.fullName;
      this.docScreening.interviewer.userId = user.id;
      this.isInterviewersListActive = false; //TODO(kitaly): 2.0.x 現状のUIだと選択中なのか否かわからない、面接ーFBと重複してるので共通化
    }

    public submitDocScreening() {

      this.sanitizeDocScreeningForm(this.$scope.isUpdate);

      var props = {
        item: {
          timelineType: this.enums.timelineType.docscreening,
          content: this.docScreening
        }
      };

      if (this.$scope.isUpdate) {
        this.updateDocScreening(props);
      } else {
        this.createDocScreening(props);
      }
    }

    public discardDocScreening() {
      this.stModal.modalConfirm({ msg: '編集中の情報は保存されていません。' })
        .result.then(() => {
          this.closeSelf();
          this.refreshDocScreeningForm();
        });
    }

    private updateDocScreening(props):void {
      this.applicationEventsService.notifyUpdTimelineStart(this.$scope.$root, props);

      this.routes.docscreenings.update(this.docScreening.id, this.docScreening)
        .success(() => {
          var versionNo: number = parseInt(props.item.content.versionNo);
          props.item.content.versionNo = (versionNo + 1).toString();
          this.applicationEventsService.notifyUpdTimelineSuccess(this.$scope.$root, props);
          this.closeSelf();
          this.refreshDocScreeningForm();
        })
        .error(() => {
          this.applicationEventsService.notifyUpdTimelineFailure(this.$scope.$root, props);
        });
    }

    private createDocScreening(props):void {

      this.applicationEventsService.notifyAddTimelineStart(this.$scope.$root, props);
      this.routes.docscreenings.create(this.docScreening)
        .success((res) => {
          props.item.content.id = res.interviewId;
          props.item.content.versionNo = '0';
          this.applicationEventsService.notifyAddTimelineSuccess(this.$scope.$root, props);
          this.closeSelf();
          this.refreshDocScreeningForm();
        })
        .error(() => {
          this.applicationEventsService.notifyAddTimelineFailure(this.$scope.$root, props);
        });
    }

    private sanitizeDocScreeningForm(isUpdate):void {

      //現状UserID指定してるかどうか分からないUIなので…
      if (this.docScreening.interviewer && this.docScreening.interviewer.userId) {
        var found = _.find(this.interviewers, (user) => {
          return user.id == this.docScreening.interviewer.userId;
        });

        if (this.docScreening.interviewer.name == null) {
          this.docScreening.interviewer.userId = null;
        } else if (this.docScreening.interviewer.name.trim() != found.fullName) {
          this.docScreening.interviewer.userId = null;
        }
      }

      //NOTE(kitaly): APIがおかしい、参照で number型で返すくせに 更新は string を要求してくる
      if(isUpdate){
        this.docScreening.versionNo = this.docScreening.versionNo.toString();
      }

      //新規 or 更新 にともなってIDの有無チェック
      if (isUpdate && !this.docScreening.id) throw new Error('Interview ID is not specified');
      if (!isUpdate && this.docScreening.id) throw new Error('Interview ID must not be specified');

      this.docScreening.applicationId = this.$stateParams.applicationId;
    }

    private refreshDocScreeningForm() {
      if (this.docscreeningForm) {
        this.docscreeningForm.$setPristine();
      }
      if(this.$scope.isUpdate){
        this.docScreening = _.clone(this.$scope.targetModel); //NOTE(kitaly): TL上の表示がフォームの内容に追随してしまうので
      } else {
        this.docScreening = {
          title: null,
          interviewer: {
            userId: null,
            name: null
          },
          interviewType: this.enums.interviewType.DOC.code
        };
      }
    }

    private closeSelf() {
      this.$scope.isCollapsed = true;
    }
  }


  export class FeedbackFormCtrl {
    feedback: st.response.interview.InterviewFeedback;
    feedbackForm: ng.IFormController;
    feedbackGrade: any;

    constructor(
      private $scope: StCollapseDirectiveScope<st.response.interview.InterviewFeedback>,
      private routes: st.Routes,
      private applicationEventsService: controllers.application.ApplicationEventsService,
      private enums: sb.Enums,
      private stModal: std.Modal,
      private stUtils: std.Utils
    ){
    }

    public init(): void {
      this.feedbackGrade = _.cloneDeep(this.enums.interviewFeedbackGrade);
      this.$scope.$watch(() => {
        return this.$scope.isCollapsed;
      }, (newVal) => {
        if(!newVal) this.refreshFeedbackForm();
      });
    }

    public submitFeedback(): void {
      if(this.feedback == null || this.feedback.grade == null){
        this.stUtils.toastDanger('評価グレードが指定されていません');
        return;
      }

      if (this.feedback.summary == null || this.feedback.summary == "") {
        this.stUtils.toastDanger('コメントを入力してください');
        return;
      }

      this.feedback.grade = this.feedback.grade ? this.feedback.grade.toString() : null;

      var props: controllers.application.TimelineUpdateEventProps = {
        item: {
          timelineType: this.enums.timelineType.feedback,
          content: this.feedback
        }
      }

      if(this.$scope.isUpdate){
        this.applicationEventsService.notifyAddTimelineStart(this.$scope.$root, props);

        if (this.$scope.resolved.interviewType===this.enums.interviewType.INT.code) {

          this.routes.interviews.updateFeedback(this.feedback.interviewId, this.feedback.feedbackId, this.feedback)
            .success((res) => {
              this.closeSelf();
              this.refreshFeedbackForm();
              this.applicationEventsService.notifyUpdTimelineSuccess(this.$scope.$root, props);
            })
            .error(() => {
              this.applicationEventsService.notifyUpdTimelineFailure(this.$scope.$root, props);
            });
        } else {
          this.routes.docscreenings.updateFeedback(this.feedback.interviewId, this.feedback.feedbackId, this.feedback)
            .success((res) => {
              this.closeSelf();
              this.refreshFeedbackForm();
              this.applicationEventsService.notifyUpdTimelineSuccess(this.$scope.$root, props);
            })
            .error(() => {
              this.applicationEventsService.notifyUpdTimelineFailure(this.$scope.$root, props);
            });
        }

      }else{

        this.applicationEventsService.notifyAddTimelineStart(this.$scope.$root, props);
        if (this.$scope.resolved.interviewType===this.enums.interviewType.INT.code) {
          this.routes.interviews.addFeedback(this.feedback.interviewId, this.feedback)
            .success((res) => {
              this.closeSelf();
              this.refreshFeedbackForm();
              props.item.content.feedbackId = res.feedbackId;
              this.applicationEventsService.notifyAddTimelineSuccess(this.$scope.$root, props);
            })
            .error((res) => {
              this.applicationEventsService.notifyAddTimelineFailure(this.$scope.$root, props);
            });
        } else {
          this.routes.docscreenings.addFeedback(this.feedback.interviewId, this.feedback)
            .success((res) => {
              this.closeSelf();
              this.refreshFeedbackForm();
              props.item.content.feedbackId = res.feedbackId;
              this.applicationEventsService.notifyAddTimelineSuccess(this.$scope.$root, props);
            })
            .error((res) => {
              this.applicationEventsService.notifyAddTimelineFailure(this.$scope.$root, props);
            });
        }
      }
    }

    public discard(): void {
      this.stModal.modalConfirm({ msg: '編集中の情報は保存されていません。' })
        .result.then(() => {
          this.closeSelf();
          this.refreshFeedbackForm();
        })
    }

    private closeSelf(): void {
      this.$scope.isCollapsed = true;
    }

    private refreshFeedbackForm() {
      if (this.feedbackForm) {
        this.feedbackForm.$setPristine();
      }

      if(this.$scope.isUpdate){
        this.feedback = _.clone(this.$scope.targetModel); //NOTE(kitaly): TL上の表示がフォームの内容に追随してしまうので
      }else{
        this.feedback = {
          interviewId: this.$scope.resolved.interviewId,
          interviewType: this.$scope.resolved.interviewType,
          interviewTitle: this.$scope.resolved.interviewTitle,
          grade: null,
          summary: null
        }
      }
    }
  }




  /**
   * [Usage]
   * <st-interview-form-click="jsi-create-interview">
   * <st-interview-form-collapse="jsi-create-interview" st-create>
   *
   * <st-interview-form-click="jsi-update-interview-2" st-update ng-model="item" st-resolve="{someId: 'abc'}">
   * <st-interview-form-collapse="jsi-update-interview-2">
   *
   * [Related Attributes]
   * - stXxxxFormClick
   * - stXxxxFormCollapse
   * - stUpdate / stCreate
   * - stResolve
   * - stCollapseHideTarget
   *
   * [This throws events when saved]
   * - stInterviewAdded
   * - stInterviewUpdated
   */
  export function registerDirectives():void {


    var noteFormDirective: StCollapseDirectiveConfig = {
      prefix: 'stNoteForm',
      controller: 'NoteFormCtrl as c',
      templateUrl: '/internal/directives/applications/st-note-form-collapse'
    };

    var interviewFormDirective: StCollapseDirectiveConfig = {
      prefix: 'stInterviewForm',
      controller: 'InterviewFormCtrl as c',
      templateUrl: '/internal/directives/applications/st-interview-form-collapse'
    }

    var docscreeningFormDirective: StCollapseDirectiveConfig = {
      prefix: 'stDocscreeningForm',
      controller: 'DocscreeningFormCtrl as c',
      templateUrl: '/internal/directives/applications/st-docscreening-form-collapse'
    }

    var feedbackFormDirective: StCollapseDirectiveConfig = {
      prefix: 'stFeedbackForm',
      controller: 'FeedbackFormCtrl as c',
      templateUrl: '/internal/directives/applications/st-feedback-form-collapse'
    }

    angular.module('stanbyDirectives')
      .controller('NoteFormCtrl', NoteForm)
      .controller('InterviewFormCtrl', InterviewForm)
      .controller('DocscreeningFormCtrl', DocscreeningForm)
      .controller('FeedbackFormCtrl', FeedbackFormCtrl)
    ;
    registerCollapseDirective(noteFormDirective);
    registerCollapseDirective(interviewFormDirective);
    registerCollapseDirective(docscreeningFormDirective);
    registerCollapseDirective(feedbackFormDirective);
  }

  function registerCollapseDirective(config: StCollapseDirectiveConfig): void {
    var clickDirective    = config.prefix + 'Click';  // Click側のDirective名
    var collapseDirective = config.prefix + 'Collapse'; //Form側のDirective名
    var clickEventName    = config.prefix + 'Clicked'; //Click部分がClickされたことの通知
    var toggledEventName  = config.prefix + 'Toggled'; //Form部分の表示・非表示が切り替わった結果の通知

    angular.module('stanbyDirectives')
      .directive(clickDirective, () => {
        return {
          restrict: 'A',
          compile: ($elem, $attr) => {
            if (!$attr[clickDirective]) throw new Error('Collapse target identifier is not specified: ' + clickDirective);

            // Linker
            return ($scope, $iElem, $attrs) => {
              var interporatedId = interpolateWithCustomSymbol($attr[clickDirective], $scope);

              $iElem.on('click', (e) => {
                $scope.$root.$broadcast(clickEventName, e, interporatedId);
              });

              // id は interporatedId のこと
              $scope.$on(toggledEventName, (event, id, isCollapsed) => {

                //    ちょっと汚いが,これでこのイベントに合わせてhideIdを取得できる
                var hideId = $(`[st-feedback-form-click="${id}"]`).parent().attr('id');

                var $hideTarget = hideId ? angular.element('#' + hideId) : $iElem;

                //NOTE(hideaki): 親が#jsi-command-box（[アクションを選択してください]のところ）だったら,ボタンではなくこの親を対象に
                if ($hideTarget.parent().is('#jsi-command-box')) {
                  $hideTarget = $hideTarget.parent();
                }

                if(id == interporatedId){
                  if(isCollapsed) {
                    $hideTarget.stop().fadeIn(300);
                  } else {
                    $hideTarget.stop().fadeOut(300);
                  }
                }
              });
            }
          }
        }
      })
      .directive(collapseDirective, ($compile: ng.ICompileService) => {
        return {
          restrict: 'A',
          templateUrl: config.templateUrl,
          controller: config.controller,
          scope: {},
          compile: ($elem, $attr) => {
            var stCreate = $attr.stCreate;
            var stUpdate = $attr.stUpdate;
            var ngModelExpr = $attr.ngModel;

            if (!$attr[collapseDirective]) throw new Error('Collapse target identifier is not specified: ' + collapseDirective);
            if (stCreate == null && stUpdate == null) {
              throw new Error('You need to specify stCreate/stUpdate attribute (also ngModel only for stUpdate): ' + collapseDirective);
            } else if (stUpdate != null && ngModelExpr == null) {
              throw new Error('You need to specify stCreate/stUpdate attribute (also ngModel only for stUpdate): ' + collapseDirective);
            }

            return ($scope, $iElem) => {
              var interporatedId = interpolateWithCustomSymbol($attr[collapseDirective], $scope.$parent); //NOTE(kitaly): 独自スコープを切っているため、親スコープを利用する
              if($attr.stResolve) $scope.resolved = $scope.$parent.$eval($attr.stResolve);

              $scope.isCollapsed = true; //起動時は非表示

              var resetEditingInfo = function () {
                if (stUpdate != null && ngModelExpr != null) {
                  $scope.isUpdate = true;
                  $scope.targetModel = $scope.$parent.$eval(ngModelExpr);
                } else {
                  $scope.isUpdate = false;
                }
              };

              resetEditingInfo();

              //ControllerやViewで 表示にした場合に toggle イベント通知を行う
              $scope.$watch(() => {
                return $scope.isCollapsed;
              }, (isCollapsed) => {
                $scope.$root.$broadcast(toggledEventName, interporatedId, isCollapsed);
              });

              $scope.$on(clickEventName, (data, e, id) => {
                if (interporatedId == id) {
                  $scope.$apply(() => {
                    if($scope.isCollapsed){ //NOTE(kitaly): 非表示→表示のみ
                      var $section1 = $(e.target).closest('section');// e.target が 鉛筆アイコンなど
                      var $section2 = $iElem.closest('section');// $iElem は feedbackのフォーム
                      resetEditingInfo(); // スコープをリフレッシュ
                      // ２つの親(の参照)が同じ場合のみ展開を許可（他のsectionが開いてしまうバグを解消
                      if ($section1[0] == $section2[0])
                        $scope.isCollapsed = false;
                    }
                  });
                }
              });
            }
          }
        }
      })


    function interpolateWithCustomSymbol (text, $scope) {
      if(text){
        var $interpolate:ng.IInterpolateService = angular.injector(['ng']).get('$interpolate');
        var normalized = text.replace('{%', '{{').replace('%}', '}}');
        return $interpolate(normalized)($scope);
      }else{
        return text;
      }
    };
  }
}

module controllers.application {
  export interface StState extends ng.ui.IState { //TODO(kitaly): 2.x.x 共通化、StStateObjectで縛れると良いかも
    roles?: string[]
    anonAllowed?: boolean
  }

  export class ApplicationControllers {

    constructor(
      private enums: sb.Enums
    ){}

    applicationList: StState = {
      name : 'list',
      url: '/?offset&limit&interviewType&keyword&jobId&statuses',
      templateUrl: '/internal/controllers/applications/list',
      controller: 'ApplicationListCtrl as c',
      roles: [this.enums.userRole.REC.code],
      data: {
        listName: '応募者'
      },
      onEnter: ($rootScope) => {
        $rootScope.$emit('breadcrumbs', [
          { url: '/', text: 'Stanby Recruiting' },
          { url: '', text: '応募者' }
        ]);
      }
    }

    allInterviewList: StState = {
      name : 'rec_interviews',
      url: '/interviews?offset&limit&interviewType&feedback&from&to',
      roles: [this.enums.userRole.REC.code],
      templateUrl: '/internal/interview/rec_list',
      controller: 'RecruiterIntListCtrl as c',
      data: {
        listName: '選考（すべての選考）'
      },
      onEnter: ($rootScope) => {
        $rootScope.$emit('breadcrumbs', [
          { url: '/', text: 'Stanby Recruiting' },
          { url: '', text: '選考（すべての選考）' }
        ]);
      }
    }

    myInterviewList: StState = {
      name: 'int_interviews',
      url: '/interviews/mine?offset&limit&interviewType&feedback&from&to',
      roles: [this.enums.userRole.INT.code],
      templateUrl: '/internal/interview/int_list',
      controller: 'InterviewerIntListCtrl as c',
      data : {
        listName: '担当の選考）'
      },
      onEnter: ($rootScope) => {
        $rootScope.$emit('breadcrumbs', [
          { url: '/', text: 'Stanby Recruiting' },
          { url: '', text: '担当の選考' }
        ]);
      }
    }
  }
}


module stanby.routing.applications {

  export function initRouting(){

    stanby.directives.applications.registerDirectives();

    angular.module('stanbyControllers')

      /* ========= Constant ========= */
      .service('applicationEventsService', controllers.application.ApplicationEventsService)
      .provider('applicationControllers', (enums) => { return {
        $get: () => { return new controllers.application.ApplicationControllers(enums); }
      }})

      /* ========= Detail Controllers ========= */
      .controller('ApplicationDetailCtrl', controllers.application.ApplicationDetail)
      .controller('ApplicationDetailNavCtrl', controllers.application.ApplicationDetailNav)
      .controller('ApplicationSummaryCtrl', controllers.application.ApplicationSummary)
      .controller('ApplicationActionCtrl', controllers.application.ApplicationAction)
      .controller('ApplicationTimelineCtrl', controllers.application.ApplicationTimeline)
      .controller('ApplicationOriginalCtrl', controllers.application.ApplicationOriginal)

      /* ========= Other Controllers ========= */
      .controller('ApplicationEditCtrl', controllers.application.ApplicationEdit)
      .controller('ApplicationListCtrl', controllers.application.ApplicationList)
      .controller('RecruiterIntListCtrl', controllers.interview.RecruiterList)
      .controller('InterviewerIntListCtrl', controllers.interview.InterviewerList)

      /* ========= Routing Config ========= */
      .config(($stateProvider, $urlRouterProvider, applicationControllersProvider, enums: sb.Enums) => {
        var applicationControllers: controllers.application.ApplicationControllers = applicationControllersProvider.$get();

        $urlRouterProvider.otherwise('/');

        $stateProvider
          .state(applicationControllers.applicationList)
          .state(applicationControllers.allInterviewList)
          .state(applicationControllers.myInterviewList)
          .state('details', {
            url: '/{applicationId:[0-9]+}',
            views: {
              '': {
                templateUrl: '/internal/controllers/applications/detail',
                controller: 'ApplicationDetailCtrl as c'
              },
              'applicationNav@details': {
                templateUrl: '/internal/controllers/applications/detail-nav',
                controller: 'ApplicationDetailNavCtrl as anc'
              },
              'summaryView@details': {
                templateUrl: '/internal/controllers/applications/detail-summary',
                controller: 'ApplicationSummaryCtrl as asc'
              },
              'mainAction@details': {
                templateUrl: '/internal/controllers/applications/detail-main-action',
                controller: 'ApplicationActionCtrl as aac'
              },
              'applicationTimeline@details': {
                templateUrl: '/internal/controllers/applications/detail-timeline',
                controller: 'ApplicationTimelineCtrl as atc'
              },
              'applicationOriginal@details': {
                templateUrl: '/internal/controllers/applications/detail-original',
                controller: 'ApplicationOriginalCtrl as aoc'
              }
            },
            roles: [enums.userRole.REC.code, enums.userRole.INT.code],
            resolve: {
              applicationPromise: ($stateParams: controllers.application.ApplicationParams, routes: st.Routes): ng.IPromise<st.response.applications.ApplicationInfo> =>  {
                return routes.applications.details($stateParams.applicationId)
                  .then((res) => {
                    return res.data.application;
                  });
              },
              accountInfoPromise: (stbUser: stb.UserService): ng.IPromise<st.response.account.AccountInfo> => {
                return stbUser.getAccountInfoPromise();
              },
              messageMarkdownToHtmlPromise: (applicationPromise: st.response.applications.ApplicationInfo, routes: st.Routes): ng.IPromise<st.response.utils.HtmlText> => {
                if (applicationPromise.message) {
                  return routes.utils.convertMarkdownToHtml(applicationPromise.message);
                } else {
                  return null;
                }
              },
              resumeMarkdownToHtmlPromise: (applicationPromise: st.response.applications.ApplicationInfo, routes: st.Routes): ng.IPromise<st.response.utils.HtmlText> => {
                if (applicationPromise.resumeFreeText) {
                  return routes.utils.convertMarkdownToHtml(applicationPromise.resumeFreeText);
                } else {
                  return null;
                }
              }
            },
            onEnter: ($rootScope, applicationPromise, accountInfoPromise, enums) => {
              var job = applicationPromise.job;
              var userRole = accountInfoPromise.roles;
              if (_.contains(userRole, enums.userRole.ADM.code) || _.contains(userRole, enums.userRole.REC.code)) {
                $rootScope.$emit('breadcrumbs', [
                  { url: '/', text: 'Stanby Recruiting' },
                  { url: '/application#/', text: '応募者' },
                  { url: '', text: job.jobName }
                ]);
              } else {
                $rootScope.$emit('breadcrumbs', [
                  { url: '/', text: 'Stanby Recruiting' },
                  { url: '', text: job.jobName }
                ]);
              }
            }
          })
          .state('add', {
            url: '/add',
            templateUrl: '/internal/controllers/applications/edit',
            controller: 'ApplicationEditCtrl as acc',
            roles: [enums.userRole.REC.code],
            resolve: {
              applicationFetchPromise: function(): ng.IHttpPromise<st.response.applications.ApplicationResponse> {
                return null;
              },
              jobListPromise: function(routes: st.Routes): ng.IHttpPromise<st.response.jobs.JobListResponse> {
                return routes.jobs.list().success((jobs: st.response.jobs.JobListResponse) => {
                  return jobs;
                });
              }
            },
            onEnter: ($rootScope) => {
              $rootScope.$emit('breadcrumbs', [
                { url: '/', text: 'Stanby Recruiting' },
                { url: '/application#/', text: '応募者' },
                { url: '', text: '応募者情報入力' }
              ]);
            }
          })
          .state('edit', {
            url: '/:applicationId/edit',
            templateUrl: '/internal/controllers/applications/edit',
            controller: 'ApplicationEditCtrl as acc',
            roles: [enums.userRole.REC.code],
            resolve: {
              applicationFetchPromise: function($stateParams: ng.ui.IStateParamsService, routes: st.Routes): ng.IHttpPromise<st.response.applications.ApplicationResponse> {
                var applicationId = $stateParams['applicationId'];
                return routes.applications.details(applicationId)
                  .success((applicationResponse: st.response.applications.ApplicationResponse) => {
                    return applicationResponse;
                  });
              },
              jobListPromise: function(routes: st.Routes): ng.IHttpPromise<st.response.jobs.JobListResponse> {
                return routes.jobs.list().success((jobs: st.response.jobs.JobListResponse) => {
                  return jobs;
                });
              }
            },
            onEnter: ($rootScope, applicationFetchPromise) => {
              var application = applicationFetchPromise.data.application;

              $rootScope.$emit('breadcrumbs', [
                { url: '/', text: 'Stanby Recruiting' },
                { url: '/application#/', text: '応募者' },
                { url: '/application#/' + application.id, text: application.job.jobName },
                { url: '', text: application.profile.fullName }
              ]);
            }
          })
          .state('print_interviews', {
            url: '/interviews/print',

            roles: [enums.userRole.REC.code],
            views: {
              '': {
                templateUrl: '/internal/interview/print_list',
                controller: 'RecruiterIntListCtrl as c'
              },
              'searchConditions@rec_interviews': {
                templateUrl: '/internal/interview/rec_search_view',
                controller: 'SearchConditionsCtrl as scc',
                resolve: { mineOnly: function(){return true;}}
              }
            }
          })
        ;
      })
    ;


    angular.module('stanbyServices')
      .service('stApplicationDetailNavService', service.interview.ApplicationDetailNavService)
    ;
  }
}
