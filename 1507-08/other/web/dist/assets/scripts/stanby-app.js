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



Array.prototype.moveAndShift = function (targetIndex, insertIndex) {
    var val = this.splice(targetIndex, 1)[0];
    this.splice(insertIndex, 0, val);
    return this;
};

var stanby;
(function (stanby) {
    var directives;
    (function (_directives) {
        var common;
        (function (common) {
            var directives;
            (function (directives) {
                function initCommonDirectives() {
                    angular.module('stanbyDirectives', ['stanbyControllers']).directive('stInclude', function ($http, $compile) {
                        return function (scope, element, attr) {
                            $http.get(attr.stInclude).success(function (response) {
                                element.html(response);
                                $compile(element.contents())(scope);
                            });
                        };
                    }).directive('stValidatePhone', ['routes', '$q', function (routes, $q) {
                        return {
                            restrict: 'A',
                            require: 'ngModel',
                            link: function (scope, iElement, iAttrs, ctrl) {
                                var PHONE_REGEX = /^(\+[1-9][0-9]*(\([0-9]*\)|-[0-9]*-))?[0]?[1-9][0-9\- ]*$/;
                                var VALIDATION_KEY = 'phone';
                                ctrl.$asyncValidators[VALIDATION_KEY] = function (modelValue, viewValue) {
                                    var val = modelValue || viewValue;
                                    var deferred = $q.defer();
                                    if (val == null || val == '') {
                                        deferred.resolve();
                                        return deferred.promise;
                                    }
                                    if (!PHONE_REGEX.test(val)) {
                                        deferred.reject();
                                        return deferred.promise;
                                    }
                                    routes.validation.phone(val).success(function () {
                                        return deferred.resolve();
                                    }).error(function (err, status) {
                                        if (status != 400)
                                            deferred.resolve();
                                        else
                                            deferred.reject();
                                    });
                                    return deferred.promise;
                                };
                            }
                        };
                    }]).directive('stValidatePostal', ['routes', function (routes) {
                        return {
                            restrict: 'A',
                            require: 'ngModel',
                            link: function (scope, iElement, iAttrs, ctrl) {
                                var POSTAL_REGEX = /^\d{3}[\-]?\d{4}$/;
                                var VALIDATION_KEY = 'postal';
                                var validateFn = function () {
                                    var viewValue = ctrl.$viewValue;
                                    if (viewValue == null || $.trim(viewValue) == '') {
                                        ctrl.$setValidity(VALIDATION_KEY, true);
                                        return;
                                    }
                                    if (!POSTAL_REGEX.test(viewValue)) {
                                        ctrl.$setValidity(VALIDATION_KEY, false);
                                        return;
                                    }
                                    routes.validation.postalCode(viewValue).success(function (msg) {
                                        return ctrl.$setValidity(VALIDATION_KEY, !(msg.key && msg.key === "error.notFound"));
                                    }).error(function (data, status) {
                                        ctrl.$setValidity(VALIDATION_KEY, true);
                                    });
                                };
                                iElement.on('blur', validateFn);
                            }
                        };
                    }]).directive('stValidateEmail', [function () {
                        return {
                            restrict: 'A',
                            require: 'ngModel',
                            link: function (scope, iElement, iAttrs, ctrl) {
                                var EMAIL_REGEX = /^[a-zA-Z0-9\.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
                                var VALIDATION_KEY = 'stEmail';
                                ctrl.$validators[VALIDATION_KEY] = function (modelVal, viewVal) {
                                    var val = modelVal || viewVal;
                                    if (val == null || val.trim().length == 0) {
                                        return true;
                                    }
                                    return EMAIL_REGEX.test(val);
                                };
                            }
                        };
                    }]).directive('stValidateEmailDuplicate', ['routes', '$q', function (routes, $q) {
                        return {
                            restrict: 'A',
                            require: 'ngModel',
                            link: function (scope, iElement, iAttrs, ctrl) {
                                var VALIDATION_KEY = 'stEmailDuplicate';
                                ctrl.$asyncValidators[VALIDATION_KEY] = function (modelVal, viewVal) {
                                    var val = modelVal || viewVal;
                                    var deferred = $q.defer();
                                    _.forEach(ctrl.$error, function (val, key) {
                                        if (val && key != VALIDATION_KEY) {
                                            deferred.resolve();
                                            return deferred.promise;
                                        }
                                    });
                                    if (val == null || val.trim().length == 0) {
                                        deferred.resolve();
                                        return deferred.promise;
                                    }
                                    routes.validation.emailDuplicate(val).success(function (msg) {
                                        if (msg.key !== 'error.profile.emailDuplication') {
                                            return deferred.resolve();
                                        }
                                        else {
                                            return deferred.reject();
                                        }
                                    });
                                    return deferred.promise;
                                };
                            }
                        };
                    }]).directive('stValidateEmailDuplicateForUpdate', ['routes', function (routes) {
                        return {
                            restrict: 'A',
                            require: 'ngModel',
                            link: function (scope, iElement, iAttrs, ctrl) {
                                var VALIDATION_KEY = 'stEmailDuplicate';
                                var validateFn = function () {
                                    var emailExpr = iAttrs.stValidateEmailDuplicateForUpdate;
                                    var currentEmail = scope.$eval(emailExpr);
                                    ctrl.$setValidity(VALIDATION_KEY, true);
                                    var viewValue = ctrl.$viewValue;
                                    var hasAnotherError = false;
                                    _.forEach(ctrl.$error, function (val, key) {
                                        hasAnotherError = (val && key != VALIDATION_KEY);
                                    });
                                    if (viewValue == null || $.trim(viewValue) == '' || hasAnotherError) {
                                        return;
                                    }
                                    routes.validation.emailDuplicateForUpdate(viewValue, currentEmail).success(function () {
                                        ctrl.$setValidity(VALIDATION_KEY, true);
                                    }).error(function (data, status) {
                                        if (status == 400) {
                                            if (data.key == 'error.profile.emailDuplication') {
                                                ctrl.$setValidity(VALIDATION_KEY, false);
                                            }
                                        }
                                    });
                                };
                                iElement.on('keyup', _.debounce(validateFn, 1000));
                            }
                        };
                    }]).directive('stAllowPattern', ['routes', function () {
                        return {
                            restrict: 'A',
                            require: 'ngModel',
                            link: function (scope, element, attrs, ngModel) {
                                var pattern = attrs.stAllowPattern;
                                var match = pattern.match(/^\/(.*)\/$/);
                                var regex = new RegExp(match[1]);
                                scope.$watch(attrs.ngModel, function (newValue, oldValue) {
                                    if (ngModel.$viewValue == null || $.trim(ngModel.$viewValue) == '') {
                                        return;
                                    }
                                    if (regex.test(ngModel.$viewValue)) {
                                        return;
                                    }
                                    else {
                                        ngModel.$setViewValue(oldValue);
                                        ngModel.$render();
                                    }
                                });
                            }
                        };
                    }]).directive('stIframePost', ['stUtils', function (stUtils) {
                        return {
                            restrict: 'A',
                            scope: true,
                            link: function (scope, element, attrs) {
                                var selfAttr = attrs.stIframePost;
                                var readyAttr = attrs.stPostReady;
                                function execFunc(postFuncExpr) {
                                    var resPromise = scope.$eval(postFuncExpr);
                                    var extractDoc = function (elem) {
                                        var iframe = element.context;
                                        var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                                        if (iframeDoc == null || iframeDoc == undefined) {
                                            stUtils.toastDanger('お使いのブラウザではプレビューがご利用いただけません。');
                                        }
                                        return iframeDoc;
                                    };
                                    resPromise.success(function (html) {
                                        var iframeDoc = extractDoc(element);
                                        if (iframeDoc) {
                                            iframeDoc.open();
                                            iframeDoc.write(html);
                                            iframeDoc.close();
                                            element.on('load', function () {
                                                $(iframeDoc).find('a').css({ pointerEvents: 'none' });
                                            });
                                        }
                                    }).error(function (xhr) {
                                        var iframeDoc = extractDoc(element);
                                        if (iframeDoc) {
                                            iframeDoc.open();
                                            iframeDoc.writeln('<p>プレビューの取得に失敗しました</p>');
                                            iframeDoc.close();
                                        }
                                    });
                                }
                                var isReady = scope.$eval(readyAttr);
                                if (readyAttr && !isReady) {
                                    scope.$watch(readyAttr, function (newval, oldval) {
                                        if (newval == true)
                                            execFunc(selfAttr);
                                    });
                                }
                                else {
                                    execFunc(selfAttr);
                                }
                            }
                        };
                    }]).directive('stbTooltip', ['$compile', '$timeout', function ($compile, $timeout) {
                        return {
                            restrict: 'A',
                            require: '?ngModel',
                            compile: function (elem, attrs) {
                                var content = attrs.stbTooltip;
                                content = content.replace(/\\n/, '<br/>');
                                return function (scope, iElem, iAttr, ngModel) {
                                    var tooltipScope = scope.$new();
                                    var tt = angular.element('<div class="sg-tooltip-explain">' + content + '</div>');
                                    tt.appendTo('body');
                                    $compile(tt)(tooltipScope);
                                    iElem.on('keyup', function () {
                                        updateViewLength();
                                    });
                                    $(iElem).on('$destroy', function () {
                                        hideTooltip(iElem, tt);
                                    });
                                    iElem.change(function () {
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
                                    tt.on('mouseenter', function () {
                                        hideTooltip(iElem, tt);
                                    });
                                    tt.on('click', function () {
                                        hideTooltip(iElem, tt);
                                    });
                                    function updateViewLength() {
                                        $timeout(function () {
                                            scope.$apply(function () {
                                                tooltipScope.$viewLength = iElem.val() ? iElem.val().length : 0;
                                            });
                                        });
                                    }
                                    function showTooltip(element, tooltip) {
                                        var absOffsetTop = element.offset().top;
                                        var absOffsetLeft = element.offset().left;
                                        var height = tooltip.outerHeight();
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
                                    }
                                    ;
                                    function hideTooltip(element, tooltip) {
                                        tooltip.css({
                                            display: 'none'
                                        });
                                        tooltip.stop().animate({
                                            opacity: 0
                                        }, 300, 'easeOutExpo');
                                    }
                                };
                            }
                        };
                    }]).directive('stLinkTooltip', function () {
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
                                        var offsetTopTarget = 0, offsetLeftTarget = 0;
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
                                        var _this = this;
                                        this.$tooltip.stop().animate({
                                            opacity: 0
                                        }, 300, function () {
                                            _this.$tooltip.hide();
                                        });
                                    }
                                };
                                self.init();
                            }
                        };
                    }).directive('stImageup', function ($compile) {
                        return {
                            restrict: 'A',
                            link: function (scope, $element) {
                                var methods = {
                                    init: function () {
                                        methods.bindEvents();
                                    },
                                    bindEvents: function () {
                                        $element.on('change', function (e) {
                                            var params = scope.$eval($element.attr('st-imageup')), file = e.target.files[0];
                                            params.form = new FormData();
                                            params.form.append('image', file);
                                            params.fn(params);
                                        });
                                    }
                                };
                                methods.init();
                            }
                        };
                    }).directive('stInlineUpload', function ($compile) {
                        return {
                            restrict: 'A',
                            link: function (scope, $element) {
                                var methods = {
                                    init: function () {
                                        methods.bindEvents();
                                    },
                                    bindEvents: function () {
                                        $element.on('drop', function (e) {
                                            var params = scope.$eval($element.attr('st-inline-upload')), file = e.originalEvent.dataTransfer.files[0];
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
                        };
                    }).directive('stImageCrop', function ($compile) {
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
                                        this.urlImage = this.ctrl.stbImage.getTmpImageUrl(this.ctrl.cropTargetImage.imageId, this.ctrl.cropTargetImage.yearMonth);
                                        this.widthCrop = parseInt(this.$wrapper.attr('st-crop-width'), 10);
                                        this.heightCrop = parseInt(this.$wrapper.attr('st-crop-height'), 10);
                                        this.cropImage = this.ctrl.cropImage;
                                        this.files = this.ctrl.temporaryFilesForCrop;
                                        this.$cropArea.add(this.$resizer).width(this.widthCrop).height(this.heightCrop);
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
                                        var _this = this;
                                        var intervalForJudgeComplete, imageTarget = this.$imageInner[0];
                                        intervalForJudgeComplete = setInterval(function () {
                                            if (imageTarget.complete) {
                                                setTimeout(function () {
                                                    clearInterval(intervalForJudgeComplete);
                                                    _this.centeringImage();
                                                    _this.showImage();
                                                    _this.startToDragForResizeArea();
                                                    _this.moveToDragForResizeArea();
                                                    _this.endToDragForResizeArea();
                                                    _this.moveToDragForMoveScaleKnob();
                                                }, 500);
                                            }
                                        }, this.INTERVAL.LAZYLOAD);
                                    },
                                    centeringImage: function () {
                                        var offsetTopInner, offsetLeftInner, widthBase = this.$base.outerWidth(), heightBase = this.$base.outerHeight(), widthImage = this.$imageInner.width(), heightImage = this.$imageInner.height(), offsetTopOuter = -((heightImage - heightBase) / 2), offsetLeftOuter = -((widthImage - widthBase) / 2), positionTopArea = this.$cropArea.offset().top - this.$base.offset().top, positionLeftArea = this.$cropArea.offset().left - this.$base.offset().left;
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
                                        var widthTarget, heightTarget, mouseX = e ? e.pageX : 0, mouseY = e ? e.pageY : 0, misalignmentX = mouseX - this.startResize.x, misalignmentY = mouseY - this.startResize.y;
                                        if (this.startResize.$target.hasClass('jsc-crop-resizer-righttop')) {
                                            widthTarget = this.startResize.width + (misalignmentX * 2);
                                            heightTarget = this.startResize.height - (misalignmentY * 2);
                                        }
                                        else if (this.startResize.$target.hasClass('jsc-crop-resizer-rightbottom')) {
                                            widthTarget = this.startResize.width + (misalignmentX * 2);
                                            heightTarget = this.startResize.height + (misalignmentY * 2);
                                        }
                                        else if (this.startResize.$target.hasClass('jsc-crop-resizer-leftbottom')) {
                                            widthTarget = this.startResize.width - (misalignmentX * 2);
                                            heightTarget = this.startResize.height + (misalignmentY * 2);
                                        }
                                        else if (this.startResize.$target.hasClass('jsc-crop-resizer-lefttop')) {
                                            widthTarget = this.startResize.width - (misalignmentX * 2);
                                            heightTarget = this.startResize.height - (misalignmentY * 2);
                                        }
                                        if (this.isResizable) {
                                            if (widthTarget > this.$imageOuter.width()) {
                                                if (this.$imageOuter.width() > this.CROPWIDTH.MAX) {
                                                    widthTarget = this.CROPWIDTH.MAX;
                                                }
                                                else {
                                                    widthTarget = this.$imageOuter.width();
                                                }
                                            }
                                            else if (widthTarget > this.CROPWIDTH.MAX) {
                                                if (this.CROPWIDTH.MAX > this.$imageOuter.width()) {
                                                    widthTarget = this.$imageOuter.width();
                                                }
                                                else {
                                                    widthTarget = this.CROPWIDTH.MAX;
                                                }
                                            }
                                            else if (widthTarget < this.CROPWIDTH.MIN) {
                                                widthTarget = this.CROPWIDTH.MIN;
                                            }
                                            else if (widthTarget > this.$imageOuter.width()) {
                                                widthTarget = this.$imageOuter.width();
                                            }
                                            if (heightTarget > this.$imageOuter.height()) {
                                                if (this.$imageOuter.height() > this.CROPHEIGHT.MAX) {
                                                    heightTarget = this.CROPHEIGHT.MAX;
                                                }
                                                else {
                                                    heightTarget = this.$imageOuter.height();
                                                }
                                            }
                                            else if (heightTarget > this.CROPHEIGHT.MAX) {
                                                if (this.CROPHEIGHT.MAX > this.$imageOuter.height()) {
                                                    heightTarget = this.$imageOuter.height();
                                                }
                                                else {
                                                    heightTarget = this.CROPHEIGHT.MAX;
                                                }
                                            }
                                            else if (heightTarget < this.CROPHEIGHT.MIN) {
                                                heightTarget = this.CROPHEIGHT.MIN;
                                            }
                                            this.$cropArea.add(this.$resizer).width(widthTarget).height(heightTarget);
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
                                        var ratioMoved, mouseX = e ? e.pageX : 0, offsetLeftScale = this.$scale.offset().left, isSmaller = false, temporaryRatio = e ? (mouseX - offsetLeftScale + this.misalignmentScaleX) / this.$scale.width() : 0, temporaryScale = e ? this.SCALE.MIN + ((this.SCALE.MAX - this.SCALE.MIN) * temporaryRatio) : 0;
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
                                        }
                                        else if (ratioMoved > 100) {
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
                                        var offsetTopOuter, offsetLeftOuter, offsetBottomOuter, offsetRightOuter, mouseX = e.pageX, mouseY = e.pageY, movedX = mouseX - this.mouseStart.x, movedY = mouseY - this.mouseStart.y, offsetTopArea = this.$cropArea.offset().top, offsetLeftArea = this.$cropArea.offset().left, offsetBottomArea = offsetTopArea + this.$cropArea.height(), offsetRightArea = offsetLeftArea + this.$cropArea.width();
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
                                        }
                                        else if (offsetBottomOuter < offsetBottomArea) {
                                            this.y = this.y + (offsetBottomArea - offsetBottomOuter);
                                        }
                                        if (offsetLeftOuter > offsetLeftArea) {
                                            this.x = this.x + (offsetLeftArea - offsetLeftOuter);
                                        }
                                        else if (offsetRightOuter < offsetRightArea) {
                                            this.x = this.x + (offsetRightArea - offsetRightOuter);
                                        }
                                        this.$imageInner.add(this.$imageOuter).css({
                                            marginTop: this.y,
                                            marginLeft: this.x
                                        });
                                    },
                                    scaleImage: function () {
                                        var widthImage, heightImage;
                                        if (this.scale < this.SCALE.MIN) {
                                            this.scale = this.SCALE.MIN;
                                        }
                                        else if (this.scale > this.SCALE.MAX) {
                                            this.scale = this.SCALE.MAX;
                                        }
                                        widthImage = this.default.width * this.scale;
                                        heightImage = this.default.height * this.scale;
                                        this.$imageInner.add(this.$imageOuter).width(widthImage).height(heightImage).css({
                                            marginTop: 0,
                                            marginLeft: 0
                                        });
                                        this.centeringImage();
                                    },
                                    saveCropImage: function () {
                                        var startX = this.$cropArea.offset().left - this.$imageOuter.offset().left, startY = this.$cropArea.offset().top - this.$imageOuter.offset().top;
                                        this.cropImage(this.ctrl, {
                                            files: this.files,
                                            startX: startX ? Math.floor(startX) : 1,
                                            startY: startY ? Math.floor(startY) : 1,
                                            cropWidth: this.$cropArea.width(),
                                            cropHeight: this.$cropArea.height(),
                                            resizeWidth: this.$imageOuter.width(),
                                            resizeHeight: this.$imageOuter.height()
                                        });
                                    }
                                });
                                scope.init();
                            }
                        };
                    }).directive('ngOuterclick', function () {
                        return {
                            restrict: 'A',
                            link: function (scope, $element, attrs) {
                                var self = {
                                    $body: angular.element('body'),
                                    attr: attrs.ngOuterclick,
                                    init: function () {
                                        self.bindEvents();
                                    },
                                    bindEvents: function () {
                                        self.$body.on('click', function (e) {
                                            self.judgeOuterclick(e);
                                        });
                                    },
                                    judgeOuterclick: function (e) {
                                        var mouseX = e.pageX, mouseY = e.pageY, offsetTop = $element.offset().top, offsetBottom = offsetTop + $element.height(), offsetLeft = $element.offset().left, offsetRight = offsetLeft + $element.width();
                                        if (!(mouseX > offsetLeft && mouseX < offsetRight && mouseY > offsetTop && mouseY < offsetBottom)) {
                                            scope.$eval(self.attr);
                                        }
                                    }
                                };
                                self.init();
                            }
                        };
                    }).directive('stAutoresizeTextarea', function () {
                        return {
                            restrict: 'A',
                            link: function (scope, $element, attrs) {
                                _.merge(scope, {
                                    $textarea: $element,
                                    $textfield: angular.element(),
                                    heightBefore: 0,
                                    heightAfter: 0,
                                    init: function () {
                                        scope.heightBefore = scope.$textarea.outerHeight();
                                        scope.bindEvents();
                                    },
                                    bindEvents: function () {
                                        scope.$watch('$textarea.val', function () {
                                            scope.generateTextField();
                                        });
                                        scope.$textarea.on('keyup', function () {
                                            scope.judgeHeight2Reflection();
                                        });
                                    },
                                    generateTextField: function () {
                                        scope.$textfield = angular.element('<pre/>');
                                        scope.heightBefore = scope.$textarea.outerHeight();
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
                                    judgeHeight2Reflection: function () {
                                        scope.$textfield.text(scope.$textarea.val().replace(/\n$/, '\n '));
                                        scope.heightAfter = scope.$textfield.outerHeight();
                                        if (scope.heightAfter >= scope.heightBefore) {
                                            scope.$textarea.css('height', scope.heightAfter);
                                        }
                                        else {
                                            scope.$textarea.css('height', scope.heightBefore);
                                        }
                                    }
                                });
                                scope.init();
                            }
                        };
                    }).directive('stAutoscroll', function () {
                        return {
                            restrict: 'A',
                            link: function (scope, $element, attrs) {
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
                                        var $contentTarget = $($triggerTarget.attr('href')), scrollTopTarget = $contentTarget.offset().top, scrollTopMaximum = $(document).height() - $(window).height();
                                        if (scrollTopTarget > scrollTopMaximum) {
                                            scrollTopTarget = scrollTopMaximum;
                                        }
                                        else {
                                            scrollTopTarget -= 70;
                                        }
                                        this.$htmlbody.stop().animate({
                                            scrollTop: scrollTopTarget
                                        }, this.ANIMATION.DURATION);
                                    }
                                });
                                scope.init();
                            }
                        };
                    }).directive('stFixedheader', function () {
                        return {
                            restrict: 'A',
                            link: function (scope, $element, attrs) {
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
                                        var scrollTopTarget = this.$win.scrollTop();
                                        if (scrollTopTarget > this.offsetTopTarget) {
                                            this.$element.css('position', 'fixed');
                                        }
                                        else {
                                            this.$element.css('position', 'absolute');
                                        }
                                    }
                                });
                                scope.init();
                            }
                        };
                    }).directive('stDdSelect', function ($compile, $document) {
                        var DD_SELECT_REGEX = /^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+([\s\S]+?)(?:\s+orderBy\s+([\s\S]+?))?$/;
                        var PROPERTY_REF_REGEX = /^\s*([^\.]+)\.([^\.]+)\s*$/;
                        var CALLBACK_REGEX = /^\s*([^\()]+)?\(([^\)]+)\)\s*$/;
                        var ORIGINAL_KEYNAME_HOLDER = "_____ST_DD_SELECT_KEY";
                        var DD_POPUP_OVERLAY = '<div class="dd-popup-overlay" ng-click="cancel()"></div>';
                        var DD_POPUP_TEMPLATE = '<div class="dd-popup-temp">' + '<ul>' + '<li class="control-area" >' + '<span ng-click="ok()" class="dd-popup-temp-btn">確定</span> - ' + '<span ng-show="enableNothing"><span ng-click="reset()" class="dd-popup-temp-btn">解除</span> - </span>' + '<span ng-click="cancel()" class="dd-popup-temp-btn">閉じる</span>' + '</li>' + '<li ng-repeat="elem in sortedArray" ng-click="clickOnItem(elem[valueProp])">' + '<span class="checkmark" ng-class="{\'checked\': isSelected(elem[valueProp])}" ></span> <span class="item">{% elem[labelProp] %}</span>' + ' </li>' + '</ul>' + '</div>';
                        var errorFn = function () {
                            throw new Error('Illegal use of stDdSelect: check expression provided for stDdSelect attribute');
                        };
                        var extractProp = function (expr, isArray, keyExpr) {
                            var match = expr.match(PROPERTY_REF_REGEX);
                            if (isArray) {
                                if (!match)
                                    errorFn();
                            }
                            else {
                                if (expr == keyExpr)
                                    return ORIGINAL_KEYNAME_HOLDER;
                                else if (!match)
                                    errorFn();
                            }
                            return match[2];
                        };
                        var extractCallbackArgs = function (callbackExpr) {
                            var callbackArgs = [];
                            var callbackFnExpr = null;
                            if (callbackExpr) {
                                var match = callbackExpr.match(CALLBACK_REGEX);
                                if (!match)
                                    errorFn();
                                callbackFnExpr = match[1];
                                callbackArgs = _.map(match[2].split(','), function (arg) {
                                    return arg.trim();
                                });
                            }
                            return { callbackArgs: callbackArgs, callbackFnExpr: callbackFnExpr };
                        };
                        return {
                            restrict: 'A',
                            require: 'ngModel',
                            compile: function ($element, $attr) {
                                var selectExpr = $attr.stDdSelect;
                                var ngModelExpr = $attr.ngModel;
                                var callbackExpr = $attr.stDdSelectManual;
                                var enableNothing = ($attr.stDdSelectNothing != null);
                                var excludeExpr = $attr.stDdSelectExclude;
                                var match = selectExpr.match(DD_SELECT_REGEX);
                                if (!match)
                                    errorFn();
                                var valueExpr = match[1];
                                var labelExpr = match[2];
                                var elemExpr = match[3];
                                var objKeyExpr = match[4];
                                var objValExpr = match[5];
                                var enumExpr = match[6];
                                var sortExpr = match[7];
                                var isArray = (elemExpr) && (!objKeyExpr && !objValExpr);
                                var valueProp = extractProp(valueExpr, isArray, objKeyExpr);
                                var labelProp = extractProp(labelExpr, isArray, objKeyExpr);
                                var sortProp = sortExpr ? extractProp(sortExpr, isArray, objKeyExpr) : null;
                                var cbConfig = extractCallbackArgs(callbackExpr);
                                return function ($scope, $iElem, $iAttr, ngModelCtrl) {
                                    var arrayBeforeSort = setupArrayBeforeSort($scope);
                                    var excludedArray = excludeSomeElements(excludeExpr, arrayBeforeSort);
                                    var sortedArray = _.sortBy(excludedArray, function (elem) {
                                        return elem[sortProp];
                                    });
                                    var popupScope = $scope.$new();
                                    var popupOverlay = angular.element(DD_POPUP_OVERLAY);
                                    popupOverlay.appendTo('body');
                                    $compile(popupOverlay)(popupScope);
                                    var popupDom = angular.element(DD_POPUP_TEMPLATE);
                                    popupDom.appendTo('body');
                                    $compile(popupDom)(popupScope);
                                    var isPopupVisible = false;
                                    $element.on('click', function () {
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
                                    $document.bind('keydown', function (evt) {
                                        if (evt.which === 27) {
                                            evt.preventDefault();
                                            hidePopup();
                                        }
                                    });
                                    function renewPopupScope() {
                                        var initVal = $scope.$eval(ngModelExpr);
                                        popupScope.sortedArray = sortedArray;
                                        popupScope.initValue = initVal;
                                        popupScope.activeValue = initVal;
                                        popupScope.valueProp = valueProp;
                                        popupScope.labelProp = labelProp;
                                        popupScope.enableNothing = enableNothing;
                                        popupScope.clickOnItem = function (value) {
                                            popupScope.activeValue = value;
                                        };
                                        popupScope.isSelected = function (value) {
                                            return value == popupScope.activeValue;
                                        };
                                        popupScope.ok = function () {
                                            if (callbackExpr) {
                                                $scope.$eval(buildCallbackExpression());
                                            }
                                            else {
                                                ngModelCtrl.$setViewValue(popupScope.activeValue);
                                                ngModelCtrl.$render();
                                            }
                                            hidePopup();
                                        };
                                        popupScope.reset = function () {
                                            popupScope.activeValue = null;
                                            popupScope.ok();
                                        };
                                        popupScope.cancel = function () {
                                            hidePopup();
                                        };
                                    }
                                    function hidePopup() {
                                        isPopupVisible = false;
                                        popupDom.hide();
                                        popupOverlay.hide();
                                    }
                                    function buildCallbackExpression() {
                                        if (callbackExpr) {
                                            var convertedArgs = _.map(cbConfig.callbackArgs, function (arg) {
                                                if (arg == '$newValue') {
                                                    var final = popupScope.activeValue;
                                                    return final ? '"' + final + '"' : 'null';
                                                }
                                                else if (arg == '$oldValue') {
                                                    var init = popupScope.initValue;
                                                    return init ? '"' + init + '"' : 'null';
                                                }
                                                else if (arg == '$isDiffValue') {
                                                    return popupScope.initValue != popupScope.activeValue;
                                                }
                                                else {
                                                    return arg;
                                                }
                                            });
                                            return cbConfig.callbackFnExpr + '(' + convertedArgs.join(',') + ')';
                                        }
                                    }
                                    function setupArrayBeforeSort($scope) {
                                        var arrayBeforeSort = null;
                                        if (/^\$enums/.test(enumExpr)) {
                                            var enums = angular.injector(['stanbyServices']).get('enums');
                                            var evalStr = enumExpr.replace(/^\$enums/, 'enums');
                                            arrayBeforeSort = eval(evalStr);
                                            if (_.isEmpty(arrayBeforeSort)) {
                                                throw new Error('Specified array for stDdSelect directive is null or empty!');
                                            }
                                        }
                                        else {
                                            arrayBeforeSort = $scope.$eval(enumExpr);
                                        }
                                        if ((isArray && !_.isArray(arrayBeforeSort)) || (!isArray && !_.isObject(arrayBeforeSort))) {
                                            throw new Error('The specified enumeration type (object / array) is inconsistent');
                                        }
                                        if (!isArray) {
                                            var tmpObj = arrayBeforeSort;
                                            arrayBeforeSort = [];
                                            _.forEach(tmpObj, function (value, key) {
                                                value[ORIGINAL_KEYNAME_HOLDER] = key;
                                                arrayBeforeSort.push(value);
                                            });
                                        }
                                        return arrayBeforeSort;
                                    }
                                    function excludeSomeElements(excludeExpr, array) {
                                        if (excludeExpr) {
                                            _.remove(array, function (elem) {
                                                return elem[valueProp] == excludeExpr;
                                            });
                                        }
                                        return array;
                                    }
                                };
                            }
                        };
                    }).directive('stTotop', function () {
                        return {
                            restrict: 'E',
                            template: '<a href="javascript: void(0);" class="cm-totop" id="jsi-totop"></a>',
                            link: function (scope, $element) {
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
                                        var _this = this;
                                        this.$win.on('scroll', function () {
                                            _this.showhideTrigger();
                                        });
                                        this.$trigger.on('click', function () {
                                            _this.scrollToTop();
                                        });
                                    },
                                    scrollToTop: function () {
                                        this.$htmlbody.stop().animate({
                                            scrollTop: 0
                                        }, 750);
                                    },
                                    showhideTrigger: function () {
                                        var heightHalfWindow = this.$win.height() / 2, scrollTopCurrent = this.$win.scrollTop();
                                        if (scrollTopCurrent > heightHalfWindow) {
                                            this.show();
                                        }
                                        else {
                                            this.hide();
                                        }
                                    },
                                    show: function () {
                                        this.$trigger.show().stop().animate({
                                            opacity: 1
                                        }, 150);
                                    },
                                    hide: function () {
                                        var _this = this;
                                        this.$trigger.stop().animate({
                                            opacity: 0
                                        }, 150, function () {
                                            _this.$trigger.hide();
                                        });
                                    }
                                });
                                scope.init();
                            }
                        };
                    }).directive('stDraggableSet', function ($document, $timeout) {
                        return {
                            scope: {
                                items: '=stDraggableSet'
                            },
                            controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {
                                var _this = this;
                                this.$draggableSet = $element;
                                this.$target = null;
                                this.$clone = null;
                                this.$supplementHeight = null;
                                this.mousedown_e = null;
                                this.KEEP = 10;
                                this.replaceElems = function (Opts) {
                                    Opts = Opts || {};
                                    Opts.direction = Opts.direction || 'vertical';
                                    Opts.animation = Opts.animation || false;
                                    if (Opts.originalElem.is(Opts.replacedElem))
                                        return true;
                                    if (Opts.conditional() == null) {
                                    }
                                    else if (Opts.conditional()) {
                                        if (Opts.replacedElem.css('transform') === 'none') {
                                            if (Opts.animation) {
                                                Opts.replacedElem.css({
                                                    transition: 'transform 250ms ease',
                                                    '-webkit-transition': 'transform 250ms ease',
                                                    transform: 'translate( 0, ' + Opts.originalElem.outerHeight() + 'px )'
                                                });
                                                $timeout(function () {
                                                    Opts.replacedElem.css({ transition: '', '-webkit-transition': '' });
                                                }, 250);
                                            }
                                            else {
                                                Opts.replacedElem.css({
                                                    transform: 'translate( 0, ' + Opts.originalElem.outerHeight() + 'px )'
                                                });
                                            }
                                        }
                                    }
                                    else {
                                        if (Opts.animation) {
                                            Opts.replacedElem.css({
                                                transition: 'transform 250ms ease',
                                                '-webkit-transition': 'transform 250ms ease',
                                                transform: ''
                                            });
                                            $timeout(function () {
                                                Opts.replacedElem.css({ transition: '', '-webkit-transition': '' });
                                            }, 250);
                                        }
                                        else {
                                            Opts.replacedElem.css({
                                                transform: ''
                                            });
                                        }
                                    }
                                };
                                this.destroyElements = function () {
                                    _this.$supplementHeight ? _this.$supplementHeight.remove() : null;
                                    _this.$target ? _this.$target.show() : null;
                                    _this.$clone ? _this.$clone.remove() : null;
                                    _this.$draggableSet.css({ position: '', cursor: '', marginBottom: '' });
                                    _this.$draggableSet.find('[st-dodgeable]').css({ transform: '', transition: '', '-webkit-transition': '' });
                                    $document.find('body').css({ userSelect: '' });
                                    _this.$draggableSet.find('input, textarea').prop({ disabled: false });
                                    _this.$supplementHeight = _this.$target = _this.$clone = _this.mousedown_e = null;
                                };
                            }],
                            link: function (scope, el, attrs, ctrl) {
                                $(window).on('mousemove', function (e) {
                                    var xDiff, yDiff;
                                    if (e.which && ctrl.mousedown_e) {
                                        xDiff = e.pageX - ctrl.mousedown_e.pageX;
                                        yDiff = e.pageY - ctrl.mousedown_e.pageY;
                                        xDiff = Math.abs(xDiff);
                                        yDiff = Math.abs(yDiff);
                                        if ((xDiff > ctrl.KEEP || yDiff > ctrl.KEEP) && !ctrl.$clone) {
                                            ctrl.$clone = ctrl.$target.clone().appendTo(ctrl.$draggableSet).addClass('st-draggable-clone').css({ position: 'absolute', width: '100%', boxShadow: '5px 10px 25px rgba(0,0,0,.2)', pointerEvents: 'none', transform: 'scale(1.02)' });
                                            var top = e.pageY - ctrl.$draggableSet.offset().top;
                                            ctrl.$clone.css({
                                                top: top - ctrl.mousedown_e.offsetY
                                            });
                                            ctrl.$draggableSet.css('position') == 'static' ? ctrl.$draggableSet.css({ position: 'relative' }) : null;
                                            ctrl.$draggableSet.css({ cursor: 'row-resize' });
                                            ctrl.$supplementHeight = $('<div>').insertAfter(ctrl.$draggableSet).css({ height: ctrl.$target.outerHeight() });
                                            ctrl.$draggableSet.find('[st-dodgeable]').each(function (i) {
                                                var that = this;
                                                return ctrl.replaceElems({
                                                    originalElem: ctrl.$clone,
                                                    replacedElem: $(this),
                                                    direction: 'vertical',
                                                    conditional: function () {
                                                        var t = $(that).offset().top;
                                                        var h = $(that).outerHeight();
                                                        return ctrl.$clone.offset().top < t + h / 2;
                                                    }
                                                });
                                            });
                                            ctrl.$target.hide();
                                        }
                                        else if (ctrl.$clone && ctrl.$clone.css('display') != 'none') {
                                            top = e.pageY - ctrl.$draggableSet.offset().top;
                                            ctrl.$clone.css({
                                                top: top - ctrl.mousedown_e.offsetY
                                            });
                                            ctrl.$draggableSet.find('[st-dodgeable]').each(function (i) {
                                                var that = this;
                                                return ctrl.replaceElems({
                                                    originalElem: ctrl.$clone,
                                                    replacedElem: $(this),
                                                    direction: 'vertical',
                                                    animation: true,
                                                    conditional: function () {
                                                        var t = $(that).offset().top;
                                                        var h = $(that).outerHeight();
                                                        var isCloneTopHigher = ctrl.$clone.offset().top < t + h / 2;
                                                        var isCloneBottomLower = ctrl.$clone.offset().top + ctrl.$clone.outerHeight() > t + h / 2;
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
                                $(window).on('mouseup', function (e) {
                                    if (ctrl.$target && ctrl.$clone) {
                                        var $items = ctrl.$clone.siblings();
                                        var $droppableItems = $items.filter(function () {
                                            var isClone = $(this).is('.st-draggable-clone');
                                            return !isClone;
                                        });
                                        var $dodgeItems = $droppableItems.filter(function () {
                                            var isTransform = $(this).css('transform') != 'none';
                                            return isTransform;
                                        });
                                        var $undodgeItems = $droppableItems.filter(function () {
                                            var isTransform = $(this).css('transform') != 'none';
                                            return !isTransform;
                                        });
                                        var targetIndex = ctrl.$target.index('[st-draggable]');
                                        var insertIndex = $dodgeItems.eq(0).index('[st-dodgeable]:visible');
                                        var translateY;
                                        if ($undodgeItems.filter(':visible:eq(-1)').length) {
                                            translateY = $undodgeItems.filter(':visible:eq(-1)').offset().top;
                                            translateY += $undodgeItems.filter(':visible:eq(-1)').outerHeight();
                                        }
                                        else {
                                            translateY = ctrl.$draggableSet.offset().top;
                                        }
                                        translateY -= ctrl.$clone.offset().top;
                                        ctrl.$clone.css({
                                            transition: 'transform 250ms ease',
                                            '-webkit-transition': 'transform 250ms ease',
                                            transform: 'translate( 0, ' + translateY + 'px )'
                                        });
                                        $timeout(function () {
                                            scope.items.moveAndShift(targetIndex, insertIndex);
                                            scope.$apply();
                                            ctrl.destroyElements();
                                        }, 250);
                                    }
                                    else {
                                        ctrl.destroyElements();
                                    }
                                });
                            }
                        };
                    }).directive('stDraggable', function ($document) {
                        return {
                            require: '^stDraggableSet',
                            link: function (scope, el, attrs, ctrl) {
                                var $jQo = el.is('tr') ? el.find('>*:eq(0)') : el;
                                var $handle = $('<div st-draggablehandle class="sg-box-header-arrow-top sg-box-header-arrow-bottom">').appendTo($jQo);
                                scope.$watch(function () { return el[0].offsetHeight; }, function (newVal) { return $handle.css({ height: newVal - 1 }); });
                                el.on('mousedown', function (e) {
                                    if ($(e.target).is('[st-draggablehandle] , [st-draggablehandle] *')) {
                                        e.offsetY = e.pageY - $(this).offset().top;
                                        ctrl.$target = $(this);
                                        ctrl.mousedown_e = e;
                                        $document.find('body').css({ userSelect: 'none' });
                                        ctrl.$draggableSet.find('input, textarea').prop({ disabled: true });
                                    }
                                });
                            }
                        };
                    }).directive('stSetIframeHeight', function () {
                        return {
                            restrict: 'A',
                            link: function (scope, element, attrs) {
                                element.on('load', function () {
                                    var iHeight = element[0].contentWindow.document.body.scrollHeight + 'px';
                                    element.css('height', iHeight);
                                });
                            }
                        };
                    }).directive('stEditchecker', ['$timeout', '$window', function ($timeout, $window) {
                        return {
                            restrict: 'A',
                            link: function (scope, $element, $attrs) {
                                var isLeaving = false;
                                var isDirty = function () {
                                    var formObj = scope[$element.attr('name')];
                                    return formObj && formObj.$pristine === false;
                                };
                                var areYouSurePrompt = function () {
                                    if (isDirty()) {
                                        return '編集中の情報を破棄して移動しますか？';
                                    }
                                };
                                var bindEvents = function () {
                                    $(window).bind('beforeunload', areYouSurePrompt);
                                    $element.bind('$destroy', function (event) {
                                        $(window).unbind('beforeunload', areYouSurePrompt);
                                    });
                                    scope.$on('$locationChangeStart', function (event, next, current) {
                                        var prompt = areYouSurePrompt();
                                        if (!prompt) {
                                            return;
                                        }
                                        if ($element.find(':focus').length > 0) {
                                            $element.find(':focus').blur();
                                        }
                                        if (!isLeaving) {
                                            event.preventDefault();
                                            $timeout(function () {
                                                if (confirm(prompt)) {
                                                    isLeaving = true;
                                                    $window.location.href = next;
                                                }
                                            });
                                        }
                                    });
                                };
                                var init = function () {
                                    bindEvents();
                                };
                                init();
                            }
                        };
                    }]).directive('stShowForm', function ($rootScope, $document) {
                        return {
                            link: function (scope, $element) {
                                var viewPre = $rootScope.$on('viewingPreview', function () {
                                    $document.find('footer.cm-last-footer').css({ display: 'none' });
                                    $element.css({ display: 'none' });
                                });
                                var notViewPre = $rootScope.$on('notViewingPreview', function () {
                                    $document.find('footer.cm-last-footer').css({ display: '' });
                                    $element.css({ display: '' });
                                });
                                scope.$on('$destroy', function () {
                                    viewPre;
                                    notViewPre;
                                });
                            }
                        };
                    }).directive('loading', ['$http', '$document', function ($http, $document) {
                        return {
                            restrict: 'A',
                            link: function (scope, elm, attrs) {
                                scope.isLoading = function () {
                                    return $http.pendingRequests.length > 0;
                                };
                                scope.$watch(scope.isLoading, function (v) {
                                    if (v) {
                                        $document.find('.js-loading').css({ display: 'noen' });
                                        elm.show();
                                    }
                                    else {
                                        elm.hide();
                                    }
                                });
                            }
                        };
                    }]);
                }
                directives.initCommonDirectives = initCommonDirectives;
            })(directives = common.directives || (common.directives = {}));
        })(common = _directives.common || (_directives.common = {}));
    })(directives = stanby.directives || (stanby.directives = {}));
})(stanby || (stanby = {}));

