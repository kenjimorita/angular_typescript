/// <reference path="../vendor_def/tsd.d.ts" />
/// <reference path="../services/common/routes.ts" />
/// <reference path="../utils/date.ts" />

module controllers.dashboard {

  import UserOverview = stanby.models.users.UserOverview;
  import UserListResponse = stanby.models.users.UserListResponse;

  export class Dashboard {
    public account: st.response.account.AccountInfo;
    public hasAdminRole = false;
    public hasRecruiterRole = false;
    public hasInterviewerRole = false;

    constructor (
      private accountPromise,
      private profilePromise,
      private enums: sb.Enums,
      private stUtils: std.Utils,
      private $document: any
    ) {}

    init(): void {
      if (this.accountPromise) {
        this.account = this.accountPromise.data.account;
        this.hasAdminRole = _.contains(this.account.roles, this.enums.userRole.ADM.code);
        this.hasRecruiterRole = _.contains(this.account.roles, this.enums.userRole.REC.code);
        this.hasInterviewerRole = _.contains(this.account.roles, this.enums.userRole.INT.code);
      }
      if (this.profilePromise && !this.$document.context.referrer.match('signup')) {
        if (this.profilePromise.data.corpUser.status.name === this.enums.userStatus.REG) {
          this.stUtils.toastWarning('メールアドレス認証が完了していません。<br/>認証メールの再送は<a href="/profile#/">アカウント設定画面</a>よりおこなえます。');
        }
      }
    }
  }

  export class DashboardSummary {
    public account: st.response.account.AccountInfo;
    public corporate: st.response.corporate.CorporateInfo;

    // this filters jobs on jobStatus == 'PUB'
    public jobsRecruiting: Array<st.response.jobs.Job>;
    // this filters all interviews that are due today
    public interviewsToday: Array<st.response.interview.Interview>;
    public interviewsTodayCount: number;
    // this filters my interviews with no feedback
    public interviewsUnrated: Array<st.response.interview.Interview>;
    public interviewsUnratedCount: number;
    // this filters my interviews with no feedback and interviewType = 'DOC'
    public docscreeningsUnrated: Array<st.response.interview.Interview>;
    public docscreeningsUnratedCount: number;

    public isoDateNow: string;
    public hasAdminRole = false;
    public hasRecruiterRole = false;
    public hasInterviewerRole = false;

    public numOfJobsWithNoActionApplications: number;
    public numOfNoActionApplications: number;


    constructor (
      private enums: sb.Enums,
      private corporatePromise,
      private accountPromise,
      private interviewsMyUnratedPromise,
      private interviewsTodayPromise,
      private jobsPublishedPromise,
      private docscreeningsPromise,
      private jobApplicationCountsPromise: ng.IHttpPromiseCallbackArg<st.response.applications.ApplicationOverviewsResponse>
    ) {}

    init(): void {
      if (this.accountPromise) {
        this.account = this.accountPromise.data.account;
        this.corporate = this.corporatePromise.data;
        this.hasAdminRole = _.contains(this.account.roles, this.enums.userRole.ADM.code);
        this.hasRecruiterRole = _.contains(this.account.roles, this.enums.userRole.REC.code);
        this.hasInterviewerRole = _.contains(this.account.roles, this.enums.userRole.INT.code);
      }

      if (this.jobsPublishedPromise) {
        this.jobsRecruiting = this.jobsPublishedPromise.data.jobs;
      }

      if (this.interviewsMyUnratedPromise) {
        this.interviewsUnrated = this.interviewsMyUnratedPromise.data.hits;
        this.interviewsUnratedCount = this.interviewsMyUnratedPromise.data.resultInfo.totalHits;
      }

      if (this.interviewsTodayPromise) {
        this.interviewsToday = this.interviewsTodayPromise.data.hits;
        this.interviewsTodayCount = this.interviewsTodayPromise.data.resultInfo.totalHits;
      }

      if (this.docscreeningsPromise) {
        this.docscreeningsUnrated = this.docscreeningsPromise.data.hits;
        this.docscreeningsUnratedCount = this.docscreeningsPromise.data.resultInfo.totalHits;
      }

      if (this.jobApplicationCountsPromise && this.jobApplicationCountsPromise.data.overviews && this.jobApplicationCountsPromise.data.overviews.length > 0){
        var overviews = this.jobApplicationCountsPromise.data.overviews;
        this.numOfJobsWithNoActionApplications = _.reduce(_.map(overviews, (byJob) => {
          return (byJob.countNoAction > 0 ? 1 : 0);
        }), (acc: number, curr: number) => {
          return acc + curr;
        });

        this.numOfNoActionApplications = _.reduce(_.map(overviews, (byJob) => {
          return byJob.countNoAction;
        }), (acc: number, curr: number) => {
          return acc + curr;
        });
      } else {
        this.numOfJobsWithNoActionApplications = 0;
        this.numOfNoActionApplications = 0;
      }

      this.isoDateNow = (new Date()).toISOString();
    }

