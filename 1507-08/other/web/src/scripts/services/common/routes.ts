/// <reference path="../../vendor_def/tsd.d.ts" />





interface JQuery {
  imgcentering(): void
}


interface PopStateEvent {
  dataTransfer: Object
}


interface Object {
  files: Object
}

module stb {
  'use strict';

  import acc = st.response.account
  import cnf = st.response.configuration

  export class ConfigService {
    constructor(
      private routes: st.Routes
    ){}

    private requestCount: number = 0;
    private cachedPromise: ng.IHttpPromise<cnf.ConfigResponse>

    public getConfig(callback: (res: cnf.ConfigResponse) => void) {

      if(this.requestCount == 0){
        this.refreshConfig();
      }

      this.cachedPromise.success((res: cnf.ConfigResponse) => {
        if(callback) callback(res);
      });
    }

    public getConfigPromise() {
      if(this.requestCount == 0){
        this.refreshConfig();
      }

      return this.cachedPromise;
    }

    private refreshConfig() {
      this.cachedPromise = this.routes.configuration.retrieve();
    }
  }

  export interface AccountInfoHandler {
    (data?:acc.AccountInfoResponse): any
  }
  
  export class UserService {

    constructor(
      private routes: st.Routes
    ){}
    
    private requestCount: number = 0;
    private cachedPromise:ng.IHttpPromise<acc.AccountInfoResponse>;


    /**
     * ログイン状態、非ログイン状態に応じて処理実行
     * 初回コール時はHttpリクエストが発生するが2回目以降はキャッシュされた情報を利用する
     * サーバに再問い合わせする場合は updateAccountInfo を利用 
     * @param ifLogged: ログイン状態であれば実行する処理
     * @param ifNotLogged: 非ログイン状態であれば実行する処理
     */
    public checkLogin(ifLogged: AccountInfoHandler, ifNotLogged?: Function){
      if(this.requestCount == 0){
        this.refreshAccountInfo();
      }
      this.checkLoggedIn(ifLogged, ifNotLogged);
    }

    public getAccountInfoPromise(): ng.IPromise<acc.AccountInfo> {
      return this.cachedPromise.then((res) =>{
          return res.data.account;
      });
    }

    /**
     * アカウント情報取得
     * 初回コール時はHttpリクエストが発生するが2回目以降はキャッシュされた情報を利用する
     * サーバに再問い合わせする場合は updateAccountInfo を利用
     * @param callback
     */
    public getAccountInfo(ifLoggedInFunction: AccountInfoHandler) {
      if(this.requestCount == 0){
        this.refreshAccountInfo();
      }
      this.checkLoggedIn(ifLoggedInFunction, null);
    }

    /**
     * 必ずサーバに問い合わせた上でアカウント情報を取得する
     * 特に理由がなければ getAccountInfo でのキャッシュ利用を推奨
     * @param callback
     */
    public updateAccountInfo(ifLoggedInFunction: AccountInfoHandler) {
      this.refreshAccountInfo();
      this.checkLoggedIn(ifLoggedInFunction, null);
    }
    
    /* ==================
     *  Assistant Methods
     * ================== */
    private refreshAccountInfo(): any {
      this.requestCount++;
      this.cachedPromise = this.routes.account.getAccountInfo();
    }

    private checkLoggedIn(ifLoggedInFunction   : AccountInfoHandler // ログイン済時に実行するFunction
                         ,ifNotLoggedInFunction: Function           // 未ログイン時に実行するFunction
                         ){
      // NOTE(omiend): this.routes.account.getAccountInfo()はログインしていない場合「Status：200 - "error.authentication"」を返却
      this.cachedPromise.success((data) => {
        if (data.key === "error.authentication" && ifNotLoggedInFunction) {
          ifNotLoggedInFunction();
        } else if(ifLoggedInFunction){
          ifLoggedInFunction(data);
        }
      });
    }
  }
}

module st {
  'use strict';

