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

var sb;
(function (sb) {
    'use strict';
    var StaticConfig = (function () {
        function StaticConfig() {
            this.images = {
                maxFileSize: 5 * 1024 * 1024,
                logo: {
                    minWidth: 50,
                    minHeight: 50
                },
                cover: {
                    minWidth: 500,
                    minHeight: 200
                },
                inline: {
                    minWidth: 300,
                    minHeight: 200
                }
            };
            this.applications = {
                attachments: {
                    maxFileSize: 5 * 1024 * 1024
                }
            };
            this.terms = {
                max: 30,
                termsLength: 50,
                descLength: 200
            };
            this.locations = {
                max: 10
            };
        }
        return StaticConfig;
    })();
    sb.StaticConfig = StaticConfig;
})(sb || (sb = {}));
var stanby;
(function (stanby) {
    var services;
    (function (services) {
        var common;
        (function (common) {
            var enums;
            (function (enums) {
                function initEnums() {
                    angular.module('stanbyServices').constant('stStaticConfig', new sb.StaticConfig()).constant('enums', {
                        userStatus: {
                            "ENA": "有効",
                            "DIS": "無効",
                            "REG": "登録中"
                        },
                        userRole: {
                            ADM: { name: "管理者", code: "ADM", desc: "管理者は、アカウント管理や企業アカウントの編集ができます" },
                            REC: { name: "人事担当者", code: "REC", desc: "人事担当者は、求人の編集・掲載や応募者の選考管理ができます" },
                            INT: { name: "面接官", code: "INT", desc: "面接官は、面接評価や書類選考をおこなうことができます" }
                        },
                        corporateStatus: {
                            "OPN": "公開",
                            "CNS": "審査中",
                            "PRV": "非公開",
                            "RJC": "拒否"
                        },
                        applicationSource: {
                            DRC: { code: 'DRC', name: '直接応募' },
                            MNL: { code: 'MNL', name: '手動追加' },
                            JSE: { code: 'JSE', name: 'スタンバイ経由' }
                        },
                        jobStatus: {
                            PUB: { name: "作成済", code: "PUB" },
                            RDY: { name: "下書き", code: "RDY" },
                            ARC: { name: "削除", code: "ARC" }
                        },
                        jobApplicableStatus: {
                            OPN: { name: "募集中", code: "OPN" },
                            CLS: { name: "終了", code: "CLS" },
                            OTH: { name: "-", code: "OTH" }
                        },
                        indexingStatus: {
                            NVR: { name: "まもなく検索可能になります", code: "NVR", label: "スタンバイ掲載準備中" },
                            PUB: { name: "検索可能になりました", code: "PUB", label: "スタンバイ掲載中" },
                            RJC: { name: "掲載見合わせ", code: "RJC", label: "スタンバイ掲載見合わせ" }
                        },
                        jobType: {
                            "FULL": { name: "正社員", jobClass: "FULL" },
                            "CONT": { name: "契約社員", jobClass: "FULL" },
                            "NWGR": { name: "新卒", jobClass: "FULL" },
                            "INTN": { name: "インターン", jobClass: "PART" },
                            "PART": { name: "アルバイト・パート", jobClass: "PART" },
                            "TEMP": { name: "派遣社員", jobClass: "FULL" },
                            "OTSR": { name: "業務委託", jobClass: "FULL" }
                        },
                        jobTypeRadio: [
                            { code: "FULL", name: "正社員", jobClass: "FULL", sortNo: 0 },
                            { code: "CONT", name: "契約社員", jobClass: "FULL", sortNo: 1 },
                            { code: "NWGR", name: "新卒", jobClass: "FULL", sortNo: 2 },
                            { code: "OTSR", name: "業務委託", jobClass: "FULL", sortNo: 3 },
                            { code: "INTN", name: "インターン", jobClass: "PART", sortNo: 4 },
                            { code: "PART", name: "アルバイト・パート", jobClass: "PART", sortNo: 5 }
                        ],
                        salaryUnit: [
                            { code: "HOR", name: "時給", sortNo: 0 },
                            { code: "DAY", name: "日給", sortNo: 1 },
                            { code: "MNT", name: "月給", sortNo: 2 },
                            { code: "YAR", name: "年収", sortNo: 3 },
                            { code: "NEG", name: "応相談", sortNo: 4 },
                            { code: "NOP", name: "非公開", sortNo: 5 }
                        ],
                        salaryUnitEnum: {
                            Hourly: { code: "HOR", name: "時給", sortNo: 0 },
                            Daily: { code: "DAY", name: "日給", sortNo: 1 },
                            Monthly: { code: "MNT", name: "月給", sortNo: 2 },
                            Yearly: { code: "YAR", name: "年収", sortNo: 3 },
                            Negotiable: { code: "NEG", name: "応相談", sortNo: 4 },
                            NotOpen: { code: "NOP", name: "非公開", sortNo: 5 }
                        },
                        salaryType: {
                            "HOR": { code: "HOR", name: "時給", sortNo: 0 },
                            "DAY": { code: "DAY", name: "日給", sortNo: 1 },
                            "MNT": { code: "MNT", name: "月給", sortNo: 2 },
                            "YAR": { code: "YAR", name: "年収", sortNo: 3 }
                        },
                        educationStatus: {
                            "ENR": "在籍",
                            "GRD": "卒業",
                            "DRP": "中退"
                        },
                        selectionStage: {
                            "NOA": "未対応",
                            "SCR": "書類審査",
                            "PRG": "選考中",
                            "OFR": "内定",
                            "RJC": "不合格",
                            "DEC": "辞退"
                        },
                        selectionStageOptions: [
                            { code: "NOA", name: "未対応", sortNo: 0 },
                            { code: "SCR", name: "書類審査", sortNo: 1 },
                            { code: "PRG", name: "選考中", sortNo: 2 },
                            { code: "OFR", name: "内定", sortNo: 3 },
                            { code: "RJC", name: "不合格", sortNo: 4 },
                            { code: "DEC", name: "辞退", sortNo: 5 }
                        ],
                        interviewFeedbackGrade: [
                            { code: 'S', value: 5, shortName: '合格S', name: '合格S - 絶対採用したい' },
                            { code: 'A', value: 4, shortName: '合格A', name: '合格A - 採用したい' },
                            { code: 'B', value: 3, shortName: '合格B', name: '合格B - 判断に迷う/ギリギリ' },
                            { code: 'F', value: 2, shortName: '不合格', name: '不合格' },
                            { code: 'H', value: 1, shortName: '保留', name: '保留' }
                        ],
                        imageFileType: [
                            "gif",
                            "jpg",
                            "png"
                        ],
                        resumeTileType: [
                            "pdf",
                            "doc",
                            "docx",
                            "xls",
                            "xlsx"
                        ],
                        timelineType: {
                            'stage': 'stage',
                            'note': 'note',
                            'interview': 'interview',
                            'message': 'message',
                            'feedback': 'feedback',
                            'docscreening': 'docscreening'
                        },
                        feedbackOptions: [
                            { code: 'Y', name: '済', sortNo: 0 },
                            { code: 'N', name: '未', sortNo: 1 }
                        ],
                        interviewType: {
                            INT: { code: "INT", name: "面接" },
                            DOC: { code: "DOC", name: "書類審査" }
                        }
                    });
                }
                enums.initEnums = initEnums;
            })(enums = common.enums || (common.enums = {}));
        })(common = services.common || (services.common = {}));
    })(services = stanby.services || (stanby.services = {}));
})(stanby || (stanby = {}));