    /**
     * ISO形式の日時から曜日文字を取得
     */
    public getWeekdayByDate(isoDateTarget: string): string {
      var
        dateTarget = new Date(isoDateTarget),
        indexWeekday = dateTarget.getDay();

      return ['日', '月', '火', '水', '木', '金', '土'][indexWeekday];
    }

    /**
     * 本日の面接一覧URLのためにパラメータを作成して取得
     */
    public getTodayParams(): string {
      return '?limit=20&interviewType=INT&from=' + utils.date.getDateTimeStartISOString() + '&to='
          + utils.date.getDateTimeEndISOString();
    }
  }

  export class DashboardInterviewsUnrated {
    public interviewsUnrated: Array<st.response.interview.Interview>;
    public interviewsUnratedCount: number;

    constructor (
      private interviewsMyUnratedPromise
    ) {}

    init(): void {
      if (this.interviewsMyUnratedPromise) {
        this.interviewsUnrated = this.interviewsMyUnratedPromise.data.hits;
        this.interviewsUnratedCount = this.interviewsMyUnratedPromise.data.resultInfo.totalHits;
      }
    }
  }

  export class DashboardDocscreeningsUnrated {
    public docscreeningsUnrated: Array<st.response.interview.Interview>;
    public docscreeningsUnratedCount: number;

    constructor (
      private docscreeningsPromise
    ) {}

    init(): void {
      if (this.docscreeningsPromise) {
        this.docscreeningsUnrated = this.docscreeningsPromise.data.hits;
        this.docscreeningsUnratedCount = this.docscreeningsPromise.data.resultInfo.totalHits;
      }
    }

    /**
     * (filter用)
     * 更新日時が当日の場合は時間のフォーマット、
     * 別日の場合は日付のフォーマットを取得。
     */
    public getFormatByUpdatedAt(updatedAt: string): string {
      var
        isSameDate = false,
        dateTarget = new Date(updatedAt),
        dateNow = new Date();

      dateTarget.setHours(0, 0, 0, 0);
      dateNow.setHours(0, 0, 0, 0);

      isSameDate = (dateTarget.getTime() === dateNow.getTime());

      if (isSameDate) {
        return 'HH:mm';
      } else {
        return 'yyyy/MM/dd';
      }
    }
  }

  export class DashboardJobApplicationCounts {
    public jobsRecruiting: Array<st.response.jobs.JobWithApplicationCount>;

    constructor (
      private jobsPublishedPromise,
      private jobApplicationCountsPromise,
      private _:_.LoDashStatic
    ) {}

    init(): void {
      var mergeToJobs = () => {
        this.jobsRecruiting = _.map(this.jobsPublishedPromise.data.jobs, (job: st.response.jobs.JobWithApplicationCount) => {
          var zeroCounts = {"NOA":0, "SCR":0, "PRG":0, "OFR":0, "RJC":0, "DEC":0};
          var found = _.find<st.response.applications.ApplicationCountByJob>(
              this.jobApplicationCountsPromise.data.overviews, (ac) => {
            return ac.jobId === job.id;
          });
          if (found) {
            job.countAll = found.countAll;
            job.countNoAction = found.countNoAction;
            job.byStage = this._.merge(zeroCounts, found.byStage);
          } else {
            job.countAll = job.countNoAction = 0;
            job.byStage = zeroCounts;
          }
          return job;
        });
      };

      mergeToJobs();
    }