  export interface Routes {
    configuration: routes.Configuration
    utils: routes.Utils
    jobs: routes.Jobs
    applications: routes.Applications
    interviews: routes.Interviews
    docscreenings: routes.Docscreenings
    corporate: routes.Corporate
    corporatePublic: routes.CorporatePublic
    users: routes.Users
    profile: routes.Profile
    account: routes.Account
    images: routes.Images
    validation: routes.Validation
    masters: routes.Masters
    contact: routes.Contact
  }


  export module routes {
    import res = st.response
    import QueryResultResponse = res.wrapper.QueryResultResponse;

    export interface Configuration {
      retrieve(): ng.IHttpPromise<response.configuration.ConfigResponse>
    }

    export interface Utils {
      convertMarkdownToHtml(markdownText:string): ng.IHttpPromise<response.utils.HtmlText>
    }

    import ApplicationInfo          = res.applications.ApplicationInfo;
    import ApplicationResponse      = res.applications.ApplicationResponse;
    import ApplicationSearchParams  = res.applications.ApplicationSearchParams;
    import AttachmentInfo           = res.applications.AttachmentInfo;

    export interface Jobs {
      list(): ng.IHttpPromise<response.jobs.JobListResponse>
      findJobs(condition: ApplicationSearchParams): ng.IHttpPromise<response.jobs.JobListResponse>
      detail(jobId:string): ng.IHttpPromise<response.jobs.Job>
      create(data:any): ng.IHttpPromise<any>
      update(jobId:string, data:any): ng.IHttpPromise<any>

      detailFreeText(jobId:string): ng.IHttpPromise<any>

      previewAsPc(data:any): ng.IHttpPromise<any>
      previewAsMobile(data:any): ng.IHttpPromise<any>

      applyPublishing(jobId:string): ng.IHttpPromise<any>
      withdrawPublishing(jobId:string): ng.IHttpPromise<any>
      cancelPublishing(jobId:string): ng.IHttpPromise<any>
      updateClosingDay(jobId: string, closeAt: Date): ng.IHttpPromise<any>

      validateAlias(data:any): ng.IHttpPromise<any>
    }

    export interface Applications {
      list(condition: ApplicationSearchParams): ng.IHttpPromise<QueryResultResponse<ApplicationInfo>>
      overviews(): ng.IHttpPromise<res.applications.ApplicationOverviewsResponse>
      uploadTempFile(data)            : ng.IHttpPromise<AttachmentInfo>
      details(applicationId:string)   : ng.IHttpPromise<ApplicationResponse>
      fetchPhone(applicationId:string): any
      fetchEmail(applicationId:string): any
      downloadAttachment(applicationId: string, prefix: string, fileId: string): ng.IHttpPromise<any>
      updateStatus(applicationId: string, selectionStage: string, versionNo: number): ng.IHttpPromise<any>
      attachFile(applicationId, data) : ng.IHttpPromise<AttachmentInfo>
      create(data:any): ng.IHttpPromise<any>
      update(applicationId:string, data:any): ng.IHttpPromise<any>
      addNote(applicationId:string, data: any): ng.IHttpPromise<any>
      updateNote(applicationId:string, noteId, data: any): ng.IHttpPromise<any>
    }


    import Interview = res.interview.Interview;
    import InterviewFeedback = res.interview.InterviewFeedback;
    import InterviewSearchParams = res.interview.InterviewSearchParams;

    export interface Interviews {
      listAll(conditions : InterviewSearchParams)       : ng.IHttpPromise<QueryResultResponse<Interview>>
      listAllToday(conditions : InterviewSearchParams)  : ng.IHttpPromise<QueryResultResponse<Interview>>
      listMine(conditions : InterviewSearchParams)      : ng.IHttpPromise<QueryResultResponse<Interview>>
      listMyUnrated(conditions : InterviewSearchParams) : ng.IHttpPromise<QueryResultResponse<Interview>>
      detail(interviewId: string)                       : ng.IHttpPromise<Interview>
      create(interview: Interview)                      : ng.IHttpPromise<any>
      update(interviewId: string, interview: Interview) : ng.IHttpPromise<any>
      addFeedback(interviewId: string, interviewfeedback: InterviewFeedback) : ng.IHttpPromise<any>
      updateFeedback(interviewId: string, feedbackId, interviewfeedback: InterviewFeedback): ng.IHttpPromise<any>
    }

