var stb;
(function (stb) {
    'use strict';
    var ConfigService = (function () {
        function ConfigService(routes) {
            this.routes = routes;
            this.requestCount = 0;
        }
        ConfigService.prototype.getConfig = function (callback) {
            if (this.requestCount == 0) {
                this.refreshConfig();
            }
            this.cachedPromise.success(function (res) {
                if (callback)
                    callback(res);
            });
        };
        ConfigService.prototype.getConfigPromise = function () {
            if (this.requestCount == 0) {
                this.refreshConfig();
            }
            return this.cachedPromise;
        };
        ConfigService.prototype.refreshConfig = function () {
            this.cachedPromise = this.routes.configuration.retrieve();
        };
        return ConfigService;
    })();
    stb.ConfigService = ConfigService;
    var UserService = (function () {
        function UserService(routes) {
            this.routes = routes;
            this.requestCount = 0;
        }
        UserService.prototype.checkLogin = function (ifLogged, ifNotLogged) {
            if (this.requestCount == 0) {
                this.refreshAccountInfo();
            }
            this.checkLoggedIn(ifLogged, ifNotLogged);
        };
        UserService.prototype.getAccountInfoPromise = function () {
            return this.cachedPromise.then(function (res) {
                return res.data.account;
            });
        };
        UserService.prototype.getAccountInfo = function (ifLoggedInFunction) {
            if (this.requestCount == 0) {
                this.refreshAccountInfo();
            }
            this.checkLoggedIn(ifLoggedInFunction, null);
        };
        UserService.prototype.updateAccountInfo = function (ifLoggedInFunction) {
            this.refreshAccountInfo();
            this.checkLoggedIn(ifLoggedInFunction, null);
        };
        UserService.prototype.refreshAccountInfo = function () {
            this.requestCount++;
            this.cachedPromise = this.routes.account.getAccountInfo();
        };
        UserService.prototype.checkLoggedIn = function (ifLoggedInFunction, ifNotLoggedInFunction) {
            this.cachedPromise.success(function (data) {
                if (data.key === "error.authentication" && ifNotLoggedInFunction) {
                    ifNotLoggedInFunction();
                }
                else if (ifLoggedInFunction) {
                    ifLoggedInFunction(data);
                }
            });
        };
        return UserService;
    })();
    stb.UserService = UserService;
})(stb || (stb = {}));
var st;
(function (st) {
    'use strict';
})(st || (st = {}));
var stanby;
(function (stanby) {
    var services;
    (function (services) {
        var common;
        (function (common) {
            var routes;
            (function (routes) {
                function initRoutes() {
                    angular.module('stanbyServices').constant('FileUploadConfig', {
                        headers: { "Content-Type": undefined },
                        transformRequest: null
                    }).factory('routes', function ($http, FileUploadConfig) {
                        return {
                            configuration: {
                                retrieve: function () { return $http.get('/api/configuration'); }
                            },
                            utils: {
                                convertMarkdownToHtml: function (markdownText) { return $http.post('/api/utils/markdown-to-html', { markdownText: markdownText }); }
                            },
                            jobs: {
                                list: function () { return $http.get('/api/jobs'); },
                                findJobs: function (conditions) { return $http.get('/api/jobs', { params: conditions }); },
                                detail: function (jobId) { return $http.get("/api/jobs/" + jobId); },
                                create: function (data) { return $http.post('/api/jobs', data); },
                                update: function (jobId, data) { return $http.put("/api/jobs/" + jobId, data); },
                                detailFreeText: function (jobId) { return $http.get("/api/jobs/" + jobId + "/free-text/html"); },
                                previewAsPc: function (data) { return $http.post('/api/jobs/preview/pc', data); },
                                previewAsMobile: function (data) { return $http.post('/api/jobs/preview/mobile', data); },
                                applyPublishing: function (jobId) { return $http.put("/api/jobs/" + jobId + "/publishing/apply", {}); },
                                withdrawPublishing: function (jobId) { return $http.put("/api/jobs/" + jobId + "/publishing/withdraw", {}); },
                                cancelPublishing: function (jobId) { return $http.put("/api/jobs/" + jobId + "/publishing/cancel", {}); },
                                updateClosingDay: function (jobId, closeAt) { return $http.put("/api/jobs/" + jobId + "/publishing/closingDay", { closeAt: closeAt }); },
                                validateAlias: function (data) { return $http.post('/api/jobs/validate-alias', data); }
                            },
                            interviews: {
                                listAll: function (conditions) { return $http.get('/api/interviews', { params: conditions }); },
                                listAllToday: function (conditions) { return $http.get('/api/interviews/today', { params: conditions }); },
                                listMine: function (conditions) { return $http.get('/api/interviews/mine', { params: conditions }); },
                                listMyUnrated: function (conditions) { return $http.get('/api/interviews/myunrated', { params: conditions }); },
                                detail: function (id) { return $http.get("/api/interviews/" + id); },
                                create: function (interview) { return $http.post('/api/interviews', interview); },
                                update: function (id, interview) { return $http.put("/api/interviews/" + id, interview); },
                                addFeedback: function (id, fb) { return $http.post("/api/interviews/" + id + "/feedbacks", fb); },
                                updateFeedback: function (id, fbId, fb) { return $http.put("/api/interviews/" + id + "/feedbacks/" + fbId, fb); }
                            },
                            docscreenings: {
                                detail: function (id) { return $http.get("/api/docscreening/" + id); },
                                create: function (docscreening) { return $http.post('/api/docscreening', docscreening); },
                                update: function (id, docscreening) { return $http.put("/api/docscreening/" + id, docscreening); },
                                feedback: function (id, docscreeningfeedback) { return $http.post("/api/docscreening/" + id + "/feedbacks", docscreeningfeedback); },
                                addFeedback: function (id, fb) { return $http.post("/api/docscreening/" + id + "/feedbacks", fb); },
                                updateFeedback: function (id, fbId, fb) { return $http.put("/api/docscreening/" + id + "/feedbacks/" + fbId, fb); }
                            },
                            applications: {
                                list: function (conditions) { return $http.get('/api/applications', { params: conditions }); },
                                overviews: function () { return $http.get('/api/applications/overviews'); },
                                uploadTempFile: function (data) { return $http.post("/api/applications/attachments", data, FileUploadConfig); },
                                details: function (applicationId) { return $http.get("/api/applications/" + applicationId); },
                                fetchPhone: function (applicationId) { return $http.get("/api/applications/" + applicationId + "/phone"); },
                                fetchEmail: function (applicationId) { return $http.get("/api/applications/" + applicationId + "/email"); },
                                downloadAttachment: function (applicationId, prefix, fileId) { return $http.get("api/applications/" + applicationId + "/attachments/" + prefix + "/" + fileId); },
                                updateStatus: function (applicationId, status, versionNo) { return $http.put("/api/applications/" + applicationId + "/status", { selectionStage: status, versionNo: versionNo }); },
                                attachFile: function (applicationId, data) { return $http.post("/api/applications/" + applicationId + "/attachments", data, FileUploadConfig); },
                                create: function (data) { return $http.post("/api/applications", data); },
                                update: function (applicationId, data) { return $http.put("/api/applications/" + applicationId, data); },
                                addNote: function (id, data) { return $http.post("/api/applications/" + id + "/notes", data); },
                                updateNote: function (id, noteId, data) { return $http.put("/api/applications/" + id + "/notes/" + noteId, data); }
                            },
                            corporate: {
                                update: function (data) { return $http.put('/api/corporate', data); },
                                show: function () { return $http.get('/api/corporate'); }
                            },
                            users: {
                                list: function (status, role) { return $http.get('/api/corporate/users', { params: { status: status, role: role } }); },
                                details: function (userId) { return $http.get('/api/corporate/users/' + userId); },
                                loginUserDetails: function () { return $http.get('/api/corporate/users/loginUserDetails'); },
                                create: function (data) { return $http.post('/api/corporate/users', data); },
                                update: function (userId, data) { return $http.put('/api/corporate/users/' + userId, data); },
                                updateStatus: function (userId, data) { return $http.put('/api/corporate/users/' + userId + '/status', data); }
                            },
                            corporatePublic: {
                                show: function () { return $http.get('/api/corporate/public'); },
                                update: function (data) { return $http.put('/api/corporate/public', data); }
                            },
                            profile: {
                                show: function () { return $http.get('/api/profile/show'); },
                                update: function (data) { return $http.put('/api/profile', data); },
                                changeEmail: function (data) { return $http.put('/api/profile/email', data); },
                                changePassword: function (data) { return $http.put('/api/profile/password', data); },
                                resendConfirmation: function () { return $http.post('/api/profile/resend-confirmation', {}); }
                            },
                            account: {
                                login: function (data) { return $http.post('/api/account/login', data, { suppress401ErrorMsg: true }); },
                                logout: function () { return $http.post('/api/account/logout', {}); },
                                signup: function (data) { return $http.post('/api/account/signup', data); },
                                forgotPassword: function (data) { return $http.post('/api/account/forgot-password', data); },
                                getAccountInfo: function () { return $http.get('/api/account'); },
                                verifySignup: function (token) { return $http.get('/api/account/verify-signup/' + token); },
                                verifyEmailChange: function (token) { return $http.get('/api/account/verify-email-change/' + token); },
                                verifyForgotPassword: function (token) { return $http.get('/api/account/verify-forgot-password/' + token); },
                                resetForgotPassword: function (data) { return $http.post('/api/account/reset-forgot-password', data); }
                            },
                            images: {
                                listLogos: function () { return $http.get('/api/images/logo'); },
                                listCovers: function () { return $http.get('/api/images/cover'); },
                                listInlines: function () { return $http.get('/api/images/inline'); },
                                uploadLogo: function (data) { return $http.post('/api/images/logo', data, FileUploadConfig); },
                                uploadCover: function (data) { return $http.post('/api/images/cover', data, FileUploadConfig); },
                                uploadInline: function (data) { return $http.post('/api/images/inline', data, FileUploadConfig); },
                                deleteImage: function (imageId) { return $http['delete']("/api/images/" + imageId); },
                                getTemporary: function (imageId, yearMonth) { return $http.get(("/api/tmp-images/" + imageId + "/") + yearMonth); },
                                uploadTemporaryLogo: function (data) { return $http.post('/api/tmp-images/logo', data, FileUploadConfig); },
                                uploadTemporaryCover: function (data) { return $http.post('/api/tmp-images/cover', data, FileUploadConfig); },
                                uploadTemporaryInline: function (data) { return $http.post('/api/tmp-images/inline', data, FileUploadConfig); }
                            },
                            validation: {
                                emailDuplicate: function (data) { return $http.post('/api/validation/email-duplicate', { 'email': data }); },
                                emailDuplicateForUpdate: function (newEmail, currentEmail) { return $http.post('/api/validation/email-duplicate-for-update', { 'newEmail': newEmail, 'currentEmail': currentEmail }); },
                                postalCode: function (data) { return $http.post('/api/validation/postal-code', { 'postalCode': data }); },
                                phone: function (data) { return $http.post('/api/validation/phone', { 'phone': data }); }
                            },
                            masters: {
                                address: function (postalCode) { return $http.get("/api/masters/address/" + postalCode); }
                            },
                            contact: {
                                send: function (email, inquiry) { return $http.post('/api/contact', { 'email': email, 'inquiry': inquiry }); }
                            }
                        };
                    });
                }
                routes.initRoutes = initRoutes;
            })(routes = common.routes || (common.routes = {}));
        })(common = services.common || (services.common = {}));
    })(services = stanby.services || (stanby.services = {}));
})(stanby || (stanby = {}));