var config;
(function (config) {
    var core;
    (function (core) {
        var httpInterceptors;
        (function (httpInterceptors) {
            function configure() {
                angular.module('stanby').config(function ($httpProvider) {
                    $httpProvider.interceptors.push('HttpResponseCheckInterceptor');
                }).factory('HttpResponseCheckInterceptor', ['$q', '$injector', '$timeout', 'stUtils', function ($q, $injector, $timeout, stUtils) {
                    var GET_METHOD = 'GET';
                    var spinnerHandler = (function () {
                        var nonGetRequestCount = 0;
                        var spinnerDom = $('#jsi-get-spinner');
                        return {
                            startSpinnerIfNonGetRequest: function (req) {
                                if (req.method = GET_METHOD) {
                                    nonGetRequestCount += 1;
                                    spinnerDom.stop().fadeIn(300);
                                }
                            },
                            stopSpinnerIfNoPendingRequests: function (res) {
                                if (res.config.method = GET_METHOD) {
                                    nonGetRequestCount -= 1;
                                }
                                if (nonGetRequestCount <= 0) {
                                    spinnerDom.stop().fadeOut(300);
                                }
                            }
                        };
                    })();
                    var toastCorrespondingErrorMessages = function (res) {
                        if (res.status == 0) {
                            var danger = function () {
                                stUtils.toastDanger("接続エラーです。");
                            };
                            $timeout(danger, 100);
                        }
                        if (res.status === 400 && res.data.key === "error.data.version") {
                            stUtils.toastDanger("更新対象のデータが既に更新されています。再度読みなおしてください。");
                        }
                        else if (res.status === 401 && !res.config.suppress401ErrorMsg) {
                            stUtils.toastDanger('ログアウトされました。<a href="/login">ログインし直す</a>');
                        }
                        else if (res.status === 403) {
                            stUtils.toastDanger("権限がありません。");
                        }
                        else if (res.status === 500) {
                            stUtils.toastDanger("申し訳ございません。サーバーでエラーが発生しました。");
                        }
                    };
                    var pushSuccessfulAjaxCallForGTM = function (res) {
                        var requestConfig = res.config;
                        if (requestConfig.method != GET_METHOD && res.status == 200) {
                            var ajaxEvent = {
                                'event': 'stSuccessfulAjaxCall',
                                'stSuccessfulAjaxCallMethod': requestConfig.method,
                                'stSuccessfulAjaxCallUrl': requestConfig.url
                            };
                            if (typeof dataLayer == 'undefined' || !dataLayer)
                                dataLayer = [];
                            dataLayer.push(ajaxEvent);
                        }
                    };
                    return {
                        request: function (req) {
                            spinnerHandler.startSpinnerIfNonGetRequest(req);
                            return req;
                        },
                        response: function (res) {
                            spinnerHandler.stopSpinnerIfNoPendingRequests(res);
                            pushSuccessfulAjaxCallForGTM(res);
                            return res;
                        },
                        responseError: function (res) {
                            spinnerHandler.stopSpinnerIfNoPendingRequests(res);
                            toastCorrespondingErrorMessages(res);
                            return $q.reject(res);
                        }
                    };
                }]);
            }
            httpInterceptors.configure = configure;
        })(httpInterceptors = core.httpInterceptors || (core.httpInterceptors = {}));
    })(core = config.core || (config.core = {}));
})(config || (config = {}));