    export interface Docscreenings {
      detail(interviewId: string)                       : ng.IHttpPromise<Interview>
      create(interview: Interview)                      : ng.IHttpPromise<any>
      update(interviewId: string, interview: Interview) : ng.IHttpPromise<any>
      addFeedback(interviewId: string, interviewfeedback: InterviewFeedback) : ng.IHttpPromise<any>
      updateFeedback(interviewId: string, feedbackId, interviewfeedback: InterviewFeedback): ng.IHttpPromise<any>
    }

    export interface Corporate {
      update(any) : ng.IHttpPromise<any>
      show()      : ng.IHttpPromise<any>
    }

    export interface Users {
      list(status: string, role: string): ng.IHttpPromise<stanby.models.users.UserListResponse>
      details(userId:string): ng.IHttpPromise<stanby.models.users.UserDetailResponse>
      loginUserDetails(): ng.IHttpPromise<any>
      create(data:any): ng.IHttpPromise<any>
      update(userId:string, data:any): ng.IHttpPromise<any>
      updateStatus(userId:string, data:any): ng.IHttpPromise<any>
    }

    export interface CorporatePublic {
      show(): ng.IHttpPromise<any>
      update(any): ng.IHttpPromise<any>
    }

    export interface Profile {
      show(): ng.IHttpPromise<any>
      update(data:any): ng.IHttpPromise<any>
      changeEmail(data:any): ng.IHttpPromise<any>
      changePassword(data:any): ng.IHttpPromise<any>
      resendConfirmation(): ng.IHttpPromise<any>
    }


    export interface Account {
      login(data:any): ng.IHttpPromise<any>
      logout(): ng.IHttpPromise<any>
      signup(data:any): ng.IHttpPromise<any>
      forgotPassword(data:any): ng.IHttpPromise<any>
      getAccountInfo(): ng.IHttpPromise<response.account.AccountInfoResponse>
      verifySignup(token:string): ng.IHttpPromise<any>
      verifyEmailChange(token:string): ng.IHttpPromise<any>
      verifyForgotPassword(token:any): ng.IHttpPromise<any>
      resetForgotPassword(data): ng.IHttpPromise<any>
    }


    export interface Images {

      listLogos()   : ng.IHttpPromise<Array<res.images.PooledImage>>
      listCovers()  : ng.IHttpPromise<Array<res.images.PooledImage>>
      listInlines() : ng.IHttpPromise<Array<res.images.PooledImage>>

      uploadLogo(data: any)           : ng.IHttpPromise<any>
      uploadCover(data: any)          : ng.IHttpPromise<any>
      uploadInline(data: any)         : ng.IHttpPromise<any>
      deleteImage(imageId: string)    : ng.IHttpPromise<any>

      getTemporary(imageId: string, yearMonth: string): ng.IHttpPromise<any>

      uploadTemporaryLogo(data: any)  : ng.IHttpPromise<any>
      uploadTemporaryCover(data: any) : ng.IHttpPromise<any>
      uploadTemporaryInline(data: any): ng.IHttpPromise<any>
    }


    export interface Validation {
      emailDuplicate(email:string): ng.IHttpPromise<any>
      emailDuplicateForUpdate(newEmail:string, currentEmail:string): ng.IHttpPromise<any>
      postalCode(postalCode:string): ng.IHttpPromise<any>
      phone(phone:string): ng.IHttpPromise<any>
    }