var controllers;
(function (controllers) {
    var base;
    (function (base) {
        var PaginationControllerBase = (function () {
            function PaginationControllerBase($state, $scope) {
                this.$state = $state;
                this.$scope = $scope;
                this.defaultPageSize = 20;
                this.bsPage = {};
            }
            PaginationControllerBase.prototype.setFromNormalizedParams = function (params) {
            };
            PaginationControllerBase.prototype.setFromQueryResult = function (res) {
            };
            PaginationControllerBase.prototype.normalizeMore = function (params) {
                return params;
            };
            PaginationControllerBase.prototype.getDefaultSearchConditions = function () {
                throw new Error('Not implemented in base controller');
            };
            PaginationControllerBase.prototype.doSearch = function (params) {
                throw new Error('Not implemented in base controller');
            };
            PaginationControllerBase.prototype.transitionToSelfState = function (params) {
                throw new Error('Not implemented in base controller');
            };
            PaginationControllerBase.prototype.getNewConditions = function () {
                throw new Error('Not implemented in base controller');
            };
            PaginationControllerBase.prototype.init = function () {
                var _this = this;
                if (!_.parseInt(this.$state.params['limit'])) {
                    var defaultSearch = this.getDefaultSearchConditions();
                    defaultSearch.limit = this.defaultPageSize;
                    this.transitionToSelfState(defaultSearch);
                }
                else {
                    var normalized = this.normalizeStateParams(this.$state.params);
                    this.params = normalized;
                    this.setFromNormalizedParams(normalized);
                    this.doSearch(this.params).success(function (res) {
                        _this.totalHits = res.resultInfo.totalHits;
                        _this.setFromQueryResult(res);
                        _this.initBsPagination();
                    });
                }
            };
            PaginationControllerBase.prototype.initBsPagination = function () {
                var _this = this;
                this.bsPage.totalItems = this.getTotalHits();
                this.bsPage.currentPage = this.getCurrentPageNum();
                this.bsPage.itemsPerPage = this.getPageSize();
                this.$scope.$watch(function () {
                    return _this.bsPage.currentPage;
                }, function (newVal, oldVal) {
                    if (newVal != oldVal && newVal > 0)
                        _this.moveToPage(newVal);
                });
            };
            PaginationControllerBase.prototype.normalizeStateParams = function (original) {
                var normalized = _.clone(original);
                normalized.offset = _.parseInt(original.offset) ? _.parseInt(original.offset) : 0;
                normalized.limit = _.parseInt(original.limit);
                return this.normalizeMore(normalized);
            };
            PaginationControllerBase.prototype.search = function () {
                var newConditions = this.getNewConditions();
                newConditions.offset = 0;
                newConditions.limit = this.params.limit;
                this.transitionToSelfState(newConditions);
            };
            PaginationControllerBase.prototype.nextPage = function () {
                var nextPage = this.incrementPage(true);
                this.transitionToSelfState(nextPage);
            };
            PaginationControllerBase.prototype.prevPage = function () {
                var prev = this.incrementPage(false);
                this.transitionToSelfState(prev);
            };
            PaginationControllerBase.prototype.moveToPage = function (page) {
                var newPage = this.paramsToMovePage(page);
                this.transitionToSelfState(newPage);
            };
            PaginationControllerBase.prototype.getTotalHits = function () {
                return this.totalHits;
            };
            PaginationControllerBase.prototype.getTotalPages = function () {
                return Math.ceil(this.totalHits / this.params.limit);
            };
            PaginationControllerBase.prototype.getCurrentPageNum = function () {
                return Math.ceil(this.params.offset / this.params.limit) + 1;
            };
            PaginationControllerBase.prototype.getPageSize = function () {
                return this.params.limit;
            };
            PaginationControllerBase.prototype.existsNextPage = function () {
                return (this.getCurrentPageNum() < this.getTotalPages());
            };
            PaginationControllerBase.prototype.existsPrevPage = function () {
                return (this.getCurrentPageNum() > 1);
            };
            PaginationControllerBase.prototype.incrementPage = function (isNext) {
                var newOffset = this.params.offset;
                if (isNext) {
                    newOffset = newOffset + this.params.limit;
                }
                else {
                    newOffset = newOffset - this.params.limit;
                }
                if (newOffset < 0) {
                    newOffset = 0;
                }
                return this.buildConditionParamsForPage(newOffset);
            };
            PaginationControllerBase.prototype.paramsToMovePage = function (page) {
                var pageSize = this.getPageSize();
                var newOffset = pageSize * (page - 1);
                return this.buildConditionParamsForPage(newOffset);
            };
            PaginationControllerBase.prototype.buildConditionParamsForPage = function (newOffset) {
                var newParams = _.clone(this.params, true);
                newParams.offset = newOffset;
                return newParams;
            };
            PaginationControllerBase.prototype.getZeroOfToday = function () {
                var now = new Date();
                var zeroOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDay(), 0, 0, 0, 0);
                return zeroOfToday.toISOString();
            };
            return PaginationControllerBase;
        })();
        base.PaginationControllerBase = PaginationControllerBase;
    })(base = controllers.base || (controllers.base = {}));
})(controllers || (controllers = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var controllers;
(function (controllers) {
    var application;
    (function (application) {
        var ApplicationEventsService = (function () {
            function ApplicationEventsService($rootScope) {
                var _this = this;
                this.$rootScope = $rootScope;
                this.ADD_TIMELINE_START = 'stTimelineAddRequestStart';
                this.notifyAddTimelineStart = this.doNotify(this.ADD_TIMELINE_START);
                this.listenAddTimelineStart = this.doListen(this.ADD_TIMELINE_START);
                this.ADD_TIME_SUCCESS = 'stTimelineAddRequestSuccess';
                this.notifyAddTimelineSuccess = this.doNotify(this.ADD_TIME_SUCCESS);
                this.listenAddTimelineSuccess = this.doListen(this.ADD_TIME_SUCCESS);
                this.ADD_TIMELINE_FAILURE = 'stTimelineAddRequestFailure';
                this.notifyAddTimelineFailure = this.doNotify(this.ADD_TIMELINE_FAILURE);
                this.listenAddTimelineFailure = this.doListen(this.ADD_TIMELINE_FAILURE);
                this.UPD_TIMELINE_START = 'stTimelineUpdateRequestStart';
                this.notifyUpdTimelineStart = this.doNotify(this.UPD_TIMELINE_START);
                this.listenUpdTimelineStart = this.doListen(this.UPD_TIMELINE_START);
                this.UPD_TIMELINE_SUCCESS = 'stTimelineUpdateRequestSuccess';
                this.notifyUpdTimelineSuccess = this.doNotify(this.UPD_TIMELINE_SUCCESS);
                this.listenUpdTimelineSuccess = this.doListen(this.UPD_TIMELINE_SUCCESS);
                this.UPD_TIMELINE_FAILURE = 'stTimelineUpdateRequestFailure';
                this.notifyUpdTimelineFailure = this.doNotify(this.UPD_TIMELINE_FAILURE);
                this.listenUpdTimelineFailure = this.doListen(this.UPD_TIMELINE_FAILURE);
                this.TIMELINE_CHANGED = 'stTimelineChanged';
                this.notifyTimelineChanged = function ($scope, timeline) {
                    $scope.$broadcast(_this.TIMELINE_CHANGED, timeline);
                };
                this.listenTimelineChanged = function ($scope, handler) {
                    $scope.$on(_this.TIMELINE_CHANGED, function (evt, timeline) {
                        handler(evt, timeline);
                    });
                };
                this.ATTACHMENT_ADDED = 'stApplcationAttachmentAdded';
                this.notifyAttachmentAdded = function (attachment) {
                    _this.$rootScope.$broadcast(_this.ATTACHMENT_ADDED, attachment);
                };
                this.listenAttachmentAdded = function ($scope, handler) {
                    $scope.$on(_this.ATTACHMENT_ADDED, function (evt, timeline) {
                        handler(evt, timeline);
                    });
                };
            }
            ApplicationEventsService.prototype.doNotify = function (eventName) {
                return function ($scope, props, errData) {
                    $scope.$broadcast(eventName, props, errData);
                };
            };
            ApplicationEventsService.prototype.doListen = function (eventName) {
                return function ($scope, handler, errData) {
                    $scope.$on(eventName, function (event, props, errData) {
                        handler(event, props, errData);
                    });
                };
            };
            return ApplicationEventsService;
        })();
        application.ApplicationEventsService = ApplicationEventsService;
        var ApplicationList = (function (_super) {
            __extends(ApplicationList, _super);
            function ApplicationList(routes, $state, stApplicationDetailNavService, enums, $scope) {
                _super.call(this, $state, $scope);
                this.routes = routes;
                this.$state = $state;
                this.stApplicationDetailNavService = stApplicationDetailNavService;
                this.enums = enums;
                this.selectionStageOptions = null;
                this.selectionStageOptions = _.cloneDeep(this.enums.selectionStageOptions);
                this.selectionStageOptions.unshift({ code: "", name: "指定なし", sortNo: -1 });
            }
            ApplicationList.prototype.transitionToSelfState = function (params) {
                this.$state.go('list', params);
            };
            ApplicationList.prototype.getDefaultSearchConditions = function () {
                return { limit: this.defaultPageSize };
            };
            ApplicationList.prototype.setFromNormalizedParams = function (params) {
                this.keyword = params.keyword;
                if (params.statuses) {
                    this.statuses = params.statuses;
                }
                else {
                    this.statuses = "";
                }
                this.jobId = params.jobId;
            };
            ApplicationList.prototype.getNewConditions = function () {
                return { keyword: this.keyword, statuses: this.statuses, jobId: this.jobId };
            };
            ApplicationList.prototype.searchWithSelectionStage = function (newStage) {
                this.statuses = newStage;
                this.search();
            };
            ApplicationList.prototype.doSearch = function (params) {
                return this.routes.applications.list(params);
            };
            ApplicationList.prototype.setFromQueryResult = function (res) {
                this.applications = res.hits;
            };
            ApplicationList.prototype.moveToDetail = function (id, index) {
                this.stApplicationDetailNavService.intoDetailFromApplications(this.params, this.applications, index, this.totalHits);
                this.$state.transitionTo('details', {
                    applicationId: id
                });
            };
            return ApplicationList;
        })(controllers.base.PaginationControllerBase);
        application.ApplicationList = ApplicationList;
        var ApplicationDetail = (function () {
            function ApplicationDetail(applicationPromise, $scope, enums, applicationEventsService, stUtils, $timeout, accountInfoPromise) {
                this.applicationPromise = applicationPromise;
                this.$scope = $scope;
                this.enums = enums;
                this.applicationEventsService = applicationEventsService;
                this.stUtils = stUtils;
                this.$timeout = $timeout;
                this.accountInfoPromise = accountInfoPromise;
            }
            ApplicationDetail.prototype.init = function () {
                this.application = this.applicationPromise;
                this.listenTimelineChangedEvents();
                this.listenSuccessEvents();
                this.listenFailureEvents();
            };
            ApplicationDetail.prototype.hasRecruiterRole = function () {
                var _this = this;
                var found = _.find(this.accountInfoPromise.roles, function (role) {
                    return _this.enums.userRole.REC.code == role;
                });
                return found != null;
            };
            ApplicationDetail.prototype.listenTimelineChangedEvents = function () {
                var _this = this;
                var typEnum = this.enums.timelineType;
                this.applicationEventsService.listenTimelineChanged(this.$scope, function (evt, timeline) {
                    var notes = _.filter(timeline, function (item) {
                        return item.timelineType == typEnum.note;
                    }).map(function (item) {
                        return item.content;
                    });
                    var interviews = _.filter(timeline, function (item) {
                        return item.timelineType == typEnum.interview;
                    }).map(function (item) {
                        return item.content;
                    });
                    var docScreenings = _.filter(timeline, function (item) {
                        return item.timelineType == typEnum.docscreening;
                    }).map(function (item) {
                        return item.content;
                    });
                    var selectionHistory = _.filter(timeline, function (item) {
                        return item.timelineType == typEnum.stage;
                    }).map(function (item) {
                        return item.content;
                    });
                    _this.applicationPromise.notes = notes;
                    _this.applicationPromise.interviews = _.union(interviews, docScreenings);
                    _this.applicationPromise.selectionHistory = selectionHistory;
                });
            };
            ApplicationDetail.prototype.listenSuccessEvents = function () {
                var _this = this;
                this.applicationEventsService.listenAddTimelineSuccess(this.$scope, function (evt, props) {
                    var content = props.item.content;
                    var typEnum = _this.enums.timelineType;
                    var typ = props.item.timelineType;
                    if (typ == typEnum.stage) {
                        _this.applicationPromise.selectionStage = content.selectionStage;
                        _this.incrementVersionNo();
                    }
                    else if (typ == typEnum.note) {
                        _this.incrementVersionNo();
                    }
                });
                this.applicationEventsService.listenUpdTimelineSuccess(this.$scope, function (evt, props) {
                    var typEnum = _this.enums.timelineType;
                    var typ = props.item.timelineType;
                    if (typ == typEnum.note) {
                        _this.incrementVersionNo();
                    }
                });
                this.applicationEventsService.listenAttachmentAdded(this.$scope, function (evt, attached) {
                    var attachments = _this.applicationPromise.attachments;
                    _this.applicationPromise.attachments = attachments ? attachments : [];
                    _this.$timeout(function () {
                        _this.applicationPromise.attachments.push(attached);
                    }, 2000);
                    _this.incrementVersionNo();
                });
            };
            ApplicationDetail.prototype.incrementVersionNo = function () {
                this.applicationPromise.versionNo += 1;
            };
            ApplicationDetail.prototype.listenFailureEvents = function () {
                var _this = this;
                this.applicationEventsService.listenAddTimelineFailure(this.$scope, function (evt, props, errData) {
                    _this.toastFailureMessage(errData);
                });
                this.applicationEventsService.listenUpdTimelineFailure(this.$scope, function (evt, props, errData) {
                    _this.toastFailureMessage(errData);
                });
            };
            ApplicationDetail.prototype.toastFailureMessage = function (errData) {
                var genericError = 'エラーが発生しました。画面を更新してください。';
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
            };
            return ApplicationDetail;
        })();
        application.ApplicationDetail = ApplicationDetail;
        var ApplicationDetailNav = (function () {
            function ApplicationDetailNav(enums, $stateParams, routes, $scope, applicationEventsService, applicationPromise, accountInfoPromise, stModal, stUtils, stApplicationDetailNavService) {
                this.enums = enums;
                this.$stateParams = $stateParams;
                this.routes = routes;
                this.$scope = $scope;
                this.applicationEventsService = applicationEventsService;
                this.applicationPromise = applicationPromise;
                this.accountInfoPromise = accountInfoPromise;
                this.stModal = stModal;
                this.stUtils = stUtils;
                this.stApplicationDetailNavService = stApplicationDetailNavService;
            }
            ApplicationDetailNav.prototype.hasRecruiterRole = function () {
                var _this = this;
                var found = _.find(this.accountInfoPromise.roles, function (role) {
                    return _this.enums.userRole.REC.code == role;
                });
                return found != null;
            };
            ApplicationDetailNav.prototype.isEditableResume = function () {
                var isManual = this.applicationPromise.applicationSource == this.enums.applicationSource.MNL.code;
                return this.hasRecruiterRole() && isManual;
            };
            ApplicationDetailNav.prototype.isSearchResultsActive = function () {
                return this.stApplicationDetailNavService.isActive();
            };
            ApplicationDetailNav.prototype.activeListName = function () {
                return this.stApplicationDetailNavService.activeListName();
            };
            ApplicationDetailNav.prototype.conditionsText = function () {
                return this.stApplicationDetailNavService.conditionsText();
            };
            ApplicationDetailNav.prototype.existsNextItem = function () {
                return this.stApplicationDetailNavService.existsNextItem();
            };
            ApplicationDetailNav.prototype.existsPrevItem = function () {
                return this.stApplicationDetailNavService.existsPrevItem();
            };
            ApplicationDetailNav.prototype.currentItemNumber = function () {
                return this.stApplicationDetailNavService.currentItemNumber();
            };
            ApplicationDetailNav.prototype.totalHits = function () {
                return this.stApplicationDetailNavService.totalHitsNumber();
            };
            ApplicationDetailNav.prototype.transitionToNextItem = function () {
                this.stApplicationDetailNavService.transitionToNextItem();
            };
            ApplicationDetailNav.prototype.transitionToPrevItem = function () {
                this.stApplicationDetailNavService.transitionToPrevItem();
            };
            ApplicationDetailNav.prototype.backToList = function () {
                this.stApplicationDetailNavService.backToList();
            };
            ApplicationDetailNav.prototype.updateStatus = function (newStage, isDiffValue) {
                var _this = this;
                var evtProps = {
                    item: {
                        timelineType: this.enums.timelineType.stage,
                        content: {
                            selectionStage: newStage
                        }
                    }
                };
                this.applicationEventsService.notifyAddTimelineStart(this.$scope.$root, evtProps);
                if (isDiffValue) {
                    this.routes.applications.updateStatus(this.applicationPromise.id, newStage, this.applicationPromise.versionNo).success(function () {
                        _this.applicationEventsService.notifyAddTimelineSuccess(_this.$scope.$root, evtProps);
                    }).error(function () {
                        _this.applicationEventsService.notifyAddTimelineFailure(_this.$scope.$root, evtProps);
                    });
                }
            };
            ApplicationDetailNav.prototype.turnOnFileAttachmentModal = function () {
                var _this = this;
                var settings = {
                    templateUrl: '/internal/parts/applications/file-upload-modal',
                    controller: FileAttachment
                };
                this.stModal.modalCustom(settings).result.then(function (file) {
                    if (file) {
                        _this.uploadAttachment(file).success(function (uploaded) {
                            _this.applicationEventsService.notifyAttachmentAdded(uploaded);
                        });
                    }
                });
            };
            ApplicationDetailNav.prototype.uploadAttachment = function (file) {
                var _this = this;
                var successToast = function (res) {
                    var name = res.fileName;
                    if (name.length > 30) {
                        name = name.substring(0, 30) + ' …';
                    }
                    _this.stUtils.toastInfo("登録されました: " + name);
                };
                var form = new FormData();
                form.append('attachment', file);
                return this.routes.applications.attachFile(this.$stateParams.applicationId, form).success(function (res) {
                    successToast(res);
                });
            };
            return ApplicationDetailNav;
        })();
        application.ApplicationDetailNav = ApplicationDetailNav;
        var ApplicationSummary = (function () {
            function ApplicationSummary(enums, applicationPromise, accountInfoPromise, routes) {
                this.enums = enums;
                this.applicationPromise = applicationPromise;
                this.accountInfoPromise = accountInfoPromise;
                this.routes = routes;
            }
            ApplicationSummary.prototype.hasRecruiterRole = function () {
                var _this = this;
                var found = _.find(this.accountInfoPromise.roles, function (role) {
                    return _this.enums.userRole.REC.code == role;
                });
                return found != null;
            };
            ApplicationSummary.prototype.fetchEmail = function () {
                var _this = this;
                this.routes.applications.fetchEmail(this.applicationPromise.id).success(function (data) {
                    if (data.email) {
                        _this.email = data.email;
                    }
                    else {
                        _this.email = "メールアドレスが登録されていません";
                    }
                });
            };
            ApplicationSummary.prototype.fetchPhone = function () {
                var _this = this;
                this.routes.applications.fetchPhone(this.applicationPromise.id).success(function (data) {
                    if (data.phone) {
                        _this.phone = data.phone;
                    }
                    else {
                        _this.phone = "電話番号が登録されていません";
                    }
                });
            };
            return ApplicationSummary;
        })();
        application.ApplicationSummary = ApplicationSummary;
        var ApplicationAction = (function () {
            function ApplicationAction($scope, applicationPromise, applicationEventsService, accountInfoPromise, enums, $interval) {
                this.$scope = $scope;
                this.applicationPromise = applicationPromise;
                this.applicationEventsService = applicationEventsService;
                this.accountInfoPromise = accountInfoPromise;
                this.enums = enums;
                this.$interval = $interval;
            }
            ApplicationAction.prototype.init = function () {
                this.listenTimelineChanged();
                this.startPollingNowDate();
            };
            ApplicationAction.prototype.startPollingNowDate = function () {
                var _this = this;
                this.nowDate = new Date();
                this.$interval(function () {
                    _this.nowDate = new Date();
                }, 1000 * 60);
            };
            ApplicationAction.prototype.listenTimelineChanged = function () {
                var _this = this;
                this.applicationEventsService.listenTimelineChanged(this.$scope, function (evt, timeline) {
                    if (timeline) {
                        var latestItem = timeline[0];
                        if (latestItem.timelineType == _this.enums.timelineType.message) {
                            _this.latestItemCreatedAt = new Date(_this.applicationPromise.createdAt);
                        }
                        else {
                            _this.latestItemCreatedAt = latestItem.content.createdAt;
                        }
                    }
                });
            };
            ApplicationAction.prototype.hasRecruiterRole = function () {
                var _this = this;
                var found = _.find(this.accountInfoPromise.roles, function (role) {
                    return _this.enums.userRole.REC.code == role;
                });
                return found != null;
            };
            return ApplicationAction;
        })();
        application.ApplicationAction = ApplicationAction;
        var ApplicationTimeline = (function () {
            function ApplicationTimeline($scope, applicationEventsService, applicationPromise, accountInfoPromise, enums) {
                this.$scope = $scope;
                this.applicationEventsService = applicationEventsService;
                this.applicationPromise = applicationPromise;
                this.accountInfoPromise = accountInfoPromise;
                this.enums = enums;
            }
            ApplicationTimeline.prototype.init = function () {
                this.timeline = this.listTimelineItems(this.applicationPromise);
                this.timeline = this.markingTimelineItems(this.timeline);
                this.applicationEventsService.notifyTimelineChanged(this.$scope.$root, this.timeline);
                this.watchTimeline();
                this.listenItemManipulations();
            };
            ApplicationTimeline.prototype.hasRecruiterRole = function () {
                var _this = this;
                var found = _.find(this.accountInfoPromise.roles, function (role) {
                    return _this.enums.userRole.REC.code == role;
                });
                return found != null;
            };
            ApplicationTimeline.prototype.isEvaluatableInterview = function (interview) {
                var interviewerId = interview.interviewer ? interview.interviewer.userId : null;
                var myUserId = this.accountInfoPromise.userId;
                var existsFeedback = interview.feedbacks && (interview.feedbacks.length > 0);
                return ((myUserId == interviewerId) || this.hasRecruiterRole()) && !existsFeedback;
            };
            ApplicationTimeline.prototype.isUpdatableNote = function (note) {
                var noteOwnerId = note.userId;
                var myId = this.accountInfoPromise.userId;
                return noteOwnerId == myId;
            };
            ApplicationTimeline.prototype.markingTimelineItems = function (timelineItems) {
                var isMarkedPrimary = false, isMarkedSecondary = false;
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
                return timelineItems;
            };
            ApplicationTimeline.prototype.listTimelineItems = function (app) {
                var _this = this;
                _.forEach(app.interviews, function (interview) {
                    _.map(interview.feedbacks, function (fb) {
                        fb.interviewType = interview.interviewType;
                        fb.interviewTitle = interview.title;
                        fb.interviewId = interview.id;
                        return fb;
                    });
                });
                return _.sortBy(_.union(_.map(app.notes, function (i) {
                    return { timelineType: _this.enums.timelineType.note, content: i };
                }), _.map(app.interviews, function (i) {
                    if (i.interviewType === _this.enums.interviewType.INT.code) {
                        return { timelineType: _this.enums.timelineType.interview, content: i };
                    }
                    else {
                        return { timelineType: _this.enums.timelineType.docscreening, content: i };
                    }
                }), _.map(app.selectionHistory, function (i) {
                    return { timelineType: _this.enums.timelineType.stage, content: i };
                }), _.map(_.flatten(_.compact(_.pluck(app.interviews, 'feedbacks'))), function (i) {
                    return { timelineType: _this.enums.timelineType.feedback, content: i };
                }), [{ timelineType: this.enums.timelineType.message, content: app.message }]), function (i) {
                    if (!i.content) {
                        return;
                    }
                    return Date.parse(i.content.createdAt) * -1;
                });
            };
            ApplicationTimeline.prototype.listenItemManipulations = function () {
                var _this = this;
                this.applicationEventsService.listenUpdTimelineSuccess(this.$scope, function (evt, props) {
                    _this.checkForInterviewVersionNoIncrement(props.item);
                    angular.forEach(_this.timeline, function (item) {
                        if (_this.compareFakeItemAndExistingItem(props.item, item)) {
                            var supplemented = _this.supplementFakeInfo(props.item);
                            item.content = _.cloneDeep(supplemented.content);
                        }
                    });
                });
                this.applicationEventsService.listenAddTimelineSuccess(this.$scope, function (evt, props) {
                    _this.checkForInterviewVersionNoIncrement(props.item);
                    var supplemented = _this.supplementFakeInfo(props.item);
                    var supplementedMore = _this.supplementFakeAddInfo(supplemented);
                    _this.timeline.unshift(supplementedMore);
                });
            };
            ApplicationTimeline.prototype.checkForInterviewVersionNoIncrement = function (updated) {
                var _this = this;
                if (updated.timelineType == this.enums.timelineType.feedback) {
                    angular.forEach(this.timeline, function (existing) {
                        if (existing.timelineType == _this.enums.timelineType.interview || existing.timelineType == _this.enums.timelineType.docscreening) {
                            if (existing.content.id == updated.content.interviewId) {
                                existing.content.versionNo++;
                            }
                        }
                    });
                }
            };
            ApplicationTimeline.prototype.compareFakeItemAndExistingItem = function (fake, existing) {
                var typ = this.enums.timelineType;
                var existingContent = existing.content;
                if (existingContent != null && fake.timelineType == existing.timelineType) {
                    if (fake.timelineType == typ.note) {
                        return fake.content.noteId == existingContent.noteId;
                    }
                    else if (fake.timelineType == typ.interview) {
                        return fake.content.id == existingContent.id;
                    }
                    else if (fake.timelineType == typ.docscreening) {
                        return fake.content.id = existingContent.id;
                    }
                    else if (fake.timelineType == typ.feedback) {
                        return fake.content.feedbackId == existingContent.feedbackId;
                    }
                }
                return false;
            };
            ApplicationTimeline.prototype.supplementFakeInfo = function (item) {
                var accountInfo = this.accountInfoPromise;
                item.content.updatedAt = new Date().toISOString();
                item.content.updatedBy = {
                    name: accountInfo.fullName,
                    userId: accountInfo.userId
                };
                if (!item.content.createdAt) {
                    item.content.createdAt = new Date().toISOString();
                }
                return item;
            };
            ApplicationTimeline.prototype.supplementFakeAddInfo = function (item) {
                var typEnum = this.enums.timelineType;
                var myId = this.accountInfoPromise.userId;
                if ((typEnum.note == item.timelineType) || (typEnum.interview == item.timelineType) || (typEnum.docscreening == item.timelineType) || (typEnum.feedback == item.timelineType)) {
                    item.content.userId = myId;
                }
                return item;
            };
            ApplicationTimeline.prototype.watchTimeline = function () {
                var _this = this;
                this.$scope.$watch(function () {
                    return _this.timeline;
                }, function () {
                    _this.syncFeedbacksAndInterviews(function () {
                        _this.applicationEventsService.notifyTimelineChanged(_this.$scope, _this.timeline);
                    });
                }, true);
            };
            ApplicationTimeline.prototype.syncFeedbacksAndInterviews = function (callback) {
                var typEnum = this.enums.timelineType;
                if (this.timeline) {
                    var feedbacks = _.map(_.filter(this.timeline, function (item) {
                        return item.timelineType == typEnum.feedback;
                    }), function (fbItem) {
                        return fbItem.content;
                    });
                    _.forEach(this.timeline, function (item) {
                        if (item.timelineType == typEnum.interview) {
                            var interviewFeedbacks = _.filter(feedbacks, function (fb) {
                                return fb.interviewId == item.content.id;
                            });
                            if (interviewFeedbacks == null)
                                interviewFeedbacks = [];
                            item.content.feedbacks = interviewFeedbacks;
                        }
                        else if (item.timelineType == typEnum.docscreening) {
                            var docFeedbacks = _.filter(feedbacks, function (fb) {
                                return fb.interviewId == item.content.id;
                            });
                            if (docFeedbacks == null)
                                docFeedbacks = [];
                            item.content.feedbacks = docFeedbacks;
                        }
                    });
                }
                callback();
            };
            return ApplicationTimeline;
        })();
        application.ApplicationTimeline = ApplicationTimeline;
        var ApplicationOriginal = (function () {
            function ApplicationOriginal(enums, applicationPromise, messageMarkdownToHtmlPromise, resumeMarkdownToHtmlPromise) {
                this.enums = enums;
                this.applicationPromise = applicationPromise;
                this.messageMarkdownToHtmlPromise = messageMarkdownToHtmlPromise;
                this.resumeMarkdownToHtmlPromise = resumeMarkdownToHtmlPromise;
            }
            ApplicationOriginal.prototype.init = function () {
                if (this.messageMarkdownToHtmlPromise) {
                    this.messageHtml = this.messageMarkdownToHtmlPromise.data.htmlText;
                }
                if (this.resumeMarkdownToHtmlPromise) {
                    this.resumeHtml = this.resumeMarkdownToHtmlPromise.data.htmlText;
                }
            };
            ApplicationOriginal.prototype.getAttachmentDownloadLink = function (attachment) {
                var id = this.applicationPromise.id;
                var prefix = attachment.s3Prefix;
                var fileId = attachment.fileId;
                return "/api/applications/" + id + "/attachments/" + prefix + "/" + fileId;
            };
            ApplicationOriginal.prototype.isPdfFile = function (attachment) {
                return attachment.fileName.substr(-4, 4).toLowerCase() == '.pdf';
            };
            ApplicationOriginal.prototype.getPdfViewerLink = function (attachment) {
                var download = this.getAttachmentDownloadLink(attachment);
                var encoded = encodeURIComponent(download);
                return "/pdfviewer/web/viewer.html?file=" + encoded;
            };
            ApplicationOriginal.prototype.getDuration = function (obj) {
                if (obj.startDate) {
                    var differenceYear = 0, differenceMonth = 0, differenceStartToEnd = 0, isMonthlyBasis = false, dateStart, dateEnd = new Date();
                    if (angular.isNumber(obj.startDate.month)) {
                        dateStart = new Date(obj.startDate.year, obj.startDate.month - 1);
                        isMonthlyBasis = true;
                    }
                    else {
                        dateStart = new Date(obj.startDate.year, 0);
                    }
                    if (obj.endDate) {
                        if (isMonthlyBasis && angular.isNumber(obj.endDate.month)) {
                            dateEnd = new Date(obj.endDate.year, obj.endDate.month - 1);
                        }
                        else {
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
                    differenceYear = Math.round(differenceStartToEnd / 365);
                    if (differenceYear > 0) {
                        differenceMonth = Math.round((differenceStartToEnd - (differenceYear * 365)) / 31);
                        if (differenceMonth > 0) {
                            return differenceYear + '年' + differenceMonth + 'ヶ月';
                        }
                        else {
                            return differenceYear + '年';
                        }
                    }
                    else {
                        differenceMonth = Math.round(differenceStartToEnd / 31);
                        return differenceMonth + 'ヶ月';
                    }
                }
            };
            return ApplicationOriginal;
        })();
        application.ApplicationOriginal = ApplicationOriginal;
        var FileAttachment = (function () {
            function FileAttachment($rootScope, $scope, $modalInstance, stStaticConfig, stUtils) {
                var _this = this;
                this.$rootScope = $rootScope;
                this.$scope = $scope;
                this.stStaticConfig = stStaticConfig;
                this.stUtils = stUtils;
                $scope.file = null;
                $scope.isDragging = false;
                $scope.setDraggingStyle = function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    $(e.target).addClass('dragging');
                    $scope.isDragging = true;
                };
                $scope.resetDraggingStyle = function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    $(e.target).removeClass('dragging');
                    $scope.isDragging = false;
                };
                $scope.setDropped = function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    $scope.resetDraggingStyle(e);
                    var dropped = e.originalEvent.dataTransfer.files;
                    _this.validateAndSetFiles(dropped);
                };
                $scope.selectUploadFile = function (e) {
                    var selected = $(e.target)[0].files || $(e.target).val();
                    _this.validateAndSetFiles(selected);
                };
                $scope.ok = function () {
                    $modalInstance.close($scope.file);
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss();
                };
            }
            FileAttachment.prototype.validateAndSetFiles = function (files) {
                if (files.length > 1) {
                    this.stUtils.toastDanger('一度にアップロードできるのは1ファイルまでです');
                }
                else if (!/\.pdf/.test(files[0].name)) {
                    this.stUtils.toastDanger('PDF形式のファイルのみアップロードできます');
                    return false;
                }
                else {
                    var file = files[0];
                    var maxFileSize = this.stStaticConfig.applications.attachments.maxFileSize;
                    var maxMegabytes = Math.ceil((maxFileSize * 10) / (1024 * 1024)) / 10;
                    if (file.size > maxFileSize) {
                        this.stUtils.toastInfo("ファイルサイズの上限は" + maxMegabytes + "MBです");
                    }
                    else {
                        this.$rootScope.$broadcast('uploadedAttachment');
                        this.$scope.file = file;
                        this.$scope.ok();
                    }
                }
            };
            return FileAttachment;
        })();
        application.FileAttachment = FileAttachment;
        var ApplicationEdit = (function () {
            function ApplicationEdit($scope, enums, routes, stUtils, $state, applicationFetchPromise, jobListPromise, stModal, $timeout) {
                this.$scope = $scope;
                this.enums = enums;
                this.routes = routes;
                this.stUtils = stUtils;
                this.$state = $state;
                this.applicationFetchPromise = applicationFetchPromise;
                this.jobListPromise = jobListPromise;
                this.stModal = stModal;
                this.$timeout = $timeout;
                this.birthDateYear = '';
                this.birthDateMonth = '';
                this.birthDateDay = '';
                this.newAttachments = [];
                this.delAttachments = [];
            }
            ApplicationEdit.prototype.init = function () {
                var _this = this;
                if (this.applicationFetchPromise) {
                    this.model = this.applicationFetchPromise.data.application;
                    if (this.model.applicationSource != 'MNL') {
                        this.stUtils.toastInfo("手入力された応募者基本情報のみ編集することができます");
                        this.$state.go('details', { applicationId: this.model.id });
                    }
                    else {
                        this.jobId = this.model.job.jobId;
                        if (this.model.profile.birthDate) {
                            this.birthDateYear = String(this.model.profile.birthDate.year);
                            this.birthDateMonth = String(this.model.profile.birthDate.month);
                            this.birthDateDay = String(this.model.profile.birthDate.day);
                        }
                        this.isEditMessageMD = true;
                        this.isEditResumeFreeTextMD = true;
                        if (this.model.message)
                            this.previewHTML('message');
                        if (this.model.resumeFreeText)
                            this.previewHTML('resumeFreeText');
                        this.isEdit = true;
                        this.routes.applications.fetchPhone(this.model.id).success(function (res) {
                            _this.model.profile.phone = res.phone;
                        });
                        this.routes.applications.fetchEmail(this.model.id).success(function (res) {
                            _this.model.profile.email = res.email;
                        });
                    }
                }
                else {
                    this.model = this.initApplicationInfo();
                    this.isEdit = false;
                }
                this.years = this.getYearsForBirthDate();
                this.isEditMessageMD = true;
                this.isEditResumeFreeTextMD = true;
                if (!this.model.message)
                    this.model.message = '';
                if (!this.model.resumeFreeText)
                    this.model.resumeFreeText = '';
                if (this.jobListPromise) {
                    this.jobList = this.jobListPromise.data.jobs;
                }
                this.$scope.$on('uploadedAttachment', function () {
                    _this.$scope.appForm.$setDirty();
                });
            };
            ApplicationEdit.prototype.getYearsForBirthDate = function () {
                var yearsResponse = [], dateCurrent = new Date(), yearCurrent = dateCurrent.getFullYear(), YEAR_PAST_START = 16, YEAR_PAST_MAX = 80;
                yearsResponse.push({ value: '', name: '' });
                for (var i = YEAR_PAST_START; i < YEAR_PAST_MAX; i++) {
                    yearsResponse.push({ value: String(yearCurrent - i), name: (yearCurrent - i) + "年" });
                }
                return yearsResponse;
            };
            ApplicationEdit.prototype.save = function (form) {
                this.paramCheck();
                var errList = this.beforeValidator(form);
                if (!_.isEmpty(errList)) {
                    this.stUtils.toastDanger(errList.join('<br/>'));
                    return;
                }
                var that = this;
                this.routes.jobs.detail(this.jobId).success(function (job) {
                    that.model.job.jobId = job.id;
                    that.model.job.jobName = job.name;
                    that.model.job.jobAdTitle = job.content.jobAdTitle;
                    angular.forEach(that.delAttachments, function (attach) {
                        if (!that.model.delAttachmentIds)
                            that.model.delAttachmentIds = [];
                        that.model.delAttachmentIds.push({ fileId: attach.fileId, prefix: attach.s3Prefix });
                    });
                    angular.forEach(that.newAttachments, function (attach) {
                        if (!that.model.attachmentIds)
                            that.model.attachmentIds = [];
                        if (!that.model.addAttachmentIds)
                            that.model.addAttachmentIds = [];
                        that.model.attachmentIds.push({ fileId: attach.fileId, yearMonth: attach.yearMonth });
                        that.model.addAttachmentIds.push({ fileId: attach.fileId, yearMonth: attach.yearMonth });
                    });
                    if (that.isEdit) {
                        that.routes.applications.update(that.model.id, that.model).success(function (res) {
                            that.stUtils.toastInfo('応募情報を更新しました。');
                            that.$state.transitionTo('details', { applicationId: that.model.id });
                        }).error(function (err) {
                            var errList = that.afterValidator(err);
                            if (!_.isEmpty(errList)) {
                                that.stUtils.toastDanger(errList.join('<br/>'));
                            }
                        });
                    }
                    else {
                        that.routes.applications.create(that.model).success(function (res) {
                            that.stUtils.toastInfo('応募が追加されました。一覧にまもなく反映されます。');
                            that.$state.transitionTo('list');
                        }).error(function (err) {
                            var errList = that.afterValidator(err);
                            if (!_.isEmpty(errList)) {
                                that.stUtils.toastDanger(errList.join('<br/>'));
                            }
                        });
                    }
                });
            };
            ApplicationEdit.prototype.cancel = function () {
                if (this.isEdit) {
                    this.$state.transitionTo('details', { applicationId: this.model.id });
                }
                else {
                    this.$state.transitionTo('list');
                }
            };
            ApplicationEdit.prototype.paramCheck = function () {
                if (!this.model.profile.phone)
                    this.model.profile.phone = null;
                if (!this.model.profile.email)
                    this.model.profile.email = null;
                if (!this.birthDateYear || !this.birthDateMonth || !this.birthDateDay) {
                    this.model.profile.birthDate = null;
                }
                else {
                    var birthDate = new Date(this.birthDateYear + "/" + this.birthDateMonth + "/" + this.birthDateDay);
                    if (birthDate && !this.model.profile.birthDate) {
                        this.model.profile.birthDate = { year: null, month: null, day: null };
                    }
                    if (birthDate) {
                        this.model.profile.birthDate.year = birthDate.getFullYear();
                        this.model.profile.birthDate.month = birthDate.getMonth() + 1;
                        this.model.profile.birthDate.day = birthDate.getDate();
                    }
                }
            };
            ApplicationEdit.prototype.beforeValidator = function (form) {
                var errList = [];
                if (this.model.profile.birthDate && isNaN(this.model.profile.birthDate.year))
                    errList.push('生年月日が日付形式ではありません');
                if (!this.model.profile.phone && !this.model.profile.email)
                    errList.push('携帯電話番号かメールアドレスのどちらかを入力してください');
                return errList;
            };
            ApplicationEdit.prototype.afterValidator = function (err) {
                var errList = [];
                if (err.key == 'error.application.eitherPhoneOrEmailMustBeIncluded')
                    errList.push('携帯電話番号かメールアドレスのどちらかを入力してください');
                if (err.details) {
                    err.details.map(function (errKey) {
                        if (errKey == 'profile.fullName')
                            errList.push('氏名は必須項目です');
                        if (errKey == 'profile.fullNameKana')
                            errList.push('氏名(かな)は必須項目です');
                        if (errKey == 'profile.phone')
                            errList.push('携帯電話番号の形式を確認してください');
                        if (errKey == 'profile.email')
                            errList.push('メールアドレスの形式を確認してください');
                    });
                }
                return errList;
            };
            ApplicationEdit.prototype.editMarkdown = function (target) {
                if (target == 'message') {
                    this.isEditMessageMD = true;
                }
                else {
                    this.isEditResumeFreeTextMD = true;
                }
                this.$timeout(function () {
                    var $focusEl = $('.sg-form-markdown-textarea[name="' + target + '"]');
                    if ($focusEl.length === 1) {
                        $focusEl.focus();
                    }
                });
            };
            ApplicationEdit.prototype.previewHTML = function (target) {
                var _this = this;
                if (target == 'message' && this.isEditMessageMD) {
                    this.routes.utils.convertMarkdownToHtml(this.model.message).success(function (data) {
                        _this.htmlMessage = data.htmlText;
                        _this.isEditMessageMD = false;
                    });
                }
                else if (target == 'resumeFreeText' && this.isEditResumeFreeTextMD) {
                    this.routes.utils.convertMarkdownToHtml(this.model.resumeFreeText).success(function (data) {
                        _this.htmlResumeFreeText = data.htmlText;
                        _this.isEditResumeFreeTextMD = false;
                    });
                }
            };
            ApplicationEdit.prototype.initApplicationInfo = function () {
                return {
                    id: null,
                    profile: this.initApplicationProfole(),
                    resumeFreeText: null,
                    selectionStage: "NOA",
                    job: {
                        jobId: null,
                        jobName: null,
                        jobAdTitle: null
                    },
                    message: null
                };
            };
            ApplicationEdit.prototype.initApplicationProfole = function () {
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
            };
            ApplicationEdit.prototype.turnOnFileAttachmentModal = function () {
                var _this = this;
                var settings = {
                    templateUrl: '/internal/parts/applications/file-upload-modal',
                    controller: FileAttachment
                };
                this.stModal.modalCustom(settings).result.then(function (file) {
                    if (file) {
                        _this.uploadTemporarily(file).success(function (temp) {
                            _this.newAttachments.push(temp);
                        });
                    }
                });
            };
            ApplicationEdit.prototype.uploadTemporarily = function (file) {
                var form = new FormData();
                form.append('attachment', file);
                return this.routes.applications.uploadTempFile(form);
            };
            ApplicationEdit.prototype.unselectAttachment = function (index) {
                if (this.model.attachments) {
                    var target = this.model.attachments[index];
                    this.delAttachments.push(target);
                    this.model.attachments.splice(index, 1);
                }
            };
            ApplicationEdit.prototype.removeNewAttachment = function (index) {
                if (this.newAttachments) {
                    this.newAttachments.splice(index, 1);
                }
            };
            return ApplicationEdit;
        })();
        application.ApplicationEdit = ApplicationEdit;
    })(application = controllers.application || (controllers.application = {}));
})(controllers || (controllers = {}));
var controllers;
(function (controllers) {
    var interview;
    (function (interview) {
        var RecruiterList = (function (_super) {
            __extends(RecruiterList, _super);
            function RecruiterList(applicationControllers, routes, $state, stApplicationDetailNavService, $scope, enums) {
                _super.call(this, $state, $scope);
                this.applicationControllers = applicationControllers;
                this.routes = routes;
                this.$state = $state;
                this.stApplicationDetailNavService = stApplicationDetailNavService;
                this.enums = enums;
                this.isOpenFromPopup = false;
                this.isOpenToPopup = false;
            }
            RecruiterList.prototype.getDefaultSearchConditions = function () {
                var defaultFrom = new Date();
                defaultFrom.setHours(0, 0, 0, 0);
                return { limit: this.defaultPageSize, from: defaultFrom.toISOString() };
            };
            RecruiterList.prototype.normalizeMore = function (params) {
                if (angular.isString(params.from) && angular.isDate(new Date(params.from))) {
                    var fromDate = new Date(params.from);
                    fromDate.setHours(0, 0, 0, 0);
                    params.from = fromDate;
                }
                if (angular.isString(params.to) && angular.isDate(new Date(params.to))) {
                    var toDate = new Date(params.to);
                    toDate.setHours(23, 59, 59, 999);
                    params.to = toDate;
                }
                return params;
            };
            RecruiterList.prototype.setFromNormalizedParams = function (params) {
                this.feedback = params.feedback;
                if (params.from)
                    this.searchFrom = new Date(params.from);
                if (params.to)
                    this.searchTo = new Date(params.to);
            };
            RecruiterList.prototype.doSearch = function (params) {
                return this.routes.interviews.listAll(params);
            };
            RecruiterList.prototype.setFromQueryResult = function (res) {
                this.interviews = res.hits;
            };
            RecruiterList.prototype.getNewConditions = function () {
                if (this.searchFrom)
                    this.searchFrom.setHours(0, 0, 0, 0);
                if (this.searchTo)
                    this.searchTo.setHours(23, 59, 59, 999);
                return {
                    feedback: this.feedback,
                    from: this.searchFrom ? this.searchFrom.toISOString() : null,
                    to: this.searchTo ? this.searchTo.toISOString() : null
                };
            };
            RecruiterList.prototype.transitionToSelfState = function (params) {
                this.$state.go(this.applicationControllers.allInterviewList.name, params);
            };
            RecruiterList.prototype.showFromPopup = function (e) {
                e.preventDefault();
                e.stopPropagation();
                this.isOpenFromPopup = true;
            };
            RecruiterList.prototype.showToPopup = function (e) {
                e.preventDefault();
                e.stopPropagation();
                this.isOpenToPopup = true;
            };
            RecruiterList.prototype.searchWithFeedbackFlg = function (flg, isDiff) {
                if (isDiff) {
                    this.feedback = flg;
                    this.search();
                }
            };
            RecruiterList.prototype.existsFeedbackText = function (feedbacks) {
                return (feedbacks && !_.isEmpty(feedbacks));
            };
            RecruiterList.prototype.moveToDetail = function (applicationId, index) {
                this.stApplicationDetailNavService.intoDetailFromAllInterviews(this.params, this.interviews, index, this.totalHits);
                this.$state.go('details', { applicationId: applicationId });
            };
            return RecruiterList;
        })(controllers.base.PaginationControllerBase);
        interview.RecruiterList = RecruiterList;
        var InterviewerList = (function (_super) {
            __extends(InterviewerList, _super);
            function InterviewerList(routes, $state, stApplicationDetailNavService, $scope, enums) {
                _super.call(this, $state, $scope);
                this.routes = routes;
                this.$state = $state;
                this.stApplicationDetailNavService = stApplicationDetailNavService;
                this.enums = enums;
                this.isOpenFromPopup = false;
                this.isOpenToPopup = false;
            }
            InterviewerList.prototype.searchWithFromDate = function () {
                this.search();
            };
            InterviewerList.prototype.getDefaultSearchConditions = function () {
                return { limit: this.defaultPageSize, feedback: 'N' };
            };
            InterviewerList.prototype.normalizeMore = function (params) {
                if (angular.isString(params.from) && angular.isDate(new Date(params.from))) {
                    var fromDate = new Date(params.from);
                    fromDate.setHours(0, 0, 0, 0);
                    params.from = fromDate;
                }
                if (angular.isString(params.to) && angular.isDate(new Date(params.to))) {
                    var toDate = new Date(params.to);
                    toDate.setHours(23, 59, 59, 999);
                    params.to = toDate;
                }
                return params;
            };
            InterviewerList.prototype.setFromNormalizedParams = function (params) {
                this.feedback = params.feedback;
                this.searchFrom = params.from;
                this.searchTo = params.to;
            };
            InterviewerList.prototype.doSearch = function (params) {
                return this.routes.interviews.listMine(params);
            };
            InterviewerList.prototype.setFromQueryResult = function (res) {
                this.interviews = res.hits;
            };
            InterviewerList.prototype.getNewConditions = function () {
                if (this.searchFrom)
                    this.searchFrom.setHours(0, 0, 0, 0);
                if (this.searchTo)
                    this.searchTo.setHours(23, 59, 59, 999);
                return {
                    feedback: this.feedback,
                    from: this.searchFrom ? this.searchFrom.toISOString() : null,
                    to: this.searchTo ? this.searchTo.toISOString() : null
                };
            };
            InterviewerList.prototype.transitionToSelfState = function (params) {
                this.$state.go('int_interviews', params);
            };
            InterviewerList.prototype.showFromPopup = function (e) {
                e.preventDefault();
                e.stopPropagation();
                this.isOpenFromPopup = true;
            };
            InterviewerList.prototype.showToPopup = function (e) {
                e.preventDefault();
                e.stopPropagation();
                this.isOpenToPopup = true;
            };
            InterviewerList.prototype.searchWithFeedbackFlg = function (flg, isDiff) {
                if (isDiff) {
                    this.feedback = flg;
                    this.search();
                }
            };
            InterviewerList.prototype.existsFeedbackText = function (feedbacks) {
                return (feedbacks && !_.isEmpty(feedbacks));
            };
            InterviewerList.prototype.moveToDetail = function (applicationId, index) {
                this.stApplicationDetailNavService.intoDetailFromMyInterviews(this.params, this.interviews, index, this.totalHits);
                this.$state.go('details', { applicationId: applicationId });
            };
            return InterviewerList;
        })(controllers.base.PaginationControllerBase);
        interview.InterviewerList = InterviewerList;
    })(interview = controllers.interview || (controllers.interview = {}));
})(controllers || (controllers = {}));
var service;
(function (service) {
    var interview;
    (function (_interview) {
        var ApplicationDetailNavService = (function () {
            function ApplicationDetailNavService(applicationControllers, $state, routes) {
                this.applicationControllers = applicationControllers;
                this.$state = $state;
                this.routes = routes;
            }
            ApplicationDetailNavService.prototype.intoDetailFromApplications = function (cond, page, indexOnPage, totalHits) {
                this.activeMode = this.applicationControllers.applicationList;
                this.setUpListInfo(cond, page, indexOnPage, totalHits);
            };
            ApplicationDetailNavService.prototype.intoDetailFromAllInterviews = function (cond, page, indexOnPage, totalHits) {
                this.activeMode = this.applicationControllers.allInterviewList;
                this.setUpListInfo(cond, page, indexOnPage, totalHits);
            };
            ApplicationDetailNavService.prototype.intoDetailFromMyInterviews = function (cond, page, indexOnPage, totalHits) {
                this.activeMode = this.applicationControllers.myInterviewList;
                this.setUpListInfo(cond, page, indexOnPage, totalHits);
            };
            ApplicationDetailNavService.prototype.setUpListInfo = function (cond, page, indexOnPage, totalHits) {
                this.conditions = cond;
                this.currentPage = page;
                this.indexOnPage = indexOnPage;
                this.totalHits = totalHits;
            };
            ApplicationDetailNavService.prototype.isActive = function () {
                return this.activeMode != null;
            };
            ApplicationDetailNavService.prototype.activeListName = function () {
                return this.activeMode.data.listName;
            };
            ApplicationDetailNavService.prototype.currentItemNumber = function () {
                return this.conditions.offset + this.indexOnPage + 1;
            };
            ApplicationDetailNavService.prototype.totalHitsNumber = function () {
                return this.totalHits;
            };
            ApplicationDetailNavService.prototype.existsNextItem = function () {
                return this.currentItemNumber() < this.totalHits;
            };
            ApplicationDetailNavService.prototype.existsPrevItem = function () {
                return this.currentItemNumber() > 1;
            };
            ApplicationDetailNavService.prototype.conditionsText = function () {
                return angular.toJson(this.conditions);
            };
            ApplicationDetailNavService.prototype.transitionToNextItem = function () {
                var _this = this;
                this.getNextItem().then(function (item) {
                    _this.transitionWithItem(item);
                });
            };
            ApplicationDetailNavService.prototype.transitionToPrevItem = function () {
                var _this = this;
                this.getPrevItem().then(function (item) {
                    _this.transitionWithItem(item);
                });
            };
            ApplicationDetailNavService.prototype.transitionWithItem = function (item) {
                var applicationId = this.extractApplicationIdFromItem(item);
                this.$state.go('details', { applicationId: applicationId });
            };
            ApplicationDetailNavService.prototype.getNextItem = function () {
                if (this.indexOnPage >= (this.conditions.limit - 1)) {
                    this.conditions.offset = this.conditions.offset + this.conditions.limit;
                    return this.fetchPageForAnotherItem(this.conditions, 0);
                }
                else {
                    this.indexOnPage = this.indexOnPage + 1;
                    return this.returnAsPromise(this.currentPage[this.indexOnPage]);
                }
            };
            ApplicationDetailNavService.prototype.getPrevItem = function () {
                if (this.indexOnPage == 0) {
                    this.conditions.offset = this.conditions.offset - this.conditions.limit;
                    return this.fetchPageForAnotherItem(this.conditions, this.conditions.limit - 1);
                }
                else {
                    this.indexOnPage = this.indexOnPage - 1;
                    return this.returnAsPromise(this.currentPage[this.indexOnPage]);
                }
            };
            ApplicationDetailNavService.prototype.fetchPageForAnotherItem = function (params, newIndex) {
                var _this = this;
                var fetcher = this.getActveFetcher();
                return fetcher(params).then(function (res) {
                    _this.indexOnPage = newIndex;
                    _this.currentPage = res.data.hits;
                    _this.totalHits = res.data.resultInfo.totalHits;
                    return res.data.hits[newIndex];
                });
            };
            ApplicationDetailNavService.prototype.getActveFetcher = function () {
                if (this.activeMode.name == this.applicationControllers.applicationList.name) {
                    return this.routes.applications.list;
                }
                if (this.activeMode.name == this.applicationControllers.allInterviewList.name) {
                    return this.routes.interviews.listAll;
                }
                if (this.activeMode.name == this.applicationControllers.myInterviewList.name) {
                    return this.routes.interviews.listMine;
                }
            };
            ApplicationDetailNavService.prototype.extractApplicationIdFromItem = function (item) {
                if (this.activeMode.name == this.applicationControllers.applicationList.name) {
                    var applicationInfo = item;
                    return applicationInfo.id;
                }
                if (this.activeMode.name == this.applicationControllers.allInterviewList.name || this.activeMode.name == this.applicationControllers.myInterviewList.name) {
                    var interview = item;
                    return interview.application.applicationId;
                }
            };
            ApplicationDetailNavService.prototype.backToList = function () {
                this.$state.go(this.activeMode.name, this.conditions);
            };
            ApplicationDetailNavService.prototype.returnAsPromise = function (obj) {
                var injector = angular.injector(['ng']);
                var $q = injector.get('$q');
                var deferred = $q.defer();
                deferred.resolve(obj);
                return deferred.promise;
            };
            return ApplicationDetailNavService;
        })();
        _interview.ApplicationDetailNavService = ApplicationDetailNavService;
    })(interview = service.interview || (service.interview = {}));
})(service || (service = {}));
var stanby;
(function (stanby) {
    var directives;
    (function (directives) {
        var applications;
        (function (applications) {
            var NoteForm = (function () {
                function NoteForm(enums, routes, $scope, $stateParams, stModal, applicationEventsService) {
                    this.enums = enums;
                    this.routes = routes;
                    this.$scope = $scope;
                    this.$stateParams = $stateParams;
                    this.stModal = stModal;
                    this.applicationEventsService = applicationEventsService;
                }
                NoteForm.prototype.init = function () {
                    var _this = this;
                    this.$scope.$watch(function () {
                        return _this.$scope.isCollapsed;
                    }, function (newVal, oldVal) {
                        if (!newVal && oldVal)
                            _this.refreshNoteForm();
                    });
                };
                NoteForm.prototype.submitNote = function () {
                    this.sanitizeNoteForm();
                    var applicationId = this.$stateParams.applicationId;
                    var props = {
                        item: {
                            timelineType: this.enums.timelineType.note,
                            content: this.note
                        }
                    };
                    if (this.$scope.isUpdate) {
                        this.updateNote(props, applicationId);
                    }
                    else {
                        this.createNote(props, applicationId);
                    }
                };
                NoteForm.prototype.updateNote = function (props, applicationId) {
                    var _this = this;
                    this.applicationEventsService.notifyUpdTimelineStart(this.$scope.$root, props);
                    this.routes.applications.updateNote(applicationId, this.note.noteId, this.note).success(function (res) {
                        _this.applicationEventsService.notifyUpdTimelineSuccess(_this.$scope.$root, props);
                        _this.closeSelf();
                        _this.refreshNoteForm();
                    }).error(function () {
                        _this.applicationEventsService.notifyUpdTimelineFailure(_this.$scope.$root, props);
                    });
                };
                NoteForm.prototype.createNote = function (props, applicationId) {
                    var _this = this;
                    this.applicationEventsService.notifyAddTimelineStart(this.$scope.$root, props);
                    this.routes.applications.addNote(applicationId, this.note).success(function (res) {
                        props.item.content.noteId = res.noteId;
                        _this.applicationEventsService.notifyAddTimelineSuccess(_this.$scope.$root, props);
                        _this.closeSelf();
                        _this.refreshNoteForm();
                    }).error(function () {
                        _this.applicationEventsService.notifyAddTimelineFailure(_this.$scope.$root, props);
                    });
                };
                NoteForm.prototype.discardNote = function () {
                    var _this = this;
                    if (_.isEmpty(this.note)) {
                        this.closeSelf();
                    }
                    else {
                        this.stModal.modalConfirm({ msg: '編集中のコメントがありますが取り消しますか？' }).result.then(function () {
                            _this.closeSelf();
                            _this.refreshNoteForm();
                        });
                    }
                };
                NoteForm.prototype.sanitizeNoteForm = function () {
                    if (this.$scope.isUpdate) {
                        if (this.note.noteId == null)
                            throw new Error('No comment id is specified');
                    }
                };
                NoteForm.prototype.refreshNoteForm = function () {
                    if (this.addNoteForm) {
                        this.addNoteForm.$setPristine();
                    }
                    if (this.$scope.isUpdate) {
                        this.note = _.clone(this.$scope.targetModel);
                    }
                    else {
                        this.note = { note: null, isRecOnly: false };
                    }
                };
                NoteForm.prototype.closeSelf = function () {
                    this.$scope.isCollapsed = true;
                };
                return NoteForm;
            })();
            applications.NoteForm = NoteForm;
            var InterviewForm = (function () {
                function InterviewForm($scope, routes, enums, stModal, applicationEventsService, $stateParams) {
                    this.$scope = $scope;
                    this.routes = routes;
                    this.enums = enums;
                    this.stModal = stModal;
                    this.applicationEventsService = applicationEventsService;
                    this.$stateParams = $stateParams;
                    this.isInterviewersListActive = false;
                    this.interviewDate = new Date().toISOString;
                    this.startAtOpened = false;
                    this.endAtOpened = false;
                }
                InterviewForm.prototype.openStartPicker = function ($event) {
                    $event.preventDefault();
                    $event.stopPropagation();
                    this.startAtOpened = true;
                };
                InterviewForm.prototype.openEndPicker = function ($event) {
                    $event.preventDefault();
                    $event.stopPropagation();
                    this.endAtOpened = true;
                };
                InterviewForm.prototype.init = function () {
                    var _this = this;
                    this.$scope.$watch(function () {
                        return _this.$scope.isCollapsed;
                    }, function (newVal, oldVal) {
                        if (!newVal && oldVal)
                            _this.refreshInterviewForm();
                    });
                    this.syncInterviewTimeVariables();
                    this.routes.users.list(null, this.enums.userRole.INT.code).success(function (list) {
                        _this.interviewers = list.users;
                    });
                };
                InterviewForm.prototype.syncInterviewTimeVariables = function () {
                    var _this = this;
                    this.$scope.$watchCollection(function () {
                        return [_this.noInterviewTime, _this.startDate, _this.endDate];
                    }, function (newArray) {
                        if (_this.interview == null) {
                            return;
                        }
                        if (newArray[0] && newArray[0] == true) {
                            _this.interview.startAt = null;
                            _this.interview.endAt = null;
                        }
                        else if (angular.isDate(newArray[1]) && angular.isDate(newArray[2])) {
                            var tmpEndDate = null;
                            if (angular.isDate(_this.interview.startAt)) {
                                var startDate = angular.copy(newArray[1]);
                                startDate.setHours(0, 0, 0, 0);
                                var oldStartDate = angular.copy(_this.interview.startAt);
                                oldStartDate.setHours(0, 0, 0, 0);
                                var startDayDiff = Math.floor((startDate.getTime() - oldStartDate.getTime()) / (1000 * 60 * 60 * 24));
                                if (startDayDiff !== 0) {
                                    tmpEndDate = angular.copy(newArray[1]);
                                    tmpEndDate.setHours(newArray[2].getHours(), newArray[2].getMinutes(), newArray[2].getSeconds(), newArray[2].getMilliseconds());
                                    _this.endDate = tmpEndDate;
                                }
                            }
                            _this.interview.startAt = newArray[1];
                            _this.interview.endAt = _.isNull(tmpEndDate) ? newArray[2] : tmpEndDate;
                        }
                        else {
                            _this.interview.startAt = null;
                            _this.interview.endAt = null;
                        }
                    });
                };
                InterviewForm.prototype.checkFormValidity = function () {
                    if (this.interview && !_.isEmpty(this.interview.title)) {
                        if (this.noInterviewTime == true) {
                            return true;
                        }
                        else if (angular.isDate(this.interview.startAt) && angular.isDate(this.interview.endAt) && this.interview.startAt < this.interview.endAt) {
                            return true;
                        }
                    }
                    return false;
                };
                InterviewForm.prototype.incrementalSearchInterviewers = function () {
                    var _this = this;
                    var invalidWord = _.isEmpty(this.keyword) || this.keyword.trim().length == 0;
                    angular.forEach(this.interviewers, function (user) {
                        if (invalidWord) {
                            user.__NonMatching = false;
                        }
                        else {
                            var regex = new RegExp(_this.keyword);
                            user.__NonMatching = !(user.email.match(regex) || user.fullName.match(regex));
                        }
                    });
                };
                InterviewForm.prototype.setInterviewer = function (user) {
                    this.interview.interviewer.name = user.fullName;
                    this.interview.interviewer.userId = user.id;
                    this.isInterviewersListActive = false;
                };
                InterviewForm.prototype.submitInterview = function () {
                    this.sanitizeInterviewForm(this.$scope.isUpdate);
                    var props = {
                        item: {
                            timelineType: this.enums.timelineType.interview,
                            content: this.interview
                        }
                    };
                    if (this.$scope.isUpdate) {
                        this.updateInterview(props);
                    }
                    else {
                        this.createInterview(props);
                    }
                };
                InterviewForm.prototype.discardInterview = function () {
                    var _this = this;
                    this.stModal.modalConfirm({ msg: '編集中の情報は保存されていません。' }).result.then(function () {
                        _this.refreshInterviewForm();
                        _this.closeSelf();
                    });
                };
                InterviewForm.prototype.updateInterview = function (props) {
                    var _this = this;
                    this.applicationEventsService.notifyUpdTimelineStart(this.$scope.$root, props);
                    var currentVersionNo = this.$scope.targetModel.versionNo;
                    this.interview.versionNo = currentVersionNo.toString();
                    this.routes.interviews.update(this.interview.id, this.interview).success(function () {
                        var versionNo = parseInt(props.item.content.versionNo);
                        props.item.content.versionNo = (versionNo + 1).toString();
                        _this.applicationEventsService.notifyUpdTimelineSuccess(_this.$scope.$root, props);
                        _this.refreshInterviewForm();
                        _this.closeSelf();
                    }).error(function () {
                        _this.applicationEventsService.notifyUpdTimelineFailure(_this.$scope.$root, props);
                    });
                };
                InterviewForm.prototype.createInterview = function (props) {
                    var _this = this;
                    this.applicationEventsService.notifyAddTimelineStart(this.$scope.$root, props);
                    this.routes.interviews.create(this.interview).success(function (res) {
                        props.item.content.id = res.interviewId;
                        props.item.content.versionNo = '0';
                        _this.applicationEventsService.notifyAddTimelineSuccess(_this.$scope.$root, props);
                        _this.refreshInterviewForm();
                        _this.closeSelf();
                    }).error(function (error) {
                        _this.applicationEventsService.notifyAddTimelineFailure(_this.$scope.$root, props, error);
                    });
                };
                InterviewForm.prototype.sanitizeInterviewForm = function (isUpdate) {
                    var _this = this;
                    if (this.interview.interviewer && this.interview.interviewer.userId) {
                        var found = _.find(this.interviewers, function (user) {
                            return user.id == _this.interview.interviewer.userId;
                        });
                        if (this.interview.interviewer.name == null) {
                            this.interview.interviewer.userId = null;
                        }
                        else if (this.interview.interviewer.name.trim() != found.fullName) {
                            this.interview.interviewer.userId = null;
                        }
                    }
                    if (isUpdate) {
                        this.interview.versionNo = this.interview.versionNo.toString();
                    }
                    if (isUpdate && !this.interview.id)
                        throw new Error('Interview ID is not specified');
                    if (!isUpdate && this.interview.id)
                        throw new Error('Interview ID must not be specified');
                    this.interview.applicationId = this.$stateParams.applicationId;
                };
                InterviewForm.prototype.refreshInterviewForm = function () {
                    if (this.interviewForm) {
                        this.interviewForm.$setPristine();
                    }
                    if (this.$scope.isUpdate) {
                        this.interview = _.clone(this.$scope.targetModel);
                        if (this.interview.startAt || this.interview.endAt) {
                            this.noInterviewTime = false;
                            this.startDate = new Date(this.interview.startAt);
                            this.endDate = new Date(this.interview.endAt);
                        }
                        else {
                            this.noInterviewTime = true;
                            this.resetStartEndDates();
                        }
                    }
                    else {
                        this.interview = {
                            title: null,
                            interviewer: {
                                userId: null,
                                name: null
                            },
                            interviewType: this.enums.interviewType.INT.code
                        };
                        this.noInterviewTime = false;
                        this.resetStartEndDates();
                    }
                };
                InterviewForm.prototype.resetStartEndDates = function () {
                    var start = new Date();
                    start.setMinutes(0, 0, 0);
                    this.startDate = start;
                    var end = new Date();
                    end.setHours(end.getHours() + 1, 0, 0, 0);
                    this.endDate = end;
                };
                InterviewForm.prototype.closeSelf = function () {
                    this.$scope.isCollapsed = true;
                };
                return InterviewForm;
            })();
            applications.InterviewForm = InterviewForm;
            var DocscreeningForm = (function () {
                function DocscreeningForm($scope, routes, enums, stModal, applicationEventsService, $stateParams) {
                    this.$scope = $scope;
                    this.routes = routes;
                    this.enums = enums;
                    this.stModal = stModal;
                    this.applicationEventsService = applicationEventsService;
                    this.$stateParams = $stateParams;
                    this.isInterviewersListActive = false;
                }
                DocscreeningForm.prototype.init = function () {
                    var _this = this;
                    this.$scope.$watch(function () {
                        return _this.$scope.isCollapsed;
                    }, function (newVal, oldVal) {
                        if (!newVal && oldVal)
                            _this.refreshDocScreeningForm();
                    });
                    this.routes.users.list(null, this.enums.userRole.INT.code).success(function (list) {
                        _this.interviewers = list.users;
                    });
                };
                DocscreeningForm.prototype.incrementalSearchInterviewers = function () {
                    var _this = this;
                    var invalidWord = _.isEmpty(this.keyword) || this.keyword.trim().length == 0;
                    angular.forEach(this.interviewers, function (user) {
                        if (invalidWord) {
                            user.__NonMatching = false;
                        }
                        else {
                            var regex = new RegExp(_this.keyword);
                            user.__NonMatching = !(user.email.match(regex) || user.fullName.match(regex));
                        }
                    });
                };
                DocscreeningForm.prototype.setInterviewer = function (user) {
                    this.docScreening.title = '書類選考依頼';
                    this.docScreening.interviewer.name = user.fullName;
                    this.docScreening.interviewer.userId = user.id;
                    this.isInterviewersListActive = false;
                };
                DocscreeningForm.prototype.submitDocScreening = function () {
                    this.sanitizeDocScreeningForm(this.$scope.isUpdate);
                    var props = {
                        item: {
                            timelineType: this.enums.timelineType.docscreening,
                            content: this.docScreening
                        }
                    };
                    if (this.$scope.isUpdate) {
                        this.updateDocScreening(props);
                    }
                    else {
                        this.createDocScreening(props);
                    }
                };
                DocscreeningForm.prototype.discardDocScreening = function () {
                    var _this = this;
                    this.stModal.modalConfirm({ msg: '編集中の情報は保存されていません。' }).result.then(function () {
                        _this.closeSelf();
                        _this.refreshDocScreeningForm();
                    });
                };
                DocscreeningForm.prototype.updateDocScreening = function (props) {
                    var _this = this;
                    this.applicationEventsService.notifyUpdTimelineStart(this.$scope.$root, props);
                    this.routes.docscreenings.update(this.docScreening.id, this.docScreening).success(function () {
                        var versionNo = parseInt(props.item.content.versionNo);
                        props.item.content.versionNo = (versionNo + 1).toString();
                        _this.applicationEventsService.notifyUpdTimelineSuccess(_this.$scope.$root, props);
                        _this.closeSelf();
                        _this.refreshDocScreeningForm();
                    }).error(function () {
                        _this.applicationEventsService.notifyUpdTimelineFailure(_this.$scope.$root, props);
                    });
                };
                DocscreeningForm.prototype.createDocScreening = function (props) {
                    var _this = this;
                    this.applicationEventsService.notifyAddTimelineStart(this.$scope.$root, props);
                    this.routes.docscreenings.create(this.docScreening).success(function (res) {
                        props.item.content.id = res.interviewId;
                        props.item.content.versionNo = '0';
                        _this.applicationEventsService.notifyAddTimelineSuccess(_this.$scope.$root, props);
                        _this.closeSelf();
                        _this.refreshDocScreeningForm();
                    }).error(function () {
                        _this.applicationEventsService.notifyAddTimelineFailure(_this.$scope.$root, props);
                    });
                };
                DocscreeningForm.prototype.sanitizeDocScreeningForm = function (isUpdate) {
                    var _this = this;
                    if (this.docScreening.interviewer && this.docScreening.interviewer.userId) {
                        var found = _.find(this.interviewers, function (user) {
                            return user.id == _this.docScreening.interviewer.userId;
                        });
                        if (this.docScreening.interviewer.name == null) {
                            this.docScreening.interviewer.userId = null;
                        }
                        else if (this.docScreening.interviewer.name.trim() != found.fullName) {
                            this.docScreening.interviewer.userId = null;
                        }
                    }
                    if (isUpdate) {
                        this.docScreening.versionNo = this.docScreening.versionNo.toString();
                    }
                    if (isUpdate && !this.docScreening.id)
                        throw new Error('Interview ID is not specified');
                    if (!isUpdate && this.docScreening.id)
                        throw new Error('Interview ID must not be specified');
                    this.docScreening.applicationId = this.$stateParams.applicationId;
                };
                DocscreeningForm.prototype.refreshDocScreeningForm = function () {
                    if (this.docscreeningForm) {
                        this.docscreeningForm.$setPristine();
                    }
                    if (this.$scope.isUpdate) {
                        this.docScreening = _.clone(this.$scope.targetModel);
                    }
                    else {
                        this.docScreening = {
                            title: null,
                            interviewer: {
                                userId: null,
                                name: null
                            },
                            interviewType: this.enums.interviewType.DOC.code
                        };
                    }
                };
                DocscreeningForm.prototype.closeSelf = function () {
                    this.$scope.isCollapsed = true;
                };
                return DocscreeningForm;
            })();
            applications.DocscreeningForm = DocscreeningForm;
            var FeedbackFormCtrl = (function () {
                function FeedbackFormCtrl($scope, routes, applicationEventsService, enums, stModal, stUtils) {
                    this.$scope = $scope;
                    this.routes = routes;
                    this.applicationEventsService = applicationEventsService;
                    this.enums = enums;
                    this.stModal = stModal;
                    this.stUtils = stUtils;
                }
                FeedbackFormCtrl.prototype.init = function () {
                    var _this = this;
                    this.feedbackGrade = _.cloneDeep(this.enums.interviewFeedbackGrade);
                    this.$scope.$watch(function () {
                        return _this.$scope.isCollapsed;
                    }, function (newVal) {
                        if (!newVal)
                            _this.refreshFeedbackForm();
                    });
                };
                FeedbackFormCtrl.prototype.submitFeedback = function () {
                    var _this = this;
                    if (this.feedback == null || this.feedback.grade == null) {
                        this.stUtils.toastDanger('評価グレードが指定されていません');
                        return;
                    }
                    if (this.feedback.summary == null || this.feedback.summary == "") {
                        this.stUtils.toastDanger('コメントを入力してください');
                        return;
                    }
                    this.feedback.grade = this.feedback.grade ? this.feedback.grade.toString() : null;
                    var props = {
                        item: {
                            timelineType: this.enums.timelineType.feedback,
                            content: this.feedback
                        }
                    };
                    if (this.$scope.isUpdate) {
                        this.applicationEventsService.notifyAddTimelineStart(this.$scope.$root, props);
                        if (this.$scope.resolved.interviewType === this.enums.interviewType.INT.code) {
                            this.routes.interviews.updateFeedback(this.feedback.interviewId, this.feedback.feedbackId, this.feedback).success(function (res) {
                                _this.closeSelf();
                                _this.refreshFeedbackForm();
                                _this.applicationEventsService.notifyUpdTimelineSuccess(_this.$scope.$root, props);
                            }).error(function () {
                                _this.applicationEventsService.notifyUpdTimelineFailure(_this.$scope.$root, props);
                            });
                        }
                        else {
                            this.routes.docscreenings.updateFeedback(this.feedback.interviewId, this.feedback.feedbackId, this.feedback).success(function (res) {
                                _this.closeSelf();
                                _this.refreshFeedbackForm();
                                _this.applicationEventsService.notifyUpdTimelineSuccess(_this.$scope.$root, props);
                            }).error(function () {
                                _this.applicationEventsService.notifyUpdTimelineFailure(_this.$scope.$root, props);
                            });
                        }
                    }
                    else {
                        this.applicationEventsService.notifyAddTimelineStart(this.$scope.$root, props);
                        if (this.$scope.resolved.interviewType === this.enums.interviewType.INT.code) {
                            this.routes.interviews.addFeedback(this.feedback.interviewId, this.feedback).success(function (res) {
                                _this.closeSelf();
                                _this.refreshFeedbackForm();
                                props.item.content.feedbackId = res.feedbackId;
                                _this.applicationEventsService.notifyAddTimelineSuccess(_this.$scope.$root, props);
                            }).error(function (res) {
                                _this.applicationEventsService.notifyAddTimelineFailure(_this.$scope.$root, props);
                            });
                        }
                        else {
                            this.routes.docscreenings.addFeedback(this.feedback.interviewId, this.feedback).success(function (res) {
                                _this.closeSelf();
                                _this.refreshFeedbackForm();
                                props.item.content.feedbackId = res.feedbackId;
                                _this.applicationEventsService.notifyAddTimelineSuccess(_this.$scope.$root, props);
                            }).error(function (res) {
                                _this.applicationEventsService.notifyAddTimelineFailure(_this.$scope.$root, props);
                            });
                        }
                    }
                };
                FeedbackFormCtrl.prototype.discard = function () {
                    var _this = this;
                    this.stModal.modalConfirm({ msg: '編集中の情報は保存されていません。' }).result.then(function () {
                        _this.closeSelf();
                        _this.refreshFeedbackForm();
                    });
                };
                FeedbackFormCtrl.prototype.closeSelf = function () {
                    this.$scope.isCollapsed = true;
                };
                FeedbackFormCtrl.prototype.refreshFeedbackForm = function () {
                    if (this.feedbackForm) {
                        this.feedbackForm.$setPristine();
                    }
                    if (this.$scope.isUpdate) {
                        this.feedback = _.clone(this.$scope.targetModel);
                    }
                    else {
                        this.feedback = {
                            interviewId: this.$scope.resolved.interviewId,
                            interviewType: this.$scope.resolved.interviewType,
                            interviewTitle: this.$scope.resolved.interviewTitle,
                            grade: null,
                            summary: null
                        };
                    }
                };
                return FeedbackFormCtrl;
            })();
            applications.FeedbackFormCtrl = FeedbackFormCtrl;
            function registerDirectives() {
                var noteFormDirective = {
                    prefix: 'stNoteForm',
                    controller: 'NoteFormCtrl as c',
                    templateUrl: '/internal/directives/applications/st-note-form-collapse'
                };
                var interviewFormDirective = {
                    prefix: 'stInterviewForm',
                    controller: 'InterviewFormCtrl as c',
                    templateUrl: '/internal/directives/applications/st-interview-form-collapse'
                };
                var docscreeningFormDirective = {
                    prefix: 'stDocscreeningForm',
                    controller: 'DocscreeningFormCtrl as c',
                    templateUrl: '/internal/directives/applications/st-docscreening-form-collapse'
                };
                var feedbackFormDirective = {
                    prefix: 'stFeedbackForm',
                    controller: 'FeedbackFormCtrl as c',
                    templateUrl: '/internal/directives/applications/st-feedback-form-collapse'
                };
                angular.module('stanbyDirectives').controller('NoteFormCtrl', NoteForm).controller('InterviewFormCtrl', InterviewForm).controller('DocscreeningFormCtrl', DocscreeningForm).controller('FeedbackFormCtrl', FeedbackFormCtrl);
                registerCollapseDirective(noteFormDirective);
                registerCollapseDirective(interviewFormDirective);
                registerCollapseDirective(docscreeningFormDirective);
                registerCollapseDirective(feedbackFormDirective);
            }
            applications.registerDirectives = registerDirectives;
            function registerCollapseDirective(config) {
                var clickDirective = config.prefix + 'Click';
                var collapseDirective = config.prefix + 'Collapse';
                var clickEventName = config.prefix + 'Clicked';
                var toggledEventName = config.prefix + 'Toggled';
                angular.module('stanbyDirectives').directive(clickDirective, function () {
                    return {
                        restrict: 'A',
                        compile: function ($elem, $attr) {
                            if (!$attr[clickDirective])
                                throw new Error('Collapse target identifier is not specified: ' + clickDirective);
                            return function ($scope, $iElem, $attrs) {
                                var interporatedId = interpolateWithCustomSymbol($attr[clickDirective], $scope);
                                $iElem.on('click', function (e) {
                                    $scope.$root.$broadcast(clickEventName, e, interporatedId);
                                });
                                $scope.$on(toggledEventName, function (event, id, isCollapsed) {
                                    var hideId = $("[st-feedback-form-click=\"" + id + "\"]").parent().attr('id');
                                    var $hideTarget = hideId ? angular.element('#' + hideId) : $iElem;
                                    if ($hideTarget.parent().is('#jsi-command-box')) {
                                        $hideTarget = $hideTarget.parent();
                                    }
                                    if (id == interporatedId) {
                                        if (isCollapsed) {
                                            $hideTarget.stop().fadeIn(300);
                                        }
                                        else {
                                            $hideTarget.stop().fadeOut(300);
                                        }
                                    }
                                });
                            };
                        }
                    };
                }).directive(collapseDirective, function ($compile) {
                    return {
                        restrict: 'A',
                        templateUrl: config.templateUrl,
                        controller: config.controller,
                        scope: {},
                        compile: function ($elem, $attr) {
                            var stCreate = $attr.stCreate;
                            var stUpdate = $attr.stUpdate;
                            var ngModelExpr = $attr.ngModel;
                            if (!$attr[collapseDirective])
                                throw new Error('Collapse target identifier is not specified: ' + collapseDirective);
                            if (stCreate == null && stUpdate == null) {
                                throw new Error('You need to specify stCreate/stUpdate attribute (also ngModel only for stUpdate): ' + collapseDirective);
                            }
                            else if (stUpdate != null && ngModelExpr == null) {
                                throw new Error('You need to specify stCreate/stUpdate attribute (also ngModel only for stUpdate): ' + collapseDirective);
                            }
                            return function ($scope, $iElem) {
                                var interporatedId = interpolateWithCustomSymbol($attr[collapseDirective], $scope.$parent);
                                if ($attr.stResolve)
                                    $scope.resolved = $scope.$parent.$eval($attr.stResolve);
                                $scope.isCollapsed = true;
                                var resetEditingInfo = function () {
                                    if (stUpdate != null && ngModelExpr != null) {
                                        $scope.isUpdate = true;
                                        $scope.targetModel = $scope.$parent.$eval(ngModelExpr);
                                    }
                                    else {
                                        $scope.isUpdate = false;
                                    }
                                };
                                resetEditingInfo();
                                $scope.$watch(function () {
                                    return $scope.isCollapsed;
                                }, function (isCollapsed) {
                                    $scope.$root.$broadcast(toggledEventName, interporatedId, isCollapsed);
                                });
                                $scope.$on(clickEventName, function (data, e, id) {
                                    if (interporatedId == id) {
                                        $scope.$apply(function () {
                                            if ($scope.isCollapsed) {
                                                var $section1 = $(e.target).closest('section');
                                                var $section2 = $iElem.closest('section');
                                                resetEditingInfo();
                                                if ($section1[0] == $section2[0])
                                                    $scope.isCollapsed = false;
                                            }
                                        });
                                    }
                                });
                            };
                        }
                    };
                });
                function interpolateWithCustomSymbol(text, $scope) {
                    if (text) {
                        var $interpolate = angular.injector(['ng']).get('$interpolate');
                        var normalized = text.replace('{%', '{{').replace('%}', '}}');
                        return $interpolate(normalized)($scope);
                    }
                    else {
                        return text;
                    }
                }
                ;
            }
        })(applications = directives.applications || (directives.applications = {}));
    })(directives = stanby.directives || (stanby.directives = {}));
})(stanby || (stanby = {}));
var controllers;
(function (controllers) {
    var application;
    (function (application) {
        var ApplicationControllers = (function () {
            function ApplicationControllers(enums) {
                this.enums = enums;
                this.applicationList = {
                    name: 'list',
                    url: '/?offset&limit&interviewType&keyword&jobId&statuses',
                    templateUrl: '/internal/controllers/applications/list',
                    controller: 'ApplicationListCtrl as c',
                    roles: [this.enums.userRole.REC.code],
                    data: {
                        listName: '応募者'
                    },
                    onEnter: function ($rootScope) {
                        $rootScope.$emit('breadcrumbs', [
                            { url: '/', text: 'Stanby Recruiting' },
                            { url: '', text: '応募者' }
                        ]);
                    }
                };
                this.allInterviewList = {
                    name: 'rec_interviews',
                    url: '/interviews?offset&limit&interviewType&feedback&from&to',
                    roles: [this.enums.userRole.REC.code],
                    templateUrl: '/internal/interview/rec_list',
                    controller: 'RecruiterIntListCtrl as c',
                    data: {
                        listName: '選考（すべての選考）'
                    },
                    onEnter: function ($rootScope) {
                        $rootScope.$emit('breadcrumbs', [
                            { url: '/', text: 'Stanby Recruiting' },
                            { url: '', text: '選考（すべての選考）' }
                        ]);
                    }
                };
                this.myInterviewList = {
                    name: 'int_interviews',
                    url: '/interviews/mine?offset&limit&interviewType&feedback&from&to',
                    roles: [this.enums.userRole.INT.code],
                    templateUrl: '/internal/interview/int_list',
                    controller: 'InterviewerIntListCtrl as c',
                    data: {
                        listName: '担当の選考）'
                    },
                    onEnter: function ($rootScope) {
                        $rootScope.$emit('breadcrumbs', [
                            { url: '/', text: 'Stanby Recruiting' },
                            { url: '', text: '担当の選考' }
                        ]);
                    }
                };
            }
            return ApplicationControllers;
        })();
        application.ApplicationControllers = ApplicationControllers;
    })(application = controllers.application || (controllers.application = {}));
})(controllers || (controllers = {}));
var stanby;
(function (stanby) {
    var routing;
    (function (routing) {
        var applications;
        (function (applications) {
            function initRouting() {
                stanby.directives.applications.registerDirectives();
                angular.module('stanbyControllers').service('applicationEventsService', controllers.application.ApplicationEventsService).provider('applicationControllers', function (enums) {
                    return {
                        $get: function () {
                            return new controllers.application.ApplicationControllers(enums);
                        }
                    };
                }).controller('ApplicationDetailCtrl', controllers.application.ApplicationDetail).controller('ApplicationDetailNavCtrl', controllers.application.ApplicationDetailNav).controller('ApplicationSummaryCtrl', controllers.application.ApplicationSummary).controller('ApplicationActionCtrl', controllers.application.ApplicationAction).controller('ApplicationTimelineCtrl', controllers.application.ApplicationTimeline).controller('ApplicationOriginalCtrl', controllers.application.ApplicationOriginal).controller('ApplicationEditCtrl', controllers.application.ApplicationEdit).controller('ApplicationListCtrl', controllers.application.ApplicationList).controller('RecruiterIntListCtrl', controllers.interview.RecruiterList).controller('InterviewerIntListCtrl', controllers.interview.InterviewerList).config(function ($stateProvider, $urlRouterProvider, applicationControllersProvider, enums) {
                    var applicationControllers = applicationControllersProvider.$get();
                    $urlRouterProvider.otherwise('/');
                    $stateProvider.state(applicationControllers.applicationList).state(applicationControllers.allInterviewList).state(applicationControllers.myInterviewList).state('details', {
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
                            applicationPromise: function ($stateParams, routes) {
                                return routes.applications.details($stateParams.applicationId).then(function (res) {
                                    return res.data.application;
                                });
                            },
                            accountInfoPromise: function (stbUser) {
                                return stbUser.getAccountInfoPromise();
                            },
                            messageMarkdownToHtmlPromise: function (applicationPromise, routes) {
                                if (applicationPromise.message) {
                                    return routes.utils.convertMarkdownToHtml(applicationPromise.message);
                                }
                                else {
                                    return null;
                                }
                            },
                            resumeMarkdownToHtmlPromise: function (applicationPromise, routes) {
                                if (applicationPromise.resumeFreeText) {
                                    return routes.utils.convertMarkdownToHtml(applicationPromise.resumeFreeText);
                                }
                                else {
                                    return null;
                                }
                            }
                        },
                        onEnter: function ($rootScope, applicationPromise, accountInfoPromise, enums) {
                            var job = applicationPromise.job;
                            var userRole = accountInfoPromise.roles;
                            if (_.contains(userRole, enums.userRole.ADM.code) || _.contains(userRole, enums.userRole.REC.code)) {
                                $rootScope.$emit('breadcrumbs', [
                                    { url: '/', text: 'Stanby Recruiting' },
                                    { url: '/application#/', text: '応募者' },
                                    { url: '', text: job.jobName }
                                ]);
                            }
                            else {
                                $rootScope.$emit('breadcrumbs', [
                                    { url: '/', text: 'Stanby Recruiting' },
                                    { url: '', text: job.jobName }
                                ]);
                            }
                        }
                    }).state('add', {
                        url: '/add',
                        templateUrl: '/internal/controllers/applications/edit',
                        controller: 'ApplicationEditCtrl as acc',
                        roles: [enums.userRole.REC.code],
                        resolve: {
                            applicationFetchPromise: function () {
                                return null;
                            },
                            jobListPromise: function (routes) {
                                return routes.jobs.list().success(function (jobs) {
                                    return jobs;
                                });
                            }
                        },
                        onEnter: function ($rootScope) {
                            $rootScope.$emit('breadcrumbs', [
                                { url: '/', text: 'Stanby Recruiting' },
                                { url: '/application#/', text: '応募者' },
                                { url: '', text: '応募者情報入力' }
                            ]);
                        }
                    }).state('edit', {
                        url: '/:applicationId/edit',
                        templateUrl: '/internal/controllers/applications/edit',
                        controller: 'ApplicationEditCtrl as acc',
                        roles: [enums.userRole.REC.code],
                        resolve: {
                            applicationFetchPromise: function ($stateParams, routes) {
                                var applicationId = $stateParams['applicationId'];
                                return routes.applications.details(applicationId).success(function (applicationResponse) {
                                    return applicationResponse;
                                });
                            },
                            jobListPromise: function (routes) {
                                return routes.jobs.list().success(function (jobs) {
                                    return jobs;
                                });
                            }
                        },
                        onEnter: function ($rootScope, applicationFetchPromise) {
                            var application = applicationFetchPromise.data.application;
                            $rootScope.$emit('breadcrumbs', [
                                { url: '/', text: 'Stanby Recruiting' },
                                { url: '/application#/', text: '応募者' },
                                { url: '/application#/' + application.id, text: application.job.jobName },
                                { url: '', text: application.profile.fullName }
                            ]);
                        }
                    }).state('print_interviews', {
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
                                resolve: { mineOnly: function () {
                                    return true;
                                } }
                            }
                        }
                    });
                });
                angular.module('stanbyServices').service('stApplicationDetailNavService', service.interview.ApplicationDetailNavService);
            }
            applications.initRouting = initRouting;
        })(applications = routing.applications || (routing.applications = {}));
    })(routing = stanby.routing || (stanby.routing = {}));
})(stanby || (stanby = {}));

stanby.routing.applications.initRouting();

//# sourceMappingURL=../scripts/application-page.js.map