var stanby;
(function (stanby) {
    var directives;
    (function (directives) {
        var users;
        (function (users) {
            var inputs;
            (function (inputs) {
                function initFormInputs() {
                    angular.module('stanbyDirectives').directive('stFormsRolesCheckBox', [function () {
                        return {
                            restrict: 'E',
                            scope: {
                                userRoles: "=userRoles",
                                roleName: "=roleName",
                                allRoles: "=allRoles",
                                updateFunction: "&"
                            },
                            template: '<input type="checkbox" value="{{::roleName}}"><label ng-click="addRole()">{{::realname}}</label>',
                            link: function (scope, element, attrs) {
                                scope.addRole = function () {
                                    var $checkboxEl = element.find('input');
                                    var checked = $checkboxEl.prop('checked') ? false : true;
                                    $checkboxEl.prop('checked', checked);
                                    scope.checkbox.checked = checked;
                                    scope.updateFunction({ role: scope.roleName, selected: scope.checkbox.checked });
                                };
                                var inRole = scope.userRoles.indexOf(scope.roleName) > -1;
                                scope.checkbox = element.children();
                                scope.label = scope.checkbox.next()[0];
                                scope.checkbox.checked = inRole;
                                scope.checkbox.prop('checked', inRole);
                                scope.realname = scope.allRoles[scope.roleName].name;
                            }
                        };
                    }]);
                }
                inputs.initFormInputs = initFormInputs;
            })(inputs = users.inputs || (users.inputs = {}));
        })(users = directives.users || (directives.users = {}));
    })(directives = stanby.directives || (stanby.directives = {}));
})(stanby || (stanby = {}));