    export interface Masters {
      industries(): ng.IHttpPromise<any>
      address(postalCode:string): ng.IHttpPromise<string>
      benefits(jobTypeId:string): ng.IHttpPromise<string>
      features(jobTypeId:string): ng.IHttpPromise<string>
      occupations(): ng.IHttpPromise<any>
      vacations(jobTypeId:string): ng.IHttpPromise<string>
    }


    export interface Contact {
      send(email: string, inquiry: string): ng.IHttpPromise<any>
    }
  }


  export module response {

    export module pagination {
      export interface PagingConditions {
        offset?: number;
        limit?: number;
      }
    }

    export module wrapper {
      export interface QueryResultResponse<T>{
        requestInfo : QueryRequestInfo
        resultInfo  : QueryResultInfo
        hits        : Array<T>
      }

      export interface QueryResultInfo {
        totalHits: number
      }

      export interface QueryRequestInfo {
        offset: number
        limit: number
      }
    }
    export module configuration {
      export interface ConfigResponse {
        configuration: Configration
      }
      export interface Configration {
        image: {
          rootPath: string
          maxNumberOf: number
        }
      }
    }

    export module utils {
      export interface HtmlText {
        htmlText: string
      }
    }

    export module account {
      export interface AccountInfoResponse {
        account: AccountInfo
        key: string
      }
      export interface AccountInfo {
        userId: string
        corporateId: string
        fullName: string
        email: string
        roles:string[]
      }
    }
    
    export module corporate {
      export interface CorporateInfo {
        name: string
      }
    }
    
    export module jobs {

      export interface JobListResponse {
        jobs: Job[]
      }

      export interface Job { //V2
        id: string;
        openedAt: string;
        closeAt: string;
        jobIdAlias: string;
        noEndDate: boolean;
        name: string;
        jobStatus?: string;
        jobType: string;
        versionNo: number;
        updatedBy: string;
        updatedAt: any; //TODO(kobayashi): [a] Dateにしたい
        content?: JobDetails;
        htmlFreeText?: string;
        coverImage: images.CoverImage;
        indexingStatus?: string;
        rejectReason?: string;
        jseJobPageUrl?: string;
        matchingSearchCond?: boolean; // 一覧表示時の絞り込み用
      }

      export interface JobWithApplicationCount extends Job {
        countAll?: number;
        countNoAction?: number;
        deadline?: string;
        byStage?: any;
      }

      export interface JobSearchParams {
        name?: string;
        jobStatus?: string;
        applicableStatus?: string;
        indexingStatus?: string;
      }

      export interface  JobDetails { //V2
        jobAdTitle: string;
        salary: JobSalary;
        locations: Array<JobLocation>;
        locationSupplement: String;
        descriptions: Array<JobTermDescription>;
        markdownFreeText?: string;
      }

      export interface JobSalary { //V2
        unit: string;
        amountFrom: number;
        amountTo: number;
        supplement: string;
      }

      export interface JobLocation { //V2
        postalCode: string;
        address: string;
      }

      export interface JobTermDescription { //V2
        term: string;
        description: string;
      }
    }

    export module interview {

      export interface InterviewSearchParams extends pagination.PagingConditions {
        interviewerId?: string; // ignored when querying one's own list
        interviewType?: string; // DOC = 書類選考 / INT = 面接 / 設定なし ＝両方
        keyword?      : string;
        from?         : any; // Date or String (in UTC/ISO-861)
        to?           : any; // Date or String (in UTC/ISO-861)
        feedback?     : string; // Y/N or none
      }

      export interface Interview {
        id?             : string;
        title           : string;
        startAt?        : string; //日時 in ISO/UTC
        endAt?          : string; //日時 in ISO/UTC
        place?          : string;
        note?           : string;
        interviewer?    : Interviewer;
        interviewType   : string;
        application?    : InterviewRefApplication;
        job?            : InterviewRefJob;
        feedbacks?      : Array<InterviewFeedback>;
        updatedBy?      : masters.UserIdName;
        updatedAt?      : string; //日時 in ISO/UTC
        applicationId?  : string; //更新時のみ
        versionNo?      : string;
      }