var utils;
(function (utils) {
    var date;
    (function (_date) {
        function getDateTimeStartISOString() {
            var date = new Date();
            date.setHours(0, 0, 0, 0);
            return date.toISOString();
        }
        _date.getDateTimeStartISOString = getDateTimeStartISOString;
        function getDateTimeEndISOString() {
            var date = new Date();
            date.setHours(23, 59, 59, 999);
            return date.toISOString();
        }
        _date.getDateTimeEndISOString = getDateTimeEndISOString;
    })(date = utils.date || (utils.date = {}));
})(utils || (utils = {}));

var controllers;
(function (controllers) {
    var dashboard;
    (function (dashboard) {
        var Dashboard = (function () {
            function Dashboard(accountPromise, profilePromise, enums, stUtils, $document) {
                this.accountPromise = accountPromise;
                this.profilePromise = profilePromise;
                this.enums = enums;
                this.stUtils = stUtils;
                this.$document = $document;
                this.hasAdminRole = false;
                this.hasRecruiterRole = false;
                this.hasInterviewerRole = false;
            }
            Dashboard.prototype.init = function () {
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
            };
            return Dashboard;
        })();
        dashboard.Dashboard = Dashboard;
        var DashboardSummary = (function () {
            function DashboardSummary(enums, corporatePromise, accountPromise, interviewsMyUnratedPromise, interviewsTodayPromise, jobsPublishedPromise, docscreeningsPromise, jobApplicationCountsPromise) {
                this.enums = enums;
                this.corporatePromise = corporatePromise;
                this.accountPromise = accountPromise;
                this.interviewsMyUnratedPromise = interviewsMyUnratedPromise;
                this.interviewsTodayPromise = interviewsTodayPromise;
                this.jobsPublishedPromise = jobsPublishedPromise;
                this.docscreeningsPromise = docscreeningsPromise;
                this.jobApplicationCountsPromise = jobApplicationCountsPromise;
                this.hasAdminRole = false;
                this.hasRecruiterRole = false;
                this.hasInterviewerRole = false;
            }
            DashboardSummary.prototype.init = function () {
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
                if (this.jobApplicationCountsPromise && this.jobApplicationCountsPromise.data.overviews && this.jobApplicationCountsPromise.data.overviews.length > 0) {
                    var overviews = this.jobApplicationCountsPromise.data.overviews;
                    this.numOfJobsWithNoActionApplications = _.reduce(_.map(overviews, function (byJob) {
                        return (byJob.countNoAction > 0 ? 1 : 0);
                    }), function (acc, curr) {
                        return acc + curr;
                    });
                    this.numOfNoActionApplications = _.reduce(_.map(overviews, function (byJob) {
                        return byJob.countNoAction;
                    }), function (acc, curr) {
                        return acc + curr;
                    });
                }
                else {
                    this.numOfJobsWithNoActionApplications = 0;
                    this.numOfNoActionApplications = 0;
                }
                this.isoDateNow = (new Date()).toISOString();
            };
            DashboardSummary.prototype.getWeekdayByDate = function (isoDateTarget) {
                var dateTarget = new Date(isoDateTarget), indexWeekday = dateTarget.getDay();
                return ['日', '月', '火', '水', '木', '金', '土'][indexWeekday];
            };
            DashboardSummary.prototype.getTodayParams = function () {
                return '?limit=20&interviewType=INT&from=' + utils.date.getDateTimeStartISOString() + '&to=' + utils.date.getDateTimeEndISOString();
            };
            return DashboardSummary;
        })();
        dashboard.DashboardSummary = DashboardSummary;
        var DashboardInterviewsUnrated = (function () {
            function DashboardInterviewsUnrated(interviewsMyUnratedPromise) {
                this.interviewsMyUnratedPromise = interviewsMyUnratedPromise;
            }
            DashboardInterviewsUnrated.prototype.init = function () {
                if (this.interviewsMyUnratedPromise) {
                    this.interviewsUnrated = this.interviewsMyUnratedPromise.data.hits;
                    this.interviewsUnratedCount = this.interviewsMyUnratedPromise.data.resultInfo.totalHits;
                }
            };
            return DashboardInterviewsUnrated;
        })();
        dashboard.DashboardInterviewsUnrated = DashboardInterviewsUnrated;
        var DashboardDocscreeningsUnrated = (function () {
            function DashboardDocscreeningsUnrated(docscreeningsPromise) {
                this.docscreeningsPromise = docscreeningsPromise;
            }
            DashboardDocscreeningsUnrated.prototype.init = function () {
                if (this.docscreeningsPromise) {
                    this.docscreeningsUnrated = this.docscreeningsPromise.data.hits;
                    this.docscreeningsUnratedCount = this.docscreeningsPromise.data.resultInfo.totalHits;
                }
            };
            DashboardDocscreeningsUnrated.prototype.getFormatByUpdatedAt = function (updatedAt) {
                var isSameDate = false, dateTarget = new Date(updatedAt), dateNow = new Date();
                dateTarget.setHours(0, 0, 0, 0);
                dateNow.setHours(0, 0, 0, 0);
                isSameDate = (dateTarget.getTime() === dateNow.getTime());
                if (isSameDate) {
                    return 'HH:mm';
                }
                else {
                    return 'yyyy/MM/dd';
                }
            };
            return DashboardDocscreeningsUnrated;
        })();
        dashboard.DashboardDocscreeningsUnrated = DashboardDocscreeningsUnrated;
        var DashboardJobApplicationCounts = (function () {
            function DashboardJobApplicationCounts(jobsPublishedPromise, jobApplicationCountsPromise, _) {
                this.jobsPublishedPromise = jobsPublishedPromise;
                this.jobApplicationCountsPromise = jobApplicationCountsPromise;
                this._ = _;
            }
            DashboardJobApplicationCounts.prototype.init = function () {
                var _this = this;
                var mergeToJobs = function () {
                    _this.jobsRecruiting = _.map(_this.jobsPublishedPromise.data.jobs, function (job) {
                        var zeroCounts = { "NOA": 0, "SCR": 0, "PRG": 0, "OFR": 0, "RJC": 0, "DEC": 0 };
                        var found = _.find(_this.jobApplicationCountsPromise.data.overviews, function (ac) {
                            return ac.jobId === job.id;
                        });
                        if (found) {
                            job.countAll = found.countAll;
                            job.countNoAction = found.countNoAction;
                            job.byStage = _this._.merge(zeroCounts, found.byStage);
                        }
                        else {
                            job.countAll = job.countNoAction = 0;
                            job.byStage = zeroCounts;
                        }
                        return job;
                    });
                };
                mergeToJobs();
            };
            DashboardJobApplicationCounts.prototype.countAll = function () {
                return this._.reduce(this.jobsRecruiting, function (total, job) {
                    return total + (job.countAll || 0);
                }, 0);
            };
            return DashboardJobApplicationCounts;
        })();
        dashboard.DashboardJobApplicationCounts = DashboardJobApplicationCounts;
        var DashboardInterviewsToday = (function () {
            function DashboardInterviewsToday(interviewsTodayPromise) {
                this.interviewsTodayPromise = interviewsTodayPromise;
            }
            DashboardInterviewsToday.prototype.init = function () {
                if (this.interviewsTodayPromise) {
                    this.interviewsToday = this.interviewsTodayPromise.data.hits;
                    this.interviewsTodayCount = this.interviewsTodayPromise.data.resultInfo.totalHits;
                }
            };
            DashboardInterviewsToday.prototype.getTodayParams = function () {
                return '?limit=20&interviewType=INT&from=' + utils.date.getDateTimeStartISOString() + '&to=' + utils.date.getDateTimeEndISOString();
            };
            return DashboardInterviewsToday;
        })();
        dashboard.DashboardInterviewsToday = DashboardInterviewsToday;
        var DashboardAccount = (function () {
            function DashboardAccount(usersPromise) {
                this.usersPromise = usersPromise;
            }
            DashboardAccount.prototype.init = function () {
                if (this.usersPromise) {
                    this.users = this.usersPromise.data.users;
                }
            };
            return DashboardAccount;
        })();
        dashboard.DashboardAccount = DashboardAccount;
        var DashboardSide = (function () {
            function DashboardSide(enums, accountPromise, usersPromise, jobsReadyPromise) {
                this.enums = enums;
                this.accountPromise = accountPromise;
                this.usersPromise = usersPromise;
                this.jobsReadyPromise = jobsReadyPromise;
                this.hasAdminRole = false;
                this.hasRecruiterRole = false;
                this.hasInterviewerRole = false;
            }
            DashboardSide.prototype.init = function () {
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
            };
            return DashboardSide;
        })();
        dashboard.DashboardSide = DashboardSide;
    })(dashboard = controllers.dashboard || (controllers.dashboard = {}));
})(controllers || (controllers = {}));
var stanby;
(function (stanby) {
    var routing;
    (function (routing) {
        var dashboard;
        (function (dashboard) {
            function initRouting() {
                angular.module('stanbyControllers').controller('DashboardCtrl', controllers.dashboard.Dashboard).controller('DashboardSummaryCtrl', controllers.dashboard.DashboardSummary).controller('DashboardInterviewsUnratedCtrl', controllers.dashboard.DashboardInterviewsUnrated).controller('DashboardDocscreeningsUnratedCtrl', controllers.dashboard.DashboardDocscreeningsUnrated).controller('DashboardJobApplicationCountsCtrl', controllers.dashboard.DashboardJobApplicationCounts).controller('DashboardInterviewsTodayCtrl', controllers.dashboard.DashboardInterviewsToday).controller('DashboardAccountCtrl', controllers.dashboard.DashboardAccount).controller('DashboardSideCtrl', controllers.dashboard.DashboardSide).config(function ($stateProvider, $urlRouterProvider, enums) {
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
                            accountPromise: function (routes) {
                                return routes.account.getAccountInfo();
                            },
                            corporatePromise: function (routes) {
                                return routes.corporatePublic.show();
                            },
                            interviewsMyUnratedPromise: function (routes, accountPromise) {
                                if (_.contains(accountPromise.data.account.roles, enums.userRole.INT.code)) {
                                    return routes.interviews.listMyUnrated({ interviewType: enums.userRole.INT.code });
                                }
                                else {
                                    return null;
                                }
                            },
                            interviewsTodayPromise: function (routes, accountPromise) {
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
                            docscreeningsPromise: function (routes, accountPromise) {
                                if (_.contains(accountPromise.data.account.roles, enums.userRole.INT.code)) {
                                    return routes.interviews.listMyUnrated({ interviewType: enums.interviewType.DOC.code });
                                }
                                else {
                                    return null;
                                }
                            },
                            jobsPublishedPromise: function (routes, accountPromise) {
                                if (_.contains(accountPromise.data.account.roles, enums.userRole.REC.code)) {
                                    return routes.jobs.findJobs({ jobStatus: enums.jobStatus.PUB.code });
                                }
                                else {
                                    return null;
                                }
                            },
                            jobsReadyPromise: function (routes, accountPromise) {
                                if (_.contains(accountPromise.data.account.roles, enums.userRole.REC.code)) {
                                    return routes.jobs.findJobs({ jobStatus: enums.jobStatus.RDY.code });
                                }
                                else {
                                    return null;
                                }
                            },
                            jobApplicationCountsPromise: function (routes, accountPromise) {
                                if (_.contains(accountPromise.data.account.roles, enums.userRole.REC.code)) {
                                    return routes.applications.overviews();
                                }
                                else {
                                    return null;
                                }
                            },
                            usersPromise: function (routes, accountPromise) {
                                if (_.contains(accountPromise.data.account.roles, enums.userRole.REC.code) || _.contains(accountPromise.data.account.roles, enums.userRole.INT.code)) {
                                    return routes.users.list(null, null);
                                }
                                else {
                                    return null;
                                }
                            },
                            profilePromise: function (routes) {
                                return routes.users.loginUserDetails();
                            }
                        },
                        onEnter: function ($rootScope) {
                            $rootScope.$emit('breadcrumbs', [
                                { url: '', text: 'Stanby Recruiting' }
                            ]);
                        }
                    });
                });
            }
            dashboard.initRouting = initRouting;
        })(dashboard = routing.dashboard || (routing.dashboard = {}));
    })(routing = stanby.routing || (stanby.routing = {}));
})(stanby || (stanby = {}));

stanby.routing.dashboard.initRouting();

//# sourceMappingURL=../scripts/dashboard-page.js.map