var stanby;
(function (stanby) {
    var directives;
    (function (directives) {
        var forms;
        (function (forms) {
            var validations;
            (function (validations) {
                function initFormValidations() {
                    angular.module('stanbyDirectives').directive('stDelayedUpdate', [function () {
                        return {
                            restrict: 'A',
                            require: 'ngModel',
                            link: function (scope, element, attrs, ctrl) {
                                var delay = 550;
                                if (attrs.stDelayedUpdate != "") {
                                    delay = parseInt(attrs.stDelayedUpdate);
                                }
                                if (!ctrl.$options) {
                                    ctrl.$options = {
                                        updateOn: 'blur',
                                        updateOnDefault: true,
                                        debounce: {
                                            'blur': 0,
                                            'default': delay
                                        }
                                    };
                                }
                                element.bind('keydown', function (e) {
                                    if (e.keyCode === 13) {
                                        ctrl.$commitViewValue();
                                    }
                                });
                            }
                        };
                    }]);
                }
                validations.initFormValidations = initFormValidations;
            })(validations = forms.validations || (forms.validations = {}));
        })(forms = directives.forms || (directives.forms = {}));
    })(directives = stanby.directives || (stanby.directives = {}));
})(stanby || (stanby = {}));

var stanby;
(function (stanby) {
    var app;
    (function (app) {
        function initStanbyApp() {
            var _this = this;
            angular.module('underscore', []).service('_', function () {
                return _;
            });
            angular.module('stanbyServices', [
            ]);
            angular.module('stanbyControllers', [
                'ngSanitize',
                'ui.bootstrap',
                'ui.router',
                'underscore',
                'stanbyServices',
                'ngToast',
                'stanbyDirectives'
            ]).run(['$rootScope', 'stbUser', '$location', '$state', 'stbConfig', 'stUtils', function ($rootScope, stbUser, $location, $state, stbConfig, stUtils) {
                stbConfig.getConfig(null);
                stbUser.updateAccountInfo(null);
                $rootScope.$on("$stateChangeStart", function (evt, toState, toParams, fromState, fromParams) {
                    if (!toState.anonAllowed) {
                        evt.preventDefault();
                        stbUser.checkLogin(function () {
                            $state.go(toState, toParams, { notify: false }).then(function () {
                                stbUser.getAccountInfo(function (response) {
                                    $rootScope.$broadcast('stAuthenticationSuccess', response.account.roles);
                                    if (toState.roles) {
                                        var found = _.find(toState.roles, function (role) {
                                            return _.contains(response.account.roles, role);
                                        });
                                        if (found) {
                                            $rootScope.$broadcast('$stateChangeSuccess', toState, toParams, fromState, fromParams);
                                        }
                                        else {
                                            stUtils.toastDanger("権限がありません");
                                        }
                                    }
                                    else {
                                        $rootScope.$broadcast('$stateChangeSuccess', toState, toParams, fromState, fromParams);
                                    }
                                });
                            });
                        }, function () {
                            var encoded = encodeURIComponent($location.absUrl());
                            window.location.href = '/login#?dest=' + encoded;
                        });
                    }
                });
                $rootScope.$on("$stateChangeSuccess", function () {
                    $('html,body').scrollTop(0);
                });
            }]).controller('menuToggleCtrl', ['$scope', '$rootScope', '$location', 'enums', function ($scope, $rootScope, $location, enums) {
                $scope.hideNav = false;
                $scope.permitHide = false;
                $rootScope.$on('stGlobalNavHide', function () {
                    $scope.hideNav = true;
                });
                $rootScope.$on('stGlobalNavShow', function () {
                    $scope.hideNav = false;
                });
                $rootScope.$on('stAuthenticationSuccess', function (event, userRoles) {
                    $scope.isAdmin = _.contains(userRoles, enums.userRole.ADM.code);
                    $scope.isRecruiter = _.contains(userRoles, enums.userRole.REC.code);
                    $scope.isInterviewer = _.contains(userRoles, enums.userRole.INT.code);
                });
            }]).controller('HeadMenuCtrl', ['$scope', 'routes', '$rootScope', 'stModal', 'enums', 'stbUser', function ($scope, routes, $rootScope, stModal, enums, stbUser) {
                stbUser.getAccountInfoPromise().then(function (res) {
                    if (res)
                        $scope.accountName = res.fullName;
                });
                $scope.logout = function () {
                    routes.account.logout().success(function () {
                        location.href = '/login#';
                    });
                };
                $rootScope.$on('stAuthenticationSuccess', function (event, userRoles) {
                    $scope.isAdmin = _.contains(userRoles, enums.userRole.ADM.code);
                    $scope.isRecruiter = _.contains(userRoles, enums.userRole.REC.code);
                    $scope.isInterviewer = _.contains(userRoles, enums.userRole.INT.code);
                });
            }]).controller('BreadCrumbsCtrl', ['$scope', '$rootScope', function ($scope, $rootScope) {
                $rootScope.$on('breadcrumbs', function (e, breadcrumbs) {
                    $scope.breadcrumbs = breadcrumbs;
                });
            }]);
            angular.module('stanby', [
                'ngSanitize',
                'ui.bootstrap',
                'ui.router',
                'underscore',
                'ngAnimate',
                'ui.validate',
                'ui.event',
                'stanbyServices',
                'stanbyControllers',
                'ngToast',
                'stanbyDirectives'
            ]);
            config.core.httpInterceptors.configure();
            angular.module('stanby').config(function ($interpolateProvider) {
                $interpolateProvider.startSymbol('{%').endSymbol('%}');
            }).config(function ($tooltipProvider) {
                $tooltipProvider.options({ popupDelay: 300 });
            }).config(function (paginationConfig) {
                paginationConfig.boundaryLinks = false;
                paginationConfig.directionLinks = true;
                paginationConfig.maxSize = 7;
                paginationConfig.previousText = '前のページ';
                paginationConfig.nextText = '次のページ';
            }).config(function (datepickerConfig) {
                datepickerConfig.showWeeks = false;
                datepickerConfig.startingDay = 1;
            }).config(function (datepickerPopupConfig) {
                datepickerPopupConfig.currentText = '本日のみ';
                datepickerPopupConfig.clearText = '解除';
                datepickerPopupConfig.closeText = '閉じる';
            }).config(function (ngToastProvider) {
                ngToastProvider.configure({
                    horizontalPosition: 'center',
                    combineDuplications: true
                });
            }).filter('noHTML', function () {
                return function (text) {
                    if (text != null) {
                        return text.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&/, '&amp;');
                    }
                };
            }).filter('newlines', function ($sce) {
                return function (text) {
                    return $sce.trustAsHtml(text != null ? text.replace(/\n/g, '<br />') : '');
                };
            }).filter('ellipsis', function () {
                return function (text, length) {
                    if (text && _.isNumber(text) && text.length >= length) {
                        return text.substr(0, length) + ' …';
                    }
                    else {
                        return text;
                    }
                };
            }).filter('calculateAge', function () {
                return function (birthday) {
                    if (birthday != undefined) {
                        var date = new Date(birthday.year, birthday.month - 1, birthday.day);
                        var diff = Date.now() - date.getTime();
                        var ageDate = new Date(diff);
                        return Math.abs(ageDate.getUTCFullYear() - 1970);
                    }
                    else {
                        return 0;
                    }
                };
            }).filter('formatYearMonthDay', function () {
                return function (ymd) {
                    if (ymd != undefined) {
                        return "" + ymd.year + "年" + ymd.month + "月" + ymd.day + "日";
                    }
                    else {
                        return '-';
                    }
                };
            }).filter('formatEventTimestamp', function () {
                function formatNumberToDoubledigit(numberTarget) {
                    if (numberTarget < 10) {
                        return '0' + numberTarget;
                    }
                    else {
                        return String(numberTarget);
                    }
                }
                function convertToEventTimestamp(dateTarget) {
                    var dateNow = new Date();
                    if (dateNow.toLocaleDateString() == dateTarget.toLocaleDateString()) {
                        return convertForSameDate(dateTarget);
                    }
                    else if (dateNow.getFullYear() == dateTarget.getFullYear()) {
                        return convertForSameYear(dateTarget);
                    }
                    else {
                        return convertForDiffYear(dateTarget);
                    }
                }
                function convertForSameDate(date) {
                    var hourStr = formatNumberToDoubledigit(date.getHours());
                    var minuteStr = formatNumberToDoubledigit(date.getMinutes());
                    return hourStr + ':' + minuteStr;
                }
                function convertForSameYear(date) {
                    var monthStr = date.getMonth() + 1;
                    var dateStr = date.getDate();
                    return monthStr + '月' + dateStr + '日';
                }
                function convertForDiffYear(date) {
                    var yearStr = date.getFullYear().toString().substr(2);
                    var monthStr = date.getMonth() + 1;
                    return yearStr + '年' + monthStr + '月';
                }
                return function (date) {
                    if (angular.isDate(date)) {
                        return convertToEventTimestamp(date);
                    }
                    else if (angular.isString(date)) {
                        var dateTarget = new Date(date);
                        return convertToEventTimestamp(dateTarget);
                    }
                    else {
                        return '-';
                    }
                };
            }).filter('durationTillNow', function () {
                return function (date) {
                    var dateTarget, dateNow = new Date();
                    if (angular.isDate(date)) {
                        dateTarget = date;
                    }
                    else if (angular.isString(date)) {
                        dateTarget = new Date(date);
                    }
                    else {
                        return '-';
                    }
                    var diffMillSec = dateNow.getTime() - dateTarget.getTime();
                    if (diffMillSec < 1000 * 60 * 60) {
                        return '約' + Math.round(diffMillSec / (1000 * 60)) + '分間';
                    }
                    else if (diffMillSec < 1000 * 60 * 60 * 24) {
                        return '約' + Math.round(diffMillSec / (1000 * 60 * 60)) + '時間';
                    }
                    else {
                        return '約' + Math.round(diffMillSec / (1000 * 60 * 60 * 24)) + '日間';
                    }
                };
            }).factory('$exceptionHandler', function ($log, $injector) {
                var ngToast;
                return function (exception, cause) {
                    $log.error.apply($log, arguments);
                    ngToast = ngToast || $injector.get('ngToast');
                    ngToast.create({ 'content': "予期せぬエラーが発生しました。", 'className': 'danger', 'dismissOnClick': false, 'dismissOnTimeout': false, 'dismissButton': true });
                    exception.message += ' (caused by "' + cause + '")';
                    throw exception;
                };
            }).factory('stUtils', ['ngToast', '$timeout', function (ngToast, $timeout) {
                var info = function (msg) {
                    ngToast.create({ 'content': msg, 'className': 'info' });
                };
                return {
                    withUpdateOkMessage: function (f) {
                        f.call(_this);
                        $timeout(function () {
                            info("変更が保存されました");
                        }, 200);
                    },
                    toastInfo: function (msg) {
                        info(msg);
                    },
                    toastWarning: function (msg) {
                        ngToast.create({ 'content': msg, 'className': 'warning', 'dismissOnClick': false, 'dismissButton': true, 'dismissOnTimeout': false });
                    },
                    toastDanger: function (msg) {
                        ngToast.create({ 'content': msg, 'className': 'danger', 'dismissOnClick': false, 'dismissButton': true, 'dismissOnTimeout': false });
                    }
                };
            }]).factory('stModal', ['$modal', function ($modal) {
                return {
                    modalConfirm: function (content) {
                        var title = content.title ? content.title : content.msg;
                        var msg = content.title ? content.msg : null;
                        var okText = content.okButton ? content.okButton : '続行する';
                        var cancelText = content.cancelButton ? content.cancelButton : 'キャンセル';
                        return $modal.open({
                            template: '<div class="sg-popup">' + '<div class="sg-popup_head">' + '<h3>' + title + '</h3>' + '</div>' + (msg ? ('<div class="sg-popup_body">' + msg + '</div>') : '') + '<div class="sg-popup_foot">' + '<button class="sg-button-secondary sg-button" ng-click="ok()">' + okText + '</button>' + '<button class="sg-button transparent" ng-click="cancel()">' + cancelText + '</button>' + '</div>' + '</div>',
                            controller: function ($scope, $modalInstance) {
                                $scope.ok = function () { return $modalInstance.close(); };
                                $scope.cancel = function () { return $modalInstance.dismiss(); };
                            }
                        });
                    },
                    modalAlert: function (content) {
                        var msg = content.msg;
                        var okText = content.okButton ? content.okButton : '続行する';
                        return $modal.open({
                            template: '<div class="sg-popup">' + '<div class="sg-popup_body">' + '<h3>' + msg + '</h3>' + '</div>' + '<div class="sg-popup_foot">' + '<button class="sg-button-secondary sg-button" ng-click="ok()">' + okText + '</button>' + '</div>' + '</div>',
                            controller: function ($scope, $modalInstance) {
                                $scope.ok = function () { return $modalInstance.close(); };
                            }
                        });
                    },
                    modalCustom: function (options) {
                        return $modal.open(options);
                    }
                };
            }]).service('stbUser', function (routes) {
                return new stb.UserService(routes);
            }).service('stbConfig', function (routes) {
                return new stb.ConfigService(routes);
            });
        }
        app.initStanbyApp = initStanbyApp;
        var ProfilePopup = (function () {
            function ProfilePopup() {
                this.$base = $('#jsi-nav-account');
                this.$trigger = this.$base.find('> a');
                this.$nav = this.$base.find('> ul');
                this.bindEvents();
            }
            ProfilePopup.prototype.bindEvents = function () {
                var _this = this;
                this.$trigger.on('mouseover', function () {
                    _this.show();
                });
                this.$base.on('mouseleave', function () {
                    _this.hide();
                });
            };
            ProfilePopup.prototype.show = function () {
                this.$nav.show();
            };
            ProfilePopup.prototype.hide = function () {
                this.$nav.hide();
            };
            return ProfilePopup;
        })();
        $(function () {
            new ProfilePopup();
        });
    })(app = stanby.app || (stanby.app = {}));
})(stanby || (stanby = {}));
stanby.app.initStanbyApp();
stanby.directives.common.directives.initCommonDirectives();
stanby.directives.forms.validations.initFormValidations();
stanby.services.common.enums.initEnums();
stanby.services.common.routes.initRoutes();

//# sourceMappingURL=../scripts/stanby-app.js.map