      export interface InterviewSummary {
        total           : number;
        interviews      : Array<Interview>
      }

      export interface Interviewer {
        name    : string;
        userId  : string; //NOTE(kitaly): null の場合有
      }

      export interface InterviewRefApplication {
        applicationId     : string;
        appliedAt         : string; //日時 in ISO/UTC
        fullName          : string;
        fullNameKana      : string;
        lastTitle         : string;
        lastOrganization  : string;
        phone             : string;
        email             : string;
        birthDate         : masters.YearMonthDay;
      }

      export interface InterviewRefJob {
        jobId       : string;
        jobName     : string;
        jobAdTitle  : string;
      }

      export interface InterviewFeedback {
        interviewId?   : string; //NOTE(kitaly): APIからのJSONには無いので、クライアント側で挿入する必要あり
        interviewType? : string;
        interviewTitle?: string;
        feedbackId?    : string;
        grade          : string;
        summary        : string;
        updatedBy?     : masters.UserIdName;
        updatedAt?     : string; //日時 in ISO/UTC
      }
    }

    export module applications {

      import UserIdName = masters.UserIdName
      import YearMonth = masters.YearMonth
      import YearMonthDay = masters.YearMonthDay

      export interface ApplicationOverviewsResponse { // V2
        overviews: ApplicationCountByJob[];
      }

      /**
       * 応募者詳細APIのレスポンス
       */
      export interface ApplicationResponse { // V2
        application: ApplicationInfo;
      }

      // 応募概況
      export interface ApplicationCountByJob {
        jobId: string;
        countAll: number;
        countNoAction: number;
        byStage: Map<string, number>;
      }

      export interface ApplicationSearchParams extends pagination.PagingConditions {
        keyword?: string;
        jobId?: string;
        statuses?: string; // TODO(omiend) 2.0.x :statusesはできれば複数選択にしたい
      }

      /**
       * 応募情報 (V2)
       */
      export interface ApplicationInfo {
        id: string;
        appliedAt         : Date;
        profile           : ApplicationProfile;
        resumeFreeText    : string;
        hasEmail          : boolean;
        hasPhone          : boolean;
        versionNo         : number;
        updatedBy         : UserIdName;
        updatedAt         : string;
        createdAt         : string;
        selectionStage    : string;
        applicationSource : string;
        message?          : string;
        resume?           : Resume;
        job?              : ApplicationJob;
        selectionHistory? : Array<ApplicationStatus>;
        notes?            : Array<ApplicationNote>;
        interviews?       : Array<interview.Interview>;
        attachments?      : Array<AttachmentInfo>;

        //更新時用
        attachmentIds?    : Array<AttachmentIdInfoAdd>; //新規作成時の添付ファイル追加用プロパティ
        addAttachmentIds? : Array<AttachmentIdInfoAdd>; //更新時の添付ファイル追加用プロパティ
        delAttachmentIds?  : Array<AttachmentIdInfoDelete>; //更新時の添付ファイル削除用プロパティ
      }

      /**
       * 応募者プロフィール (V2)
       */
      export interface ApplicationProfile {
        fullName: string;
        fullNameKana: string;
        lastOrganization?: string;
        lastTitle?: string;
        birthDate?: YearMonthDay;
        gender?: string;
        postalCode?: string;
        address1?: string;
        address2?: string;
        currentOccupation?: string;
        currentSalary?: string;
        email: string;
        phone: string;
      }

      /**
       * 選考ステータス (V2)
       */
      export interface ApplicationStatus {
        selectionStage: string;
        updatedBy: UserIdName;
        updatedAt: string;
      }

      /**
       * 添付アップロードAPIのレスポンス
       */
      export interface AttachmentInfo {
        s3Prefix    : string //既に応募に紐付けられている場合にのみ保持するプロパティ
        corporateId : string
        fileId      : string
        fileName    : string
        fileType    : string
        size        : number
        yearMonth   : string
      }