    public countAll(): number {
      return this._.reduce(this.jobsRecruiting, (total, job) => {
        return total + (job.countAll || 0);
      }, 0);
    }
  }

  export class DashboardInterviewsToday {
    public interviewsToday: Array<st.response.interview.Interview>;
    public interviewsTodayCount: number;

    constructor (
      // NOTE: thrbrd: 採用担当限定の機能なので、全面接を取得
      private interviewsTodayPromise
    ) {}

    init(): void {
      if (this.interviewsTodayPromise) {
        this.interviewsToday = this.interviewsTodayPromise.data.hits;
        this.interviewsTodayCount = this.interviewsTodayPromise.data.resultInfo.totalHits;
      }
    }

    /**
     * 本日の面接一覧URLのためにパラメータを作成して取得
     */
    public getTodayParams(): string {
      return '?limit=20&interviewType=INT&from=' + utils.date.getDateTimeStartISOString()
          + '&to=' + utils.date.getDateTimeEndISOString();
    }
  }

  export class DashboardAccount {
    public users: UserListResponse;

    constructor (
        private usersPromise
    ) {}

    init(): void {
      if (this.usersPromise) {
        this.users = this.usersPromise.data.users;
      }
    }
  }

  export class DashboardSide {
    public account: st.response.account.AccountInfo;
    public users: Array<UserOverview>;
    public usersRecruiter: Array<UserOverview>;
    public jobsReady: Array<st.response.jobs.Job>;
    public hasAdminRole = false;
    public hasRecruiterRole = false;
    public hasInterviewerRole = false;

    constructor (
      private enums: sb.Enums,
      private accountPromise,
      private usersPromise,
      private jobsReadyPromise
    ) {}

    init(): void {
      if (this.accountPromise) {
        this.account = this.accountPromise.data.account;
        this.hasAdminRole = _.contains(this.account.roles, this.enums.userRole.ADM.code);
        this.hasRecruiterRole = _.contains(this.account.roles, this.enums.userRole.REC.code);
        this.hasInterviewerRole = _.contains(this.account.roles, this.enums.userRole.INT.code);
      }

      if (this.usersPromise) {
        this.users = this.usersPromise.data.users;
        this.usersRecruiter = this.users;
      }

      if (this.jobsReadyPromise) {
        this.jobsReady = this.jobsReadyPromise.data.jobs;
      }
    }
  }
}

module stanby.routing.dashboard {

  import UserListResponse = stanby.models.users.UserListResponse;
  import UserDetailResponse = stanby.models.users.UserDetailResponse;

  export function initRouting(){

    angular.module('stanbyControllers')
      /* ========= Controllers ========= */
      .controller('DashboardCtrl', controllers.dashboard.Dashboard)
      .controller('DashboardSummaryCtrl', controllers.dashboard.DashboardSummary)
      .controller('DashboardInterviewsUnratedCtrl', controllers.dashboard.DashboardInterviewsUnrated)
      .controller('DashboardDocscreeningsUnratedCtrl', controllers.dashboard.DashboardDocscreeningsUnrated)
      .controller('DashboardJobApplicationCountsCtrl', controllers.dashboard.DashboardJobApplicationCounts)
      .controller('DashboardInterviewsTodayCtrl', controllers.dashboard.DashboardInterviewsToday)
      .controller('DashboardAccountCtrl', controllers.dashboard.DashboardAccount)
      .controller('DashboardSideCtrl', controllers.dashboard.DashboardSide)

      .config(($stateProvider, $urlRouterProvider, enums: sb.Enums) => {
        $urlRouterProvider.otherwise('/');

        $stateProvider.state('dashboard', {
          url: '/',
          views: {
            '': {
              templateUrl: '/internal/controllers/dashboard/base',
              controller: 'DashboardCtrl as c'
            },
            'summary@dashboard': {
              templateUrl: '/internal/controllers/dashboard/summary',
              controller: 'DashboardSummaryCtrl as smc'
            },
            'interviews-unrated@dashboard': {
              templateUrl: '/internal/controllers/dashboard/interviews-unrated',
              controller: 'DashboardInterviewsUnratedCtrl as iuc'
            },
            'docscreenings-unrated@dashboard': {
              templateUrl: '/internal/controllers/dashboard/docscreenings-unrated',
              controller: 'DashboardDocscreeningsUnratedCtrl as duc'
            },
            'job-application-counts@dashboard': {
              templateUrl: '/internal/controllers/dashboard/job-application-counts',
              controller: 'DashboardJobApplicationCountsCtrl as jac'
            },
            'interviews-today@dashboard': {
              templateUrl: '/internal/controllers/dashboard/interviews-today',
              controller: 'DashboardInterviewsTodayCtrl as itc'
            },
            'account@dashboard': {
              templateUrl: '/internal/controllers/dashboard/account',
              controller: 'DashboardAccountCtrl as acc'
            },
            'side@dashboard': {
              templateUrl: '/internal/controllers/dashboard/side',
              controller: 'DashboardSideCtrl as sdc'
            }
          },
          resolve: {
            accountPromise: function (routes: st.Routes): ng.IPromise<st.response.account.AccountInfoResponse> {
              return routes.account.getAccountInfo();
            },
            corporatePromise: function (routes: st.Routes): ng.IPromise<st.response.corporate.CorporateInfo> {
              return routes.corporatePublic.show();
            },
            interviewsMyUnratedPromise: function(routes: st.Routes, accountPromise): ng.IPromise<st.response.interview.Interview> {
              if (_.contains(accountPromise.data.account.roles, enums.userRole.INT.code)) {
                return routes.interviews.listMyUnrated({interviewType: enums.userRole.INT.code});
              } else {
                return null;
              }
            },
            interviewsTodayPromise: function(routes: st.Routes, accountPromise): ng.IPromise<st.response.interview.Interview> {
              if (_.contains(accountPromise.data.account.roles, enums.userRole.REC.code)) {
                return routes.interviews.listAllToday({
                  interviewType: enums.userRole.INT.code,
                  from: utils.date.getDateTimeStartISOString(),
                  to: utils.date.getDateTimeEndISOString()
                });
              }
              else {
                return null;
              }
            },
            docscreeningsPromise: function (routes: st.Routes, accountPromise): ng.IPromise<st.response.interview.Interview> {
              if (_.contains(accountPromise.data.account.roles, enums.userRole.INT.code)) {
                return routes.interviews.listMyUnrated({interviewType: enums.interviewType.DOC.code});
              } else {
                return null;
              }
            },
            jobsPublishedPromise: function (routes: st.Routes, accountPromise): ng.IPromise<st.response.jobs.JobListResponse> {
              if (_.contains(accountPromise.data.account.roles, enums.userRole.REC.code)) {
                return routes.jobs.findJobs({jobStatus: enums.jobStatus.PUB.code});
              }
              else {
                return null;
              }
            },
            jobsReadyPromise: function (routes: st.Routes, accountPromise): ng.IPromise<st.response.jobs.JobListResponse> {
              if (_.contains(accountPromise.data.account.roles, enums.userRole.REC.code)) {
                return routes.jobs.findJobs({jobStatus: enums.jobStatus.RDY.code});
              }
              else {
                return null;
              }
            },
            jobApplicationCountsPromise: function (routes: st.Routes, accountPromise): ng.IPromise<st.response.applications.ApplicationOverviewsResponse> {
              if (_.contains(accountPromise.data.account.roles, enums.userRole.REC.code)) {
                return routes.applications.overviews();
              } else {
                return null;
              }
            },
            usersPromise: function (routes: st.Routes, accountPromise): ng.IPromise<UserListResponse> {
              if (_.contains(accountPromise.data.account.roles, enums.userRole.REC.code) || _.contains(accountPromise.data.account.roles, enums.userRole.INT.code)) {
                return routes.users.list(null, null);
              } else {
                return null;
              }
            },
            profilePromise: function (routes: st.Routes): ng.IPromise<UserDetailResponse> {
              return routes.users.loginUserDetails();
            }
          },
          onEnter: ($rootScope) => {
            $rootScope.$emit('breadcrumbs', [
              { url: '', text: 'Stanby Recruiting' }
            ]);
          }
        });
      });
  }
}