      /**
       * 応募追加 or 応募更新時に添付ファイルのマッピングを更新するために使用するオブジェクト
       */
      export interface AttachmentIdInfoAdd {
        fileId    : string
        yearMonth : string
      }

      /**
       * 応募更新時に添付ファイルのマッピングを削除するためのオブジェクト
       */
      export interface AttachmentIdInfoDelete {
        prefix    : string
        fileId    : string
      }

      /**
       * 応募先求人 (V2)
       */
      export interface ApplicationJob {
        jobId: string;
        jobName: string;
        jobAdTitle: string;
      }

      /**
       * 応募ノート (V2)
       */
      export interface ApplicationNote {
        noteId?    : string;
        userId?    : string;
        note       : string;
        isRecOnly  : boolean;
        updatedBy? : UserIdName;
        updatedAt? : string;
        createdAt? : string;
      }

      /**
       * 面接フィードバック
       */
      export interface ApplicationFeedback {
        updatedBy: UserIdName;
        updatedAt: string;
      }

      /**
       * 応募者のレジュメ情報
       */
      export interface Resume {
        education?: ResumeEducation[];
        work?: ResumeWork[];
        experiencedOccupations?: Occupation[];
        experiencedIndustries?: Industry[];
        certifications?: ResumeCertification[];
      }

      // 学歴
      export interface ResumeEducation {
        degree: string;
        schoolName: string;
        fieldOfStudy: string;
        status: string;
        startDate?: YearMonth;
        endDate?: YearMonth;
      }

      // 職歴
      export interface ResumeWork {
        company: string;
        title: string;
        employmentType: string;
        summary: string;
        startDate?: YearMonth;
        endDate?: YearMonth;
        salaryType?: string;
        salary?: number;
      }

      /**
       * 資格取得情報
       */
      export interface ResumeCertification {
        name: string;
        certifiedDate: YearMonth;
      }

      // 職種
      export interface Occupation {
        code: string;
        name: string;
      }

      // 業種
      export interface Industry {
        code: string;
        name: string;
      }
    }

    export module images {
  
      /**
       * 求人 to 画像 のマッピング等の更新に利用するためのオブジェクト
       */
      export interface ImageIdPrefix {
        imageId: string;
        prefix: string;
      }
      export interface CoverImage extends ImageIdPrefix{}
      export interface LogoImage extends ImageIdPrefix{}
      export interface InlineImage extends ImageIdPrefix{}
  
      /**
       * 画像一覧取得APIから取得した際の画像データ
       */
      export interface PooledImage {
        id              : string;
        name            : string;
        aspectRatioType : string;
        size            : number;
        imageType       : string;
        prefix          : string;
        deletable       : boolean;
      }
    }

    export module masters {

      /**
       * 年月
       */
      export interface YearMonth {
        year: number;
        month: number;
      }

      /**
       * 年月日
       */
      export interface YearMonthDay {
        year: number;
        month: number;
        day: number;
      }

      /**
       * ユーザー情報
       */
      export interface UserIdName {
        userId: string;
        name: string;
      }


      export interface HtmlText {
        htmlText: string;
      }

    }
  }
}

module stanby.services.common.routes {
  export function initRoutes(){

    angular.module('stanbyServices')
      .constant('FileUploadConfig', {
        headers: {"Content-Type": undefined},
        transformRequest: null
      })
      .factory('routes', function($http:ng.IHttpService, FileUploadConfig):any {

        return {
          configuration: {
            retrieve:         () => $http.get('/api/configuration')
          },

          utils: {
            convertMarkdownToHtml:(markdownText) => $http.post('/api/utils/markdown-to-html', {markdownText: markdownText})
          },

          jobs: {
            list: ()              => $http.get('/api/jobs'),
            findJobs: (conditions)  => $http.get('/api/jobs', {params: conditions}),
            detail: (jobId)       => $http.get(`/api/jobs/${jobId}`),
            create: (data)        => $http.post('/api/jobs', data),
            update: (jobId, data) => $http.put(`/api/jobs/${jobId}`, data),
            detailFreeText: (jobId)  => $http.get(`/api/jobs/${jobId}/free-text/html`),
            previewAsPc:      (data) => $http.post('/api/jobs/preview/pc', data),
            previewAsMobile:  (data) => $http.post('/api/jobs/preview/mobile', data),
            applyPublishing:   (jobId) => $http.put(`/api/jobs/${jobId}/publishing/apply`, {}),
            withdrawPublishing:(jobId) => $http.put(`/api/jobs/${jobId}/publishing/withdraw`, {}),
            cancelPublishing:  (jobId) => $http.put(`/api/jobs/${jobId}/publishing/cancel`, {}),
            updateClosingDay:  (jobId, closeAt) => $http.put(`/api/jobs/${jobId}/publishing/closingDay`, {closeAt: closeAt}),
            validateAlias:     (data) => $http.post('/api/jobs/validate-alias', data)
          },

          interviews: {
            listAll   : (conditions)    => $http.get('/api/interviews', {params: conditions}),
            listAllToday : (conditions) => $http.get('/api/interviews/today', {params: conditions}),
            listMine  : (conditions)    => $http.get('/api/interviews/mine', {params: conditions}),
            listMyUnrated : (conditions)  => $http.get('/api/interviews/myunrated', {params: conditions}),
            detail    : (id)            => $http.get(`/api/interviews/${id}`),
            create    : (interview)     => $http.post('/api/interviews', interview),
            update    : (id, interview) => $http.put(`/api/interviews/${id}`, interview),
            addFeedback  : (id, fb) => $http.post(`/api/interviews/${id}/feedbacks`, fb),
            updateFeedback: (id, fbId, fb) => $http.put(`/api/interviews/${id}/feedbacks/${fbId}`, fb)
          },

          docscreenings: {
            detail     : (id)            => $http.get(`/api/docscreening/${id}`),
            create     : (docscreening)     => $http.post('/api/docscreening', docscreening),
            update     : (id, docscreening) => $http.put(`/api/docscreening/${id}`, docscreening),
            feedback   : (id, docscreeningfeedback) => $http.post(`/api/docscreening/${id}/feedbacks`, docscreeningfeedback),
            addFeedback  : (id, fb) => $http.post(`/api/docscreening/${id}/feedbacks`, fb),
            updateFeedback: (id, fbId, fb) => $http.put(`/api/docscreening/${id}/feedbacks/${fbId}`, fb)
          },

          applications: {
            list:         (conditions)    => $http.get('/api/applications', {params: conditions}),
            overviews:    ()              => $http.get('/api/applications/overviews'),
            uploadTempFile: (data)        => $http.post(`/api/applications/attachments`, data, FileUploadConfig),
            details:      (applicationId) => $http.get(`/api/applications/${applicationId}`),
            fetchPhone:   (applicationId) => $http.get(`/api/applications/${applicationId}/phone`),
            fetchEmail:   (applicationId) => $http.get(`/api/applications/${applicationId}/email`),
            downloadAttachment: (applicationId, prefix, fileId) => $http.get(`api/applications/${applicationId}/attachments/${prefix}/${fileId}`),
            updateStatus: (applicationId, status, versionNo) => $http.put(`/api/applications/${applicationId}/status`, { selectionStage: status, versionNo: versionNo }),
            attachFile:   (applicationId, data) => $http.post(`/api/applications/${applicationId}/attachments`, data, FileUploadConfig),
            create:       (data)                => $http.post(`/api/applications`, data),
            update:       (applicationId, data) => $http.put(`/api/applications/${applicationId}`, data),
            addNote:      (id, data)            => $http.post(`/api/applications/${id}/notes`, data),
            updateNote:   (id, noteId, data)    => $http.put(`/api/applications/${id}/notes/${noteId}`, data)
          },

          corporate: {
            update: (data) => $http.put('/api/corporate', data),
            show:   ()     => $http.get('/api/corporate')
          },

          users: {
            list:         (status, role)  => $http.get('/api/corporate/users', {params: {status: status, role: role}}),
            details:      (userId)        => $http.get('/api/corporate/users/' + userId),
            loginUserDetails: ()          => $http.get('/api/corporate/users/loginUserDetails'),
            create:       (data)          => $http.post('/api/corporate/users', data),
            update:       (userId, data)  => $http.put('/api/corporate/users/' + userId, data),
            updateStatus: (userId, data)  => $http.put('/api/corporate/users/' + userId + '/status', data)
          },

          corporatePublic: {
            show:         () => $http.get('/api/corporate/public'),
            update:       (data) => $http.put('/api/corporate/public', data)
          },

          profile: {
            show:         () => $http.get('/api/profile/show'),
            update:       (data) => $http.put('/api/profile', data),
            changeEmail:  (data) => $http.put('/api/profile/email', data),
            changePassword: (data) => $http.put('/api/profile/password', data),
            resendConfirmation:  () => $http.post('/api/profile/resend-confirmation', {})
          },

          account: {
            login:                (data)   => $http.post('/api/account/login', data, {suppress401ErrorMsg : true}),
            logout:               ()       => $http.post('/api/account/logout', {}),
            signup:               (data)   => $http.post('/api/account/signup', data),
            forgotPassword:       (data)   => $http.post('/api/account/forgot-password', data),
            getAccountInfo:       ()       => $http.get('/api/account'),
            verifySignup:         (token)  => $http.get('/api/account/verify-signup/' + token),
            verifyEmailChange:    (token)  => $http.get('/api/account/verify-email-change/' + token),
            verifyForgotPassword: (token)  => $http.get('/api/account/verify-forgot-password/' + token),
            resetForgotPassword:  (data)   => $http.post('/api/account/reset-forgot-password', data)
          },

          images: {
            listLogos:     () => $http.get('/api/images/logo'),
            listCovers:    () => $http.get('/api/images/cover'),
            listInlines:   () => $http.get('/api/images/inline'),

            uploadLogo:   (data) => $http.post('/api/images/logo', data, FileUploadConfig),
            uploadCover:  (data) => $http.post('/api/images/cover', data, FileUploadConfig),
            uploadInline: (data) => $http.post('/api/images/inline', data, FileUploadConfig),

            deleteImage:  (imageId) => $http['delete'](`/api/images/${imageId}`), //NOTE(kitaly): IE8等でdeleteは予約語だと怒られるので

            getTemporary:  (imageId, yearMonth) => $http.get(`/api/tmp-images/${imageId}/` + yearMonth),

            uploadTemporaryLogo:    (data) => $http.post('/api/tmp-images/logo', data, FileUploadConfig),
            uploadTemporaryCover:   (data) => $http.post('/api/tmp-images/cover', data, FileUploadConfig),
            uploadTemporaryInline:  (data) => $http.post('/api/tmp-images/inline', data, FileUploadConfig)
          },

          validation: {
            emailDuplicate:     (data) => $http.post('/api/validation/email-duplicate', {'email':data}),
            emailDuplicateForUpdate:     (newEmail, currentEmail) => $http.post('/api/validation/email-duplicate-for-update', {'newEmail':newEmail, 'currentEmail':currentEmail}),
            postalCode:         (data) => $http.post('/api/validation/postal-code', {'postalCode': data}),
            phone:              (data) => $http.post('/api/validation/phone', {'phone': data})
          },

          masters: {
            address:             (postalCode) => $http.get(`/api/masters/address/${postalCode}`)
          },

          contact: {
            send: (email, inquiry) => $http.post('/api/contact', {'email': email, 'inquiry': inquiry})
          }
        };
      });
  }
}
