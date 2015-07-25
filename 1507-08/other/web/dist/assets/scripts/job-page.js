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

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var service;
(function (service) {
    var images;
    (function (images) {
        var ImagePopupService = (function () {
            function ImagePopupService(stModal, stUtils) {
                this.stModal = stModal;
                this.stUtils = stUtils;
            }
            ImagePopupService.prototype.showCoverImagePopup = function (initialImage, cbOnClose) {
                this.checkLegacyBrowser();
                var modalConfig = {
                    templateUrl: '/templates/images/images-popup-cover.html',
                    controller: 'CoverImagePopupCtrl as ipc',
                    resolve: {
                        initialImage: function () {
                            return initialImage;
                        },
                        configPromise: function (stbConfig) {
                            return stbConfig.getConfigPromise();
                        }
                    }
                };
                this.stModal.modalCustom(modalConfig).result.then(cbOnClose);
            };
            ImagePopupService.prototype.showLogoImagePopup = function (initialImage, cbOnClose) {
                this.checkLegacyBrowser();
                var modalConfig = {
                    templateUrl: '/templates/images/images-popup-logo.html',
                    controller: 'LogoImagePopupCtrl as ipl',
                    resolve: {
                        initialImage: function () {
                            return initialImage;
                        },
                        configPromise: function (stbConfig) {
                            return stbConfig.getConfigPromise();
                        }
                    }
                };
                this.stModal.modalCustom(modalConfig).result.then(cbOnClose);
            };
            ImagePopupService.prototype.showInlineImagePopup = function (cbOnClose) {
                this.checkLegacyBrowser();
                var modalConfig = {
                    templateUrl: '/templates/images/images-popup-inline.html',
                    controller: 'InlineImagePopupCtrl as ipi',
                    resolve: {
                        configPromise: function (stbConfig) {
                            return stbConfig.getConfigPromise();
                        }
                    }
                };
                this.stModal.modalCustom(modalConfig).result.then(cbOnClose);
            };
            ImagePopupService.prototype.checkLegacyBrowser = function () {
                if (/msie [78]/i.test(navigator.userAgent)) {
                    this.stUtils.toastDanger('Internet Explorer 9以降のバージョンのブラウザで画像の操作をしてください');
                    return;
                }
            };
            return ImagePopupService;
        })();
        images.ImagePopupService = ImagePopupService;
        var ImageService = (function () {
            function ImageService(routes) {
                this.routes = routes;
            }
            ImageService.prototype.getTmpImageUrl = function (imageId, yearMonth) {
                return '/api/tmp-images/' + yearMonth + '/' + imageId;
            };
            ImageService.prototype.getFullImageUrl = function (config, imageId, prefix) {
                return config.configuration.image.rootPath + prefix + '/images/' + imageId + '_full';
            };
            ImageService.prototype.getThumbnailImageUrl = function (config, imageId, prefix) {
                return config.configuration.image.rootPath + prefix + '/images/' + imageId + '_thumbnail';
            };
            return ImageService;
        })();
        images.ImageService = ImageService;
    })(images = service.images || (service.images = {}));
})(service || (service = {}));
var controllers;
(function (controllers) {
    var images;
    (function (images) {
        var ImagePopupBase = (function () {
            function ImagePopupBase($modalInstance, routes, stUtils, stModal, stbImageUpload, stbImage, aspectRatioType) {
                var _this = this;
                this.$modalInstance = $modalInstance;
                this.routes = routes;
                this.stUtils = stUtils;
                this.stModal = stModal;
                this.stbImageUpload = stbImageUpload;
                this.stbImage = stbImage;
                this.DRAGGING_CLASS = 'dragging';
                this.ACTION_MODE = {
                    Select: { code: 'SEL' },
                    Upload: { code: 'UPL' },
                    Delete: { code: 'DEL' },
                    Crop: { code: 'CRP' }
                };
                this.actionMode = 'SEL';
                this.isDragging = false;
                this.aspectRatioType = aspectRatioType;
                this.fetchPooledImages(function (data) {
                    if (!(data.length > 0)) {
                        _this.switchToUploadMode();
                    }
                });
            }
            ImagePopupBase.prototype.setDraggingStyle = function (e) {
                this.isDragging = true;
                e.preventDefault();
            };
            ImagePopupBase.prototype.resetDraggingStyle = function (e) {
                this.isDragging = false;
                if (e) {
                    e.preventDefault();
                }
            };
            ImagePopupBase.prototype.dropImages = function (e) {
                e.preventDefault();
                e.stopPropagation();
                $(e.target).removeClass(this.DRAGGING_CLASS);
                var files = e.originalEvent.dataTransfer.files;
                this.temporaryFilesForCrop = files;
                this.uploadTemporarilyOrPermanently(files);
                this.resetDraggingStyle(null);
            };
            ImagePopupBase.prototype.selectUploadFile = function (e) {
                var files = $(e.target)[0].files || $(e.target).val();
                this.temporaryFilesForCrop = files;
                this.uploadTemporarilyOrPermanently(files);
            };
            ImagePopupBase.prototype.uploadTemporarilyOrPermanently = function (files) {
                var _this = this;
                var that = this;
                that.stbImageUpload.uploadTemporarilyOrPermanently(files, this.aspectRatioType, function () {
                }).success(function (res) {
                    if (_this.aspectRatioType == ImagePopupBase.ASPECT_RATIO_TYPE.Inline.code) {
                        that.switchToSelectMode();
                    }
                    else {
                        that.cropTargetImage = { imageId: res.id, yearMonth: res.yearMonth };
                        that.switchToCropMode();
                    }
                });
            };
            ImagePopupBase.prototype.cropImage = function (ipc, options) {
                ipc.stbImageUpload.uploadCroppedImages(options, ipc.aspectRatioType, function () {
                    ipc.switchToSelectMode();
                });
            };
            ImagePopupBase.prototype.deleteImage = function (clickedImage, $event) {
                var _this = this;
                if ($($event.target).hasClass('disabled')) {
                    return;
                }
                var that = this;
                var onSuccess = function (imageId) {
                    that.stUtils.toastInfo('画像を削除しました');
                    _.remove(that.pooledImages, function (obj) {
                        return obj.id == imageId;
                    });
                };
                var onFailure = function (errData, status) {
                    if (status == 400 && errData.key == 'error.image.imageUsed') {
                        that.stUtils.toastDanger('既に企業ロゴまたは求人画像に指定されている画像のため削除できません。');
                    }
                };
                that.stModal.modalConfirm({ msg: '本当に選択した画像を削除しますか？' }).result.then(function () {
                    that.routes.images.deleteImage(clickedImage.imageId).success(function () {
                        onSuccess(clickedImage.imageId);
                        _this.selectedImage = null;
                    }).error(function (errData, status) { return onFailure(errData, status); });
                });
            };
            ImagePopupBase.prototype.switchToUploadMode = function () {
                this.actionMode = this.ACTION_MODE.Upload.code;
            };
            ImagePopupBase.prototype.switchToDeleteMode = function () {
                var _this = this;
                this.fetchPooledImages(function () {
                    _this.actionMode = _this.ACTION_MODE.Delete.code;
                });
            };
            ImagePopupBase.prototype.switchToSelectMode = function () {
                var _this = this;
                this.fetchPooledImages(function () {
                    _this.actionMode = _this.ACTION_MODE.Select.code;
                });
            };
            ImagePopupBase.prototype.switchToCropMode = function () {
                this.actionMode = this.ACTION_MODE.Crop.code;
            };
            ImagePopupBase.prototype.fetchPooledImages = function (cbOnSuccess) {
                var _this = this;
                var callback = function (data) {
                    _this.pooledImages = data;
                    cbOnSuccess(data);
                };
                var aspectRatioType = ImagePopupBase.ASPECT_RATIO_TYPE;
                var imageRoutes = this.routes.images;
                switch (this.aspectRatioType) {
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
            };
            ImagePopupBase.ASPECT_RATIO_TYPE = {
                Logo: { code: 'LGO' },
                Cover: { code: 'CVR' },
                Inline: { code: 'INL' }
            };
            return ImagePopupBase;
        })();
        images.ImagePopupBase = ImagePopupBase;
    })(images = controllers.images || (controllers.images = {}));
})(controllers || (controllers = {}));
var controllers;
(function (controllers) {
    var images;
    (function (images) {
        var CoverImagePopup = (function (_super) {
            __extends(CoverImagePopup, _super);
            function CoverImagePopup($modalInstance, routes, stUtils, stModal, stbImageUpload, stbImage, initialImage, configPromise) {
                _super.call(this, $modalInstance, routes, stUtils, stModal, stbImageUpload, stbImage, images.ImagePopupBase.ASPECT_RATIO_TYPE.Cover.code);
                this.selectedImage = initialImage;
                this.initialImage = initialImage;
                this.config = configPromise.data;
                this.buttonLabels = {
                    'ok': 'カバー画像に決定'
                };
            }
            CoverImagePopup.prototype.getThumbnailImageUrl = function (imageId, prefix) {
                return this.stbImage.getThumbnailImageUrl(this.config, imageId, prefix);
            };
            CoverImagePopup.prototype.getAspectRatioType = function () {
                return images.ImagePopupBase.ASPECT_RATIO_TYPE.Cover.code;
            };
            CoverImagePopup.prototype.ok = function () {
                this.$modalInstance.close(this.selectedImage);
            };
            CoverImagePopup.prototype.cancel = function () {
                this.$modalInstance.dismiss();
            };
            CoverImagePopup.prototype.isSelectedImage = function (imageId) {
                return this.selectedImage ? (this.selectedImage.imageId == imageId) : false;
            };
            CoverImagePopup.prototype.isDeletable = function () {
                if (this.selectedImage && !this.initialImage) {
                    return true;
                }
                if (!this.selectedImage || !this.initialImage) {
                    return false;
                }
                return this.initialImage.imageId !== this.selectedImage.imageId;
            };
            CoverImagePopup.prototype.clickImage = function (imageObj, e) {
                if (this.isSelectedImage(imageObj.id)) {
                    this.selectedImage = null;
                    if (!_.isEmpty(this.initialImage)) {
                        this.buttonLabels.ok = 'カバー画像を解除';
                    }
                }
                else {
                    this.selectedImage = { imageId: imageObj.id, prefix: imageObj.prefix };
                    this.buttonLabels.ok = 'カバー画像に決定';
                }
            };
            return CoverImagePopup;
        })(images.ImagePopupBase);
        images.CoverImagePopup = CoverImagePopup;
        var LogoImagePopup = (function (_super) {
            __extends(LogoImagePopup, _super);
            function LogoImagePopup($modalInstance, routes, stUtils, stModal, stbImageUpload, stbImage, initialImage, configPromise) {
                _super.call(this, $modalInstance, routes, stUtils, stModal, stbImageUpload, stbImage, images.ImagePopupBase.ASPECT_RATIO_TYPE.Logo.code);
                this.selectedImage = initialImage;
                this.initialImage = initialImage;
                this.config = configPromise.data;
                this.buttonLabels = {
                    'ok': 'ロゴ画像に決定'
                };
            }
            LogoImagePopup.prototype.getThumbnailImageUrl = function (imageId, prefix) {
                return this.stbImage.getThumbnailImageUrl(this.config, imageId, prefix);
            };
            LogoImagePopup.prototype.getAspectRatioType = function () {
                return images.ImagePopupBase.ASPECT_RATIO_TYPE.Logo.code;
            };
            LogoImagePopup.prototype.ok = function () {
                this.$modalInstance.close(this.selectedImage);
            };
            LogoImagePopup.prototype.cancel = function () {
                this.$modalInstance.dismiss();
            };
            LogoImagePopup.prototype.isSelectedImage = function (imageId) {
                return this.selectedImage ? (this.selectedImage.imageId == imageId) : false;
            };
            LogoImagePopup.prototype.isDeletable = function () {
                if (this.selectedImage && !this.initialImage) {
                    return true;
                }
                if (!this.selectedImage || !this.initialImage) {
                    return false;
                }
                return this.initialImage.imageId !== this.selectedImage.imageId;
            };
            LogoImagePopup.prototype.clickImage = function (imageObj, e) {
                if (this.isSelectedImage(imageObj.id)) {
                    this.selectedImage = null;
                    if (!_.isEmpty(this.initialImage)) {
                        this.buttonLabels.ok = 'ロゴ画像を解除';
                    }
                }
                else {
                    this.selectedImage = { imageId: imageObj.id, prefix: imageObj.prefix };
                    this.buttonLabels.ok = 'ロゴ画像に決定';
                }
            };
            return LogoImagePopup;
        })(images.ImagePopupBase);
        images.LogoImagePopup = LogoImagePopup;
        var InlineImagePopup = (function (_super) {
            __extends(InlineImagePopup, _super);
            function InlineImagePopup($modalInstance, routes, stUtils, stModal, stbImageUpload, stbImage, configPromise) {
                _super.call(this, $modalInstance, routes, stUtils, stModal, stbImageUpload, stbImage, images.ImagePopupBase.ASPECT_RATIO_TYPE.Inline.code);
                this.selectedImages = [];
                this.config = configPromise.data;
            }
            InlineImagePopup.prototype.getThumbnailImageUrl = function (imageId, prefix) {
                return this.stbImage.getThumbnailImageUrl(this.config, imageId, prefix);
            };
            InlineImagePopup.prototype.getAspectRatioType = function () {
                return images.ImagePopupBase.ASPECT_RATIO_TYPE.Inline.code;
            };
            InlineImagePopup.prototype.ok = function () {
                this.$modalInstance.close(this.selectedImages);
            };
            InlineImagePopup.prototype.cancel = function () {
                this.$modalInstance.dismiss();
            };
            InlineImagePopup.prototype.isSelectedImage = function (imageId) {
                if (_.isEmpty(this.selectedImages)) {
                    return false;
                }
                else {
                    var found = _.find(this.selectedImages, function (image) {
                        return image.imageId == imageId;
                    });
                    return (found != null);
                }
            };
            InlineImagePopup.prototype.isDeletable = function (imageId) {
                if (!_.isEmpty(this.selectedImages)) {
                    var foundInSelectedList = _.find(this.selectedImages, function (image) {
                        return image.imageId == imageId;
                    });
                    if (foundInSelectedList)
                        return false;
                }
                if (!_.isEmpty(this.pooledImages)) {
                    var foundInPooledList = _.find(this.pooledImages, function (pooled) {
                        return pooled.id == imageId;
                    });
                    if (foundInPooledList && !foundInPooledList.deletable)
                        return false;
                }
                return true;
            };
            InlineImagePopup.prototype.clickImage = function (imageObj, e) {
                if (this.isSelectedImage(imageObj.id)) {
                    _.remove(this.selectedImages, function (selected) {
                        return selected.imageId == imageObj.id;
                    });
                }
                else {
                    this.selectedImages.push({ imageId: imageObj.id, prefix: imageObj.prefix });
                }
            };
            return InlineImagePopup;
        })(images.ImagePopupBase);
        images.InlineImagePopup = InlineImagePopup;
    })(images = controllers.images || (controllers.images = {}));
})(controllers || (controllers = {}));
var service;
(function (service) {
    var images;
    (function (images) {
        var ImageUploadService = (function () {
            function ImageUploadService($q, routes, stUtils, stStaticConfig) {
                this.$q = $q;
                this.routes = routes;
                this.stUtils = stUtils;
                this.stStaticConfig = stStaticConfig;
            }
            ImageUploadService.prototype.uploadTemporarilyOrPermanently = function (files, ratioType, callback) {
                var that = this;
                if (!that.validateTooLargeImage(files)) {
                    return;
                }
                var file = files[0];
                var allPromises = that.uploadInternal(file, ratioType, function (errData, status) {
                    that.handleUploadError(errData, status, ratioType);
                });
                this.$q.all(allPromises)['finally'](callback);
                return allPromises;
            };
            ImageUploadService.prototype.uploadCroppedImages = function (options, ratioType, callback) {
                var that = this;
                if (!that.validateTooLargeImage(options.files)) {
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
                    }, function (errData, status) {
                        that.handleUploadError(errData, status, ratioType);
                    });
                });
                this.$q.all(allPromises)['finally'](callback);
            };
            ImageUploadService.prototype.validateTooLargeImage = function (files) {
                var hasTooLargeImg = _.find(files, function (file) {
                    return (file.size > 5242880);
                });
                if (hasTooLargeImg) {
                    this.stUtils.toastDanger("5MBを超える画像を含んでいます。");
                }
                return !hasTooLargeImg;
            };
            ImageUploadService.prototype.uploadInternal = function (file, ratioType, cbOnError) {
                var form = new FormData();
                form.append('image', file);
                var aspectRatioType = controllers.images.ImagePopupBase.ASPECT_RATIO_TYPE;
                var imageRoutes = this.routes.images;
                var uploadFunc = null;
                switch (ratioType) {
                    case (aspectRatioType.Logo.code):
                        uploadFunc = imageRoutes.uploadTemporaryLogo;
                        break;
                    case (aspectRatioType.Cover.code):
                        uploadFunc = imageRoutes.uploadTemporaryCover;
                        break;
                    case (aspectRatioType.Inline.code):
                        uploadFunc = imageRoutes.uploadInline;
                        break;
                }
                return uploadFunc(form).error(cbOnError);
            };
            ImageUploadService.prototype.cropInternal = function (options, cbOnError) {
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
                var uploadFunc = null;
                switch (options.ratioType) {
                    case (aspectRatioType.Logo.code):
                        uploadFunc = imageRoutes.uploadLogo;
                        break;
                    case (aspectRatioType.Cover.code):
                        uploadFunc = imageRoutes.uploadCover;
                        break;
                    case (aspectRatioType.Inline.code):
                        throw new Error('Crop Upload is not supposed to be used at the moment');
                }
                return uploadFunc(form).error(cbOnError);
            };
            ImageUploadService.prototype.handleUploadError = function (errData, status, ratioType) {
                var aspectRatioType = controllers.images.ImagePopupBase.ASPECT_RATIO_TYPE;
                if (status == 400) {
                    var errorToast = this.stUtils.toastDanger;
                    if (errData.key == 'error.image.maximumNumberOfImagesExceeded') {
                        errorToast('画像の上限枚数に達しているためアップロードに失敗しました。');
                    }
                    else if (errData.key == 'error.image.invalidImageType' || errData.key == 'error.image.imageFileMissing') {
                        errorToast('不正なファイル形式です');
                    }
                    else if (errData.key == 'error.image.invalidFile') {
                        errorToast('不正なファイルです');
                    }
                    else if (errData.key == 'error.image.maximumImageSizeExceeded') {
                        errorToast('アップロード可能な画像の最大サイズは5MBです');
                    }
                    else if (errData.key == 'error.image.imageSizeTooSmall') {
                        if (ratioType == aspectRatioType.Inline.code) {
                            var inlineConf = this.stStaticConfig.images.inline;
                            errorToast("画像の最低サイズは 横" + inlineConf.minWidth + "px × 縦" + inlineConf.minHeight + "px です");
                        }
                    }
                    else if (errData.key == 'error.image.temporaryImageSizeTooSmall') {
                        if (ratioType == aspectRatioType.Cover.code) {
                            var coverConf = this.stStaticConfig.images.cover;
                            errorToast("画像の最低サイズは 横" + coverConf.minWidth + "px × 縦" + coverConf.minHeight + "px です");
                        }
                        if (ratioType == aspectRatioType.Logo.code) {
                            var logoConf = this.stStaticConfig.images.logo;
                            errorToast("画像の最低サイズは 横" + logoConf.minWidth + "px × 縦" + logoConf.minHeight + "px です");
                        }
                    }
                }
                else if (status == 413) {
                    errorToast('アップロード可能な画像の最大サイズは5MBです');
                }
                else {
                    errorToast('画像のアップロードに失敗しました。');
                }
            };
            return ImageUploadService;
        })();
        images.ImageUploadService = ImageUploadService;
    })(images = service.images || (service.images = {}));
})(service || (service = {}));
var stanby;
(function (stanby) {
    var routing;
    (function (routing) {
        var imagepopup;
        (function (imagepopup) {
            function initRouting() {
                angular.module('stanbyControllers').controller('CoverImagePopupCtrl', controllers.images.CoverImagePopup).controller('LogoImagePopupCtrl', controllers.images.LogoImagePopup).controller('InlineImagePopupCtrl', controllers.images.InlineImagePopup).service('stbImage', service.images.ImageService).service('stbImagePopup', service.images.ImagePopupService).service('stbImageUpload', service.images.ImageUploadService);
            }
            imagepopup.initRouting = initRouting;
        })(imagepopup = routing.imagepopup || (routing.imagepopup = {}));
    })(routing = stanby.routing || (stanby.routing = {}));
})(stanby || (stanby = {}));

var common;
(function (common) {
    var job;
    (function (job) {
        var JobInitService = (function () {
            function JobInitService(enums, routes, jobValidator, stUtils) {
                this.enums = enums;
                this.routes = routes;
                this.jobValidator = jobValidator;
                this.stUtils = stUtils;
            }
            JobInitService.prototype.initModelForAdd = function () {
                var model = new JobEditModel(this.routes);
                model.job = this.createJobBarebone();
                model.job.jobIdAlias = this.jobValidator.issueJobIdAlias();
                model.addLocation();
                return model;
            };
            JobInitService.prototype.createJobBarebone = function () {
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
                };
            };
            JobInitService.prototype.createJobDetailBarebone = function () {
                return {
                    jobAdTitle: null,
                    salary: { unit: null, amountFrom: null, amountTo: null, supplement: null },
                    locations: [],
                    locationSupplement: null,
                    descriptions: [],
                    markdownFreeText: null
                };
            };
            JobInitService.prototype.initModelForEdit = function (data) {
                var model = new JobEditModel(this.routes);
                model.job = data;
                if (model.job.closeAt) {
                    model.closeAt = new Date(model.job.closeAt);
                    model.closeAt.setDate(model.closeAt.getDate() - 1);
                    model.job.noEndDate = false;
                }
                else {
                    model.job.noEndDate = true;
                }
                return model;
            };
            return JobInitService;
        })();
        job.JobInitService = JobInitService;
        var JobValidator = (function () {
            function JobValidator(routes) {
                this.routes = routes;
            }
            JobValidator.prototype.sanitize = function (model) {
                if (!model.job.jobIdAlias) {
                    model.job.jobIdAlias = this.issueJobIdAlias();
                }
            };
            JobValidator.prototype.validateTerm = function (formScope, mainVal, relationVal) {
                if (mainVal === null && relationVal === null) {
                    formScope.termDescDescription.$setDirty();
                    formScope.termDescTerm.$setDirty();
                }
                return (!mainVal && relationVal) ? false : true;
            };
            JobValidator.prototype.trimTermDescItem = function (termDescItems) {
                var descItem;
                for (var i = 0; i < termDescItems.length; ++i) {
                    descItem = termDescItems[i];
                    if (!descItem.term && !descItem.description) {
                        termDescItems.splice(i, 1);
                        i -= 1;
                    }
                }
            };
            JobValidator.prototype.validZipcode = function (zipcode) {
                return zipcode ? !!zipcode.match(/^\d{3}-?\d{4}$/) : false;
            };
            JobValidator.prototype.issueJobIdAlias = function () {
                if (!Date.prototype.toISOString) {
                    (function () {
                        function pad(number) {
                            var r = String(number);
                            if (r.length === 1) {
                                r = '0' + r;
                            }
                            return r;
                        }
                        Date.prototype.toISOString = function () {
                            return this.getUTCFullYear() + '-' + pad(this.getUTCMonth() + 1) + '-' + pad(this.getUTCDate()) + 'T' + pad(this.getUTCHours()) + ':' + pad(this.getUTCMinutes()) + ':' + pad(this.getUTCSeconds()) + '.' + String((this.getUTCMilliseconds() / 1000).toFixed(3)).slice(2, 5) + 'Z';
                        };
                    }());
                }
                var tm = new Date;
                var iso = tm.toISOString();
                return iso.replace(/(\d\d)(\d\d)-(\d+)-(\d+)T(\d+):(\d+):(\d+)\..+/, '$2$3$4-$5$6$7');
            };
            JobValidator.prototype.validateJobIdAlias = function (aliasModelCtrl, jobId) {
                var VALIDITY_KEY = 'aliasDuplidate';
                var input = aliasModelCtrl.$viewValue;
                if (!input) {
                    aliasModelCtrl.$setValidity(VALIDITY_KEY, true);
                    return;
                }
                if (aliasModelCtrl.$invalid) {
                    var hasOtherError = false;
                    _.forIn(aliasModelCtrl.$error, function (val, key) {
                        if (key != VALIDITY_KEY && val) {
                            hasOtherError = true;
                        }
                        ;
                    });
                    if (hasOtherError) {
                        aliasModelCtrl.$setValidity(VALIDITY_KEY, true);
                        return;
                    }
                }
                var postData = { jobId: jobId, jobIdAlias: input };
                this.routes.jobs.validateAlias(postData).success(function (data) {
                    aliasModelCtrl.$setValidity(VALIDITY_KEY, true);
                }).error(function (xhr, status) {
                    if (status == 400) {
                        aliasModelCtrl.$setValidity(VALIDITY_KEY, false);
                    }
                });
            };
            return JobValidator;
        })();
        job.JobValidator = JobValidator;
        var JobEditModel = (function () {
            function JobEditModel(routes) {
                this.routes = routes;
                this.noEndDate = true;
                this.closeAt = new Date();
            }
            JobEditModel.prototype.addLocation = function () {
                this.job.content.locations.push({ postalCode: null, address: null });
            };
            JobEditModel.prototype.addTdSet = function () {
                this.job.content.descriptions.push({ term: null, description: null });
            };
            JobEditModel.prototype.deleteLocation = function (index) {
                this.job.content.locations.splice(index, 1);
            };
            JobEditModel.prototype.deleteTdSet = function (index) {
                this.job.content.descriptions.splice(index, 1);
            };
            JobEditModel.prototype.getAddress = function (indexTarget) {
                var _this = this;
                var code = this.job.content.locations[indexTarget].postalCode;
                this.routes.masters.address(code).success(function (data) {
                    _this.job.content.locations[indexTarget].address = data.address;
                });
            };
            JobEditModel.prototype.isSalaryAmountInputRequired = function () {
                return _.contains(JobEditModel.NO_SALARY_AMOUNT_LIST, this.job.content.salary.unit);
            };
            JobEditModel.NO_SALARY_AMOUNT_LIST = ["NEG", "NOP"];
            return JobEditModel;
        })();
        job.JobEditModel = JobEditModel;
        var JobSubmitService = (function () {
            function JobSubmitService(stModal, jobValidator) {
                this.stModal = stModal;
                this.jobValidator = jobValidator;
            }
            JobSubmitService.prototype.validateOnDraftSave = function (form) {
                var errArray = [];
                if (form.jobIdAlias.$error['aliasDuplidate'])
                    errArray.push("他の求人で使用している求人IDが入力されています");
                if (form.jobName.$error['required'])
                    errArray.push("募集職種名を入力してください");
                if (form.jobTypeRadio.$error['required'])
                    errArray.push("雇用形態を選択してください");
                return errArray;
            };
            JobSubmitService.prototype.modalOnAction = function (title) {
                if (title === void 0) { title = '変更を保存します。よろしいですか？'; }
                return this.stModal.modalConfirm({
                    msg: title
                }).result;
            };
            return JobSubmitService;
        })();
        job.JobSubmitService = JobSubmitService;
    })(job = common.job || (common.job = {}));
})(common || (common = {}));
var stanby;
(function (stanby) {
    var routing;
    (function (routing) {
        var jobcommon;
        (function (jobcommon) {
            function initRouting() {
                angular.module('stanbyControllers').service('jobValidator', common.job.JobValidator).service('jobInitService', common.job.JobInitService).service('jobSubmitService', common.job.JobSubmitService).directive('stJobForm', function () {
                    return {
                        restrict: 'E',
                        replace: true,
                        templateUrl: '/internal/parts/jobs/edit-form'
                    };
                });
            }
            jobcommon.initRouting = initRouting;
        })(jobcommon = routing.jobcommon || (routing.jobcommon = {}));
    })(routing = stanby.routing || (stanby.routing = {}));
})(stanby || (stanby = {}));

var controllers;
(function (controllers) {
    var job;
    (function (_job) {
        var JobList = (function () {
            function JobList(enums, routes, stbUser, stUtils, stModal, $state, $scope, $filter) {
                this.enums = enums;
                this.routes = routes;
                this.stbUser = stbUser;
                this.stUtils = stUtils;
                this.stModal = stModal;
                this.$state = $state;
                this.$scope = $scope;
                this.$filter = $filter;
                this.searchParams = {};
                this.sortDefault = 'jobIdAlias';
            }
            JobList.prototype.init = function () {
                var _this = this;
                var mergeToJobs = function () {
                    if (_this.applicationCounts && _this.jobs) {
                        _this.jobs = _.map(_this.jobs, function (job) {
                            var found = _.find(_this.applicationCounts, function (ac) {
                                return ac.jobId === job.id;
                            });
                            if (found) {
                                job.countAll = found.countAll ? found.countAll : 0;
                                job.countNoAction = found.countNoAction ? found.countNoAction : 0;
                            }
                            else {
                                job.countAll = job.countNoAction = 0;
                            }
                            job.deadline = _this.getApplicableStatus(job.jobStatus, job.closeAt);
                            return job;
                        });
                    }
                };
                this.stbUser.getAccountInfo(function (data) {
                    _this.account = data.account;
                });
                this.routes.applications.overviews().success(function (data) {
                    _this.applicationCounts = data.overviews;
                    mergeToJobs();
                });
                console.log(this.routes.jobs.list());
                this.routes.jobs.list().success(function (data) {
                    _this.initJobFilteringWatch();
                    _this.jobs = data.jobs;
                    mergeToJobs();
                });
            };
            JobList.prototype.initJobFilteringWatch = function () {
                var _this = this;
                this.$scope.$watch(function () {
                    return _this.searchParams;
                }, function (newValue) {
                    _.forEach(_this.jobs, function (job) {
                        job.matchingSearchCond = _this.matchJobConditions(job, _this.searchParams);
                    });
                }, true);
            };
            JobList.prototype.matchJobConditions = function (job, params) {
                if (params.jobStatus && params.jobStatus != job.jobStatus) {
                    return false;
                }
                if (params.name && !_.contains(job.name, params.name)) {
                    return false;
                }
                if (params.indexingStatus && params.indexingStatus != job.indexingStatus) {
                    return false;
                }
                return true;
            };
            JobList.prototype.getApplicableStatus = function (status, closeAt) {
                var now = new Date();
                var close = new Date(closeAt);
                if (status == this.enums.jobStatus.PUB.code) {
                    if (closeAt != undefined && close > now) {
                        close.setDate(close.getDate() - 1);
                        return this.$filter('date')(close, 'yyyy/MM/dd', '+0900');
                    }
                    else if (close <= now) {
                        return this.enums.jobApplicableStatus.CLS.name;
                    }
                    else {
                        return '無期限';
                    }
                }
                else {
                    return this.enums.jobApplicableStatus.OTH.name;
                }
            };
            JobList.prototype.publish = function (jobId) {
                var _this = this;
                this.routes.jobs.applyPublishing(jobId).success(function (res) {
                    _this.init();
                    _this.stUtils.toastInfo("公開されました。反映されるまで数時間かかることがあります。「公開企業プロフィール」の設定もあわせてご確認ください");
                });
            };
            JobList.prototype.privatize = function (jobId) {
                var _this = this;
                this.routes.jobs.withdrawPublishing(jobId).success(function (res) {
                    _this.init();
                    _this.stUtils.toastInfo("公開は取り下げられました。反映されるまで数時間かかることがあります");
                });
            };
            JobList.prototype.showReason = function (rejectReason, jobId) {
                var _this = this;
                var rejectReasonText = rejectReason.replace(/[\r\n]+/g, '<br/>');
                var modal = this.stModal.modalConfirm({
                    title: 'スタンバイ掲載審査否認の理由',
                    msg: '<p class="pg-deny-reason-description">スタンバイへの掲載を見合わせることとさせていただきました。下記をご確認の上、求人情報を更新をお願いいたします。</p><dl class="pg-deny-reason-definition"><dt>掲載見合わせ理由:</dt><dd>' + rejectReasonText + '</dd></dl>',
                    cancelButton: 'ウィンドウを閉じる',
                    okButton: '求人情報を修正して再審査を申請する'
                });
                modal.result.then(function () {
                    _this.$state.transitionTo('edit', { jobId: jobId });
                });
            };
            JobList.prototype.getMatchingJobCount = function () {
                return this.jobs ? _.filter(this.jobs, function (job) {
                    return job.matchingSearchCond;
                }).length : 0;
            };
            JobList.prototype.countPublishedJobs = function () {
                var _this = this;
                return this.jobs ? _.filter(this.jobs, function (job) {
                    return job.jobStatus == _this.enums.jobStatus.PUB.code;
                }).length : 0;
            };
            return JobList;
        })();
        _job.JobList = JobList;
        var JobEdit = (function () {
            function JobEdit(enums, jobValidator, config, routes, jobFetchPromise, accountPromise, stbImagePopup, stbImage, jobInitService, jobSubmitService, stUtils, stModal, $state, _, $stateParams, stbUser, $scope, $timeout, stStaticConfig) {
                this.enums = enums;
                this.jobValidator = jobValidator;
                this.config = config;
                this.routes = routes;
                this.jobFetchPromise = jobFetchPromise;
                this.accountPromise = accountPromise;
                this.stbImagePopup = stbImagePopup;
                this.stbImage = stbImage;
                this.jobInitService = jobInitService;
                this.jobSubmitService = jobSubmitService;
                this.stUtils = stUtils;
                this.stModal = stModal;
                this.$state = $state;
                this._ = _;
                this.$stateParams = $stateParams;
                this.stbUser = stbUser;
                this.$scope = $scope;
                this.$timeout = $timeout;
                this.stStaticConfig = stStaticConfig;
                this.isPreviewingMarkdown = false;
                this.flagFocusedMarkdown = false;
                this.publishMenu = false;
                this.applicationId = $stateParams['applicationId'];
            }
            JobEdit.prototype.init = function () {
                var _this = this;
                var job = this.jobFetchPromise.data;
                this.account = this.accountPromise.data.account;
                this.config = this.config.data;
                this.model = this.jobInitService.initModelForEdit(job);
                this.stbUser.getAccountInfo(function (data) {
                    _this.account = data.account;
                });
            };
            JobEdit.prototype.getStatus = function (status, closeAt) {
                var now = new Date();
                var close = new Date(closeAt);
                if (status == 'PUB') {
                    if (closeAt == null || close > now) {
                        return '募集中';
                    }
                    else if (close <= now) {
                        return '停止中';
                    }
                    ;
                }
                else {
                    return '-';
                }
                ;
            };
            JobEdit.prototype.getCloseDate = function () {
                var close = new Date(this.model.job.closeAt);
                close.setDate(close.getDate() - 1);
                return close;
            };
            JobEdit.prototype.getJobIdAlias = function () {
                this.model.job.jobIdAlias = this.jobValidator.issueJobIdAlias();
            };
            JobEdit.prototype.isInvalidCloseDate = function () {
                if (this.model.job.noEndDate) {
                    return false;
                }
                else {
                    return this.isPastDate(this.model.closeAt);
                }
            };
            JobEdit.prototype.isPastDate = function (date) {
                if (date == null) {
                    return false;
                }
                var now = new Date();
                var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                return date < today;
            };
            JobEdit.prototype.showCoverImagePopup = function () {
                var _this = this;
                var initialImage = this.model.job.coverImage;
                this.stbImagePopup.showCoverImagePopup(initialImage, function (result) {
                    _this.model.job.coverImage = result;
                });
            };
            JobEdit.prototype.showCoverInstruction = function () {
                var _this = this;
                var modal = this.stModal.modalConfirm({
                    title: 'カバー画像とは',
                    msg: '<p class="sg-modal-instruction sg-job-cover-instruction">「カバー画像」は、公開求人ページで上部に掲載される画像です。<br>オフィスや職場の雰囲気が伝わる画像、仕事内容がイメージしやすい画像を掲載することにより、求職者が求人に興味を持ちやすくなります。<ul class="sg-cover-list"><li>JPEG、PNG、GIFが登録可能な画像ファイルの形式です</li><li>画像ファイルの最大容量は5MB、最小サイズは横幅500px、縦幅200pxです</li></ul>',
                    okButton: 'カバー画像を変更する',
                    cancelButton: 'ウィンドウを閉じる'
                });
                modal.result.then(function () {
                    _this.showCoverImagePopup();
                });
            };
            JobEdit.prototype.showInlineImagePopup = function () {
                var that = this;
                this.stbImagePopup.showInlineImagePopup(function (results) {
                    if (results && results.length > 0) {
                        var $element = $('#jsi-markdown-freetext'), $textArea = $element[0], beforeText, afterText, text = $element.val(), position = $textArea.selectionStart;
                        var imgListTxt = _.map(results, function (res) {
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
            };
            JobEdit.prototype.uploadInlineImageToInsertText = function ($element, params) {
                var _this = params.this;
                _this.routes.images.uploadInline(params.form).success(function (res) {
                    var beforeText, afterText, text = $element.val(), imageUrl = _this.stbImage.getFullImageUrl(_this.config, res.id, res.prefix), imageText = '![画像](' + imageUrl + ' "画像")\n', position = $element[0].selectionStart;
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
                }).error(function (err) {
                });
            };
            JobEdit.prototype.deleteTdSet = function (index) {
                this.model.deleteTdSet(index);
                this.$scope.termDescForm.$setDirty();
            };
            JobEdit.prototype.saveDraft = function (form) {
                var errList = this.jobSubmitService.validateOnDraftSave(form);
                if (!_.isEmpty(errList)) {
                    this.stUtils.toastDanger(errList.join('<br/>'));
                    return;
                }
                if (this.model.job.noEndDate) {
                    this.model.closeAt = null;
                    this.model.job.closeAt = null;
                }
                if (this.model.closeAt) {
                    var closeDate = new Date(this.model.closeAt.getTime());
                    closeDate.setDate(closeDate.getDate() + 1);
                    this.model.job.closeAt = closeDate.toISOString();
                }
                this.jobValidator.trimTermDescItem(this.model.job.content.descriptions);
                var that = this;
                this.jobSubmitService.modalOnAction().then(function () {
                    that.jobValidator.sanitize(that.model);
                    var clonedJob = _.clone(that.model.job);
                    clonedJob.jobStatus = 'RDY';
                    that.routes.jobs.update(clonedJob.id, clonedJob).success(function (res) {
                        that.$state.reload();
                        that.model.job.versionNo += 1;
                        that.$scope.form.$setPristine();
                        that.stUtils.toastInfo('求人情報を更新しました。');
                    });
                });
            };
            JobEdit.prototype.previewHTML = function () {
                var _this = this;
                if (this.model.job.content.markdownFreeText) {
                    this.routes.utils.convertMarkdownToHtml(this.model.job.content.markdownFreeText).success(function (data) {
                        _this.model.job.htmlFreeText = data.htmlText;
                        _this.isPreviewingMarkdown = true;
                    });
                }
            };
            JobEdit.prototype.editMarkdown = function () {
                this.isPreviewingMarkdown = false;
                this.$timeout(function () {
                    var $focusEl = $('.sg-form-markdown-textarea[name="markdownFreeText"]');
                    if ($focusEl.length === 1) {
                        $focusEl.focus();
                    }
                });
            };
            JobEdit.prototype.focusMarkdown = function () {
                this.flagFocusedMarkdown = true;
            };
            JobEdit.prototype.switchToPreview = function () {
                var _this = this;
                this.$scope.$emit('viewingPreview');
                if (this.model.job.noEndDate) {
                    this.model.closeAt = null;
                    this.model.job.closeAt = null;
                }
                ;
                if (this.model.closeAt) {
                    var closeDate = new Date(this.model.closeAt.getTime());
                    closeDate.setDate(closeDate.getDate() + 1);
                    this.model.job.closeAt = closeDate.toISOString();
                }
                ;
                this.jobValidator.trimTermDescItem(this.model.job.content.descriptions);
                if (this.model.job.content.markdownFreeText) {
                    this.routes.utils.convertMarkdownToHtml(this.model.job.content.markdownFreeText).success(function (data) {
                        _this.model.job.htmlFreeText = data.htmlText;
                        _this.$state.go('edit.preview', { jobId: _this.model.job.id });
                    });
                }
                else {
                    this.model.job.htmlFreeText = "";
                    this.$state.go('edit.preview', { jobId: this.model.job.id });
                }
            };
            JobEdit.prototype.cloneJob = function () {
                this.$state.go('add', { copySourceId: this.model.job.id });
            };
            JobEdit.prototype.clearSalalyAmount = function () {
                if (this.model.job.content.salary.unit === 'NEG' || this.model.job.content.salary.unit === 'NOP') {
                    this.model.job.content.salary.amountFrom = null;
                    this.model.job.content.salary.amountTo = null;
                }
            };
            JobEdit.prototype.withdraw = function () {
                var _this = this;
                var modal = this.stModal.modalConfirm({
                    title: '求人の公開停止',
                    msg: '求人を公開停止すると、掲載審査依頼が取り下げられ、求人が公開中の場合は非公開となります。<br>続行してよろしいですか？'
                });
                modal.result.then(function () {
                    _this.routes.jobs.withdrawPublishing(_this.model.job.id).success(function (res) {
                        _this.stUtils.toastInfo("求人を取り下げました。");
                        _this.$state.go('list');
                    });
                });
            };
            JobEdit.prototype.confirmPublish = function () {
                var _this = this;
                var modal = this.stModal.modalConfirm({
                    title: '求人の作成・公開',
                    msg: '<ul>' + '<li>検索エンジン「スタンバイ」への掲載を準備させていただきます。求人は最大3営業日以内に掲載されます。</li>' + '<li>また、スタンバイへの掲載とは別に独自の求人ページが作成されます。貴社ウェブサイトの採用ページ等にご利用いただくことが可能です。</li>' + '<li>求人ページ上に表示される「会社情報」は、「公開企業プロフィール」ページで編集できます。</li>' + '<ul>' + '<br>続行してもよろしいですか？'
                });
                modal.result.then(function () {
                    _this.jobValidator.trimTermDescItem(_this.model.job.content.descriptions);
                    _this.publishDefault();
                });
            };
            JobEdit.prototype.publishDefault = function () {
                if (this.model.job.noEndDate) {
                    this.model.closeAt = null;
                    this.model.job.closeAt = null;
                }
                if (this.model.closeAt) {
                    var closeDate = new Date(this.model.closeAt.setHours(0, 0, 0, 0));
                    closeDate.setDate(closeDate.getDate() + 1);
                    this.model.job.closeAt = closeDate.toISOString();
                }
                if (this.model.job.content.salary.unit === "NOP" || this.model.job.content.salary.unit === "NEG") {
                    delete this.model.job.content.salary.amountTo;
                    delete this.model.job.content.salary.amountFrom;
                }
                this.model.job.jobStatus = 'PUB';
                var that = this;
                var publish = function (jobId, job) {
                    that.routes.jobs.update(jobId, job).success(function (res) {
                        that.$scope.$emit('stGlobalNavShow');
                        that.stUtils.toastInfo("公開されました。反映されるまで数時間かかることがあります。「公開企業プロフィール」の設定もあわせてご確認ください");
                        that.$state.go('list');
                    });
                };
                publish(this.model.job.id, that.model.job);
            };
            return JobEdit;
        })();
        _job.JobEdit = JobEdit;
        var JobAdd = (function () {
            function JobAdd(enums, jobValidator, config, stbImagePopup, routes, $state, $scope, $location, jobInitService, jobSubmitService, stUtils, stModal, $timeout, stbImage, copySourcePromise, stStaticConfig) {
                this.enums = enums;
                this.jobValidator = jobValidator;
                this.config = config;
                this.stbImagePopup = stbImagePopup;
                this.routes = routes;
                this.$state = $state;
                this.$scope = $scope;
                this.$location = $location;
                this.jobInitService = jobInitService;
                this.jobSubmitService = jobSubmitService;
                this.stUtils = stUtils;
                this.stModal = stModal;
                this.$timeout = $timeout;
                this.stbImage = stbImage;
                this.copySourcePromise = copySourcePromise;
                this.stStaticConfig = stStaticConfig;
                this.isPreviewingMarkdown = false;
                this.flagFocusedMarkdown = false;
                this.publishMenu = false;
            }
            JobAdd.prototype.init = function () {
                this.config = this.config.data;
                this.model = this.jobInitService.initModelForAdd();
                if (this.copySourcePromise && this.copySourcePromise.data) {
                    this.setUpModelWithCopySource(this.copySourcePromise.data);
                }
                this.model.job.content.markdownFreeText = '';
            };
            JobAdd.prototype.setUpModelWithCopySource = function (copySource) {
                this.model.job.content = copySource.content;
                this.model.job.jobType = copySource.jobType;
                this.model.job.name = copySource.name;
                this.model.job.coverImage = copySource.coverImage;
                this.model.job.jobIdAlias = "copy_of_" + this.model.job.jobIdAlias;
            };
            JobAdd.prototype.getJobIdAlias = function () {
                this.model.job.jobIdAlias = this.jobValidator.issueJobIdAlias();
            };
            JobAdd.prototype.isInvalidCloseDate = function () {
                if (this.model.job.noEndDate) {
                    return false;
                }
                else {
                    return this.isPastDate(this.model.closeAt);
                }
            };
            JobAdd.prototype.isPastDate = function (date) {
                if (date == null) {
                    return false;
                }
                var now = new Date();
                var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                return date < today;
            };
            JobAdd.prototype.showCoverImagePopup = function () {
                var _this = this;
                var initialImage = this.model.job.coverImage;
                this.stbImagePopup.showCoverImagePopup(initialImage, function (result) {
                    _this.model.job.coverImage = result;
                });
            };
            JobAdd.prototype.showCoverInstruction = function () {
                var _this = this;
                var modal = this.stModal.modalConfirm({
                    title: 'カバー画像とは',
                    msg: '<p class="sg-modal-instruction sg-job-cover-instruction">「カバー画像」は、公開求人ページで上部に掲載される画像です。<br>オフィスや職場の雰囲気が伝わる画像、仕事内容がイメージしやすい画像を掲載することにより、求職者が求人に興味を持ちやすくなります。<ul class="sg-cover-list"><li>JPEG、PNG、GIFが登録可能な画像ファイルの形式です</li><li>画像ファイルの最大容量は5MB、最小サイズは横幅500px、縦幅200pxです</li></ul>',
                    okButton: 'カバー画像を変更する',
                    cancelButton: 'ウィンドウを閉じる'
                });
                modal.result.then(function () {
                    _this.showCoverImagePopup();
                });
            };
            JobAdd.prototype.showInlineImagePopup = function (textAreaId) {
                var that = this;
                this.stbImagePopup.showInlineImagePopup(function (results) {
                    if (results && results.length > 0) {
                        var $element = $('#jsi-markdown-freetext'), $textArea = $element[0], beforeText, afterText, text = $element.val(), position = $textArea.selectionStart;
                        var imgListTxt = _.map(results, function (res) {
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
            };
            JobAdd.prototype.uploadInlineImageToInsertText = function ($element, params) {
                var _this = params.this;
                _this.routes.images.uploadInline(params.form).success(function (res) {
                    var beforeText, afterText, text = $element.val(), imageUrl = _this.stbImage.getFullImageUrl(_this.config, res.id, res.prefix), imageText = '![画像](' + imageUrl + ' "画像")\n', position = $element[0].selectionStart;
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
                }).error(function (err) {
                });
            };
            JobAdd.prototype.deleteTdSet = function (index) {
                this.model.deleteTdSet(index);
                this.$scope.termDescForm.$setDirty();
            };
            JobAdd.prototype.saveDraft = function (form) {
                var errList = this.jobSubmitService.validateOnDraftSave(form);
                if (!_.isEmpty(errList)) {
                    this.stUtils.toastDanger(errList.join('<br/>'));
                    return;
                }
                if (this.model.job.noEndDate) {
                    this.model.closeAt = null;
                    this.model.job.closeAt = null;
                }
                if (this.model.closeAt) {
                    var closeDate = new Date(this.model.closeAt.getTime());
                    closeDate.setDate(closeDate.getDate() + 1);
                    this.model.job.closeAt = closeDate.toISOString();
                }
                this.jobValidator.trimTermDescItem(this.model.job.content.descriptions);
                var that = this;
                this.jobSubmitService.modalOnAction().then(function () {
                    that.jobValidator.sanitize(that.model);
                    var clonedJob = _.clone(that.model.job);
                    clonedJob.jobStatus = 'RDY';
                    that.routes.jobs.create(clonedJob).success(function (res) {
                        that.stUtils.toastInfo('求人情報を登録しました。');
                        that.$state.transitionTo('edit', { jobId: res.jobId });
                    });
                });
            };
            JobAdd.prototype.previewHTML = function () {
                var _this = this;
                if (this.model.job.content.markdownFreeText) {
                    this.routes.utils.convertMarkdownToHtml(this.model.job.content.markdownFreeText).success(function (data) {
                        _this.model.job.htmlFreeText = data.htmlText;
                        _this.isPreviewingMarkdown = true;
                    });
                }
            };
            JobAdd.prototype.editMarkdown = function () {
                this.isPreviewingMarkdown = false;
                this.$timeout(function () {
                    var $focusEl = $('.sg-form-markdown-textarea[name="markdownFreeText"]');
                    if ($focusEl.length === 1) {
                        $focusEl.focus();
                    }
                });
            };
            JobAdd.prototype.focusMarkdown = function () {
                this.flagFocusedMarkdown = true;
            };
            JobAdd.prototype.switchToPreview = function () {
                var _this = this;
                this.$scope.$emit('viewingPreview');
                if (this.model.job.noEndDate) {
                    this.model.closeAt = null;
                    this.model.job.closeAt = null;
                }
                ;
                if (this.model.closeAt) {
                    var closeDate = new Date(this.model.closeAt.getTime());
                    closeDate.setDate(closeDate.getDate() + 1);
                    this.model.job.closeAt = closeDate.toISOString();
                }
                ;
                this.jobValidator.trimTermDescItem(this.model.job.content.descriptions);
                if (this.model.job.content.markdownFreeText) {
                    this.routes.utils.convertMarkdownToHtml(this.model.job.content.markdownFreeText).success(function (data) {
                        _this.model.job.htmlFreeText = data.htmlText;
                        _this.$state.go('add.preview');
                    });
                }
                else {
                    this.model.job.htmlFreeText = "";
                    this.$state.go('add.preview');
                }
            };
            JobAdd.prototype.clearSalalyAmount = function () {
                if (this.model.job.content.salary.unit === 'NEG' || this.model.job.content.salary.unit === 'NOP') {
                    this.model.job.content.salary.amountFrom = null;
                    this.model.job.content.salary.amountTo = null;
                }
            };
            JobAdd.prototype.confirmPublish = function () {
                var _this = this;
                var modal = this.stModal.modalConfirm({
                    title: '求人の作成・公開',
                    msg: '<ul>' + '<li>検索エンジン「スタンバイ」への掲載を準備させていただきます。求人は最大3営業日以内に掲載されます。</li>' + '<li>また、スタンバイへの掲載とは別に独自の求人ページが作成されます。貴社ウェブサイトの採用ページ等にご利用いただくことが可能です。</li>' + '<li>求人ページ上に表示される「会社情報」は、「公開企業プロフィール」ページで編集できます。</li>' + '<ul>' + '<br/>続行してもよろしいですか？'
                });
                modal.result.then(function () {
                    _this.jobValidator.trimTermDescItem(_this.model.job.content.descriptions);
                    _this.publishDefault();
                });
            };
            JobAdd.prototype.publishDefault = function () {
                if (this.model.job.noEndDate) {
                    this.model.closeAt = null;
                    this.model.job.closeAt = null;
                }
                if (this.model.closeAt) {
                    var closeDate = new Date(this.model.closeAt.getTime());
                    closeDate.setDate(closeDate.getDate() + 1);
                    this.model.job.closeAt = closeDate.toISOString();
                }
                ;
                if (this.model.job.content.salary.unit === "NOP" || this.model.job.content.salary.unit === "NEG") {
                    delete this.model.job.content.salary.amountTo;
                    delete this.model.job.content.salary.amountFrom;
                }
                this.model.job.jobStatus = 'PUB';
                var that = this;
                var ifNew = _.clone(this);
                var publish = function (jobId, job) {
                    that.routes.jobs.update(jobId, job).success(function (res) {
                        that.$scope.$emit('stGlobalNavShow');
                        that.stUtils.toastInfo("公開されました。反映されるまで数時間かかることがあります。「公開企業プロフィール」の設定もあわせてご確認ください");
                        that.$state.go('list');
                    });
                };
                ifNew.routes.jobs.create(ifNew.model.job).success(function (res) {
                    that.routes.jobs.detail(res.jobId).success(function (newJob) {
                        publish(newJob.id, newJob);
                    });
                });
            };
            return JobAdd;
        })();
        _job.JobAdd = JobAdd;
        var JobPreview = (function () {
            function JobPreview(jobFetchPromise, $scope, $state, $stateParams, $http, stModal, stUtils, routes) {
                this.jobFetchPromise = jobFetchPromise;
                this.$scope = $scope;
                this.$state = $state;
                this.$stateParams = $stateParams;
                this.$http = $http;
                this.stModal = stModal;
                this.stUtils = stUtils;
                this.routes = routes;
                this.isPcMode = true;
                this.publishMenu = false;
            }
            JobPreview.prototype.init = function () {
                this.$scope.$emit('stGlobalNavHide');
                this.jobId = this.$stateParams['jobId'];
                var parentCtrl = this.$scope.$parent['c'];
                if (parentCtrl && parentCtrl.model && parentCtrl.model.job) {
                    this.job = parentCtrl.model.job;
                }
                else if (this.jobFetchPromise) {
                    this.job = this.jobFetchPromise.data;
                }
                else {
                    this.$scope.$emit('stGlobalNavShow');
                    this.$state.go('add');
                }
            };
            JobPreview.prototype.switchToPcMode = function () {
                this.isPcMode = true;
            };
            JobPreview.prototype.switchToMobileMode = function () {
                this.isPcMode = false;
            };
            JobPreview.prototype.backToEdit = function () {
                this.$scope.$emit('notViewingPreview');
                this.$scope.$emit('stGlobalNavShow');
                if (this.jobId) {
                    this.$state.go('edit', { jobId: this.jobId });
                }
                else {
                    this.$state.go('add');
                }
            };
            JobPreview.prototype.confirmPublish = function () {
                var _this = this;
                var modal = this.stModal.modalConfirm({
                    title: '求人の作成・公開',
                    msg: '<ul>' + '<li>検索エンジン「スタンバイ」への掲載を準備させていただきます。求人は最大3営業日以内に掲載されます。</li>' + '<li>また、スタンバイへの掲載とは別に独自の求人ページが作成されます。貴社ウェブサイトの採用ページ等にご利用いただくことが可能です。</li>' + '<li>求人ページ上に表示される「会社情報」は、「公開企業プロフィール」ページで編集できます。</li>' + '<ul>' + '<br>続行してもよろしいですか？'
                });
                modal.result.then(function () {
                    _this.publishDefault();
                });
            };
            JobPreview.prototype.publishDefault = function () {
                if (this.job.noEndDate) {
                    this.job.closeAt = null;
                }
                if (this.job.closeAt) {
                    var closeDate = new Date(this.job.closeAt);
                    this.job.closeAt = closeDate.toISOString();
                }
                ;
                if (this.job.content.salary.unit === "NOP" || this.job.content.salary.unit === "NEG") {
                    delete this.job.content.salary.amountTo;
                    delete this.job.content.salary.amountFrom;
                }
                this.job.jobStatus = 'PUB';
                var that = this;
                var ifNew = _.clone(this);
                var publish = function (jobId, job) {
                    that.routes.jobs.update(jobId, job).success(function (res) {
                        that.$scope.$emit('stGlobalNavShow');
                        that.stUtils.toastInfo("公開されました。反映されるまで数時間かかることがあります。「公開企業プロフィール」の設定もあわせてご確認ください");
                        that.$state.go('list');
                    });
                };
                if (!ifNew.job.id) {
                    ifNew.routes.jobs.create(ifNew.job).success(function (res) {
                        that.routes.jobs.detail(res.jobId).success(function (newJob) {
                            publish(newJob.id, newJob);
                        });
                    });
                }
                else {
                    publish(that.jobId, that.job);
                }
            };
            JobPreview.prototype.postToPcPreviewApi = function () {
                this.job.content.salary.amountTo = Number(String(this.job.content.salary.amountTo));
                this.job.content.salary.amountFrom = Number(String(this.job.content.salary.amountFrom));
                if (this.job.coverImage && !this.job.coverImage.imageId) {
                    delete this.job.coverImage;
                }
                return this.routes.jobs.previewAsPc(this.job);
            };
            JobPreview.prototype.postToMobilePreviewApi = function () {
                return this.routes.jobs.previewAsMobile(this.job);
            };
            return JobPreview;
        })();
        _job.JobPreview = JobPreview;
    })(job = controllers.job || (controllers.job = {}));
})(controllers || (controllers = {}));
var stanby;
(function (stanby) {
    var directives;
    (function (directives) {
        var jobs;
        (function (jobs) {
            var SALARY_UNIT_EXPR = 'ctrl.salaryUnit';
            var SALARY_UNIT_CTRL_EXPR = 'salaryUnit';
            var VALID_KEY_AMOUNT = 'salaryAmount';
            var VALID_KEY_FROM_REQUIRED = 'fromRequired';
            var VALID_KEY_AMOUNT_REVERSE = 'amountReversed';
            var YEN_AMOUNT_REGEX = /^\s*[0-9]+(,[0-9]{3})*\s*$/;
            var MANYEN_AMOUNT_REGEX = /^\s*[0-9]+(,[0-9]{3})*(\.[0-9]+)?\s*$/;
            var JobSalaryForm = (function () {
                function JobSalaryForm(enums, $element, $scope) {
                    this.enums = enums;
                    this.$element = $element;
                    this.$scope = $scope;
                    this.ngModel = $element.controller('ngModel');
                    this.registerModelValueFormatter();
                    this.initNgModelSync();
                }
                JobSalaryForm.prototype.isAmountRequired = function () {
                    var unitEnum = this.enums.salaryUnitEnum;
                    return !(this.salaryUnit == unitEnum.Negotiable.code || this.salaryUnit == unitEnum.NotOpen.code || this.salaryUnit == null);
                };
                JobSalaryForm.prototype.isManyenUnit = function () {
                    var unitEnum = this.enums.salaryUnitEnum;
                    return (this.salaryUnit == unitEnum.Monthly.code || this.salaryUnit == unitEnum.Yearly.code);
                };
                JobSalaryForm.prototype.registerModelValueFormatter = function () {
                    var _this = this;
                    this.ngModel.$formatters.push(function (obj) {
                        if (obj != null) {
                            _this.$scope.ctrl.salaryUnit = obj.unit;
                            _this.$scope.ctrl.amountFrom = obj.amountFrom;
                            _this.$scope.ctrl.amountTo = obj.amountTo;
                            _this.$scope.ctrl.supplement = obj.supplement;
                        }
                        else {
                            _this.$scope.ctrl.salaryUnit = _this.enums.salaryUnitEnum.Monthly.code;
                            _this.$scope.ctrl.amountFrom = null;
                            _this.$scope.ctrl.amountTo = null;
                            _this.$scope.ctrl.supplement = null;
                        }
                    });
                };
                JobSalaryForm.prototype.initNgModelSync = function () {
                    var _this = this;
                    this.$scope.$watchCollection(function () {
                        return [_this.salaryUnit, _this.amountFrom, _this.amountTo, _this.supplement];
                    }, function (newVal) {
                        _this.checkOverallValidity();
                        _this.syncWithSalaryObjectNgModel();
                    });
                };
                JobSalaryForm.prototype.checkOverallValidity = function () {
                    var salaryForm = this.$scope.salaryForm;
                    var salaryUnitController = salaryForm[SALARY_UNIT_CTRL_EXPR];
                    salaryForm.$setValidity(VALID_KEY_FROM_REQUIRED, true, salaryUnitController);
                    salaryForm.$setValidity(VALID_KEY_AMOUNT_REVERSE, true, salaryUnitController);
                    if (this.isAmountRequired()) {
                        if (this.amountFrom == null) {
                            salaryForm.$setValidity(VALID_KEY_FROM_REQUIRED, false, salaryUnitController);
                        }
                        else if (this.amountTo != null && this.amountFrom > this.amountTo) {
                            salaryForm.$setValidity(VALID_KEY_AMOUNT_REVERSE, false, salaryUnitController);
                        }
                    }
                };
                JobSalaryForm.prototype.syncWithSalaryObjectNgModel = function () {
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
                    if (initFlg) {
                        this.$scope.$parent.form.$setPristine();
                    }
                };
                return JobSalaryForm;
            })();
            jobs.JobSalaryForm = JobSalaryForm;
            function initJobDirectives() {
                angular.module('stanbyDirectives').controller('JobSalaryFormCtrl', directives.jobs.JobSalaryForm).directive('stJobSalaryForm', function () {
                    return {
                        restrict: 'E',
                        replace: true,
                        require: 'ngModel',
                        scope: true,
                        templateUrl: '/internal/parts/jobs/salary-form',
                        link: function (scope, element, attrs) {
                            if ($(element).attr('required') == 'required') {
                                scope.required = true;
                            }
                        },
                        controller: 'JobSalaryFormCtrl as ctrl'
                    };
                }).directive('stSalaryAmountInput', function ($filter, enums) {
                    return {
                        restrict: 'A',
                        require: 'ngModel',
                        link: function (scope, iElem, iAttr, ngModel) {
                            var unitEnum = enums.salaryUnitEnum;
                            var isNoAmountUnit = function (unit) {
                                return (unit == unitEnum.Negotiable.code || unit == unitEnum.NotOpen.code);
                            };
                            var isYenAmountUnit = function (unit) {
                                return (unit == unitEnum.Hourly.code || unit == unitEnum.Daily.code);
                            };
                            var isManyenAmountUnit = function (unit) {
                                return (unit == unitEnum.Monthly.code || unit == unitEnum.Yearly.code);
                            };
                            initUnitWatching();
                            ngModel.$formatters.push(formatModelValue);
                            ngModel.$parsers.push(parseViewValue);
                            function initUnitWatching() {
                                scope.$watch(SALARY_UNIT_EXPR, function (newVal, oldVal) {
                                    if (!oldVal)
                                        return;
                                    if (isNoAmountUnit(newVal) || (isYenAmountUnit(newVal) && isManyenAmountUnit(oldVal)) || (isManyenAmountUnit(newVal) && isYenAmountUnit(oldVal))) {
                                        ngModel.$setViewValue(null);
                                        iElem.val(null);
                                    }
                                });
                            }
                            function formatModelValue(modelValue) {
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
                            function parseViewValue(viewValue) {
                                var unitCode = scope.$eval(SALARY_UNIT_EXPR);
                                if (viewValue == null || viewValue.trim().length == 0 || isNoAmountUnit(unitCode)) {
                                    ngModel.$setValidity(VALID_KEY_AMOUNT, true);
                                    return null;
                                }
                                var normalizedStr;
                                var normalized;
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
                    };
                });
            }
            jobs.initJobDirectives = initJobDirectives;
        })(jobs = directives.jobs || (directives.jobs = {}));
    })(directives = stanby.directives || (stanby.directives = {}));
})(stanby || (stanby = {}));
var stanby;
(function (stanby) {
    var routing;
    (function (routing) {
        var jobs;
        (function (jobs) {
            function initRouting() {
                angular.module('stanbyControllers').controller('JobListCtrl', controllers.job.JobList).controller('JobAddCtrl', controllers.job.JobAdd).controller('JobEditCtrl', controllers.job.JobEdit).controller('JobPreviewCtrl', controllers.job.JobPreview).config(function ($stateProvider, $urlRouterProvider, enums) {
                    $urlRouterProvider.otherwise('/');
                    $stateProvider.state('list', {
                        url: '/',
                        templateUrl: '/internal/controllers/jobs/list',
                        controller: 'JobListCtrl as c',
                        roles: [enums.userRole.ADM.code, enums.userRole.REC.code],
                        onEnter: function ($rootScope) {
                            $rootScope.$emit('breadcrumbs', [
                                { url: '/', text: 'Stanby Recruiting' },
                                { url: '', text: '求人' }
                            ]);
                        }
                    }).state('add', {
                        url: '/add?copySourceId',
                        templateUrl: '/internal/controllers/jobs/add',
                        controller: 'JobAddCtrl as c',
                        roles: [enums.userRole.ADM.code, enums.userRole.REC.code],
                        resolve: {
                            jobFetchPromise: function ($stateParams, routes) {
                                return null;
                            },
                            copySourcePromise: function ($stateParams, routes) {
                                var copySourceId = $stateParams['copySourceId'];
                                if (copySourceId) {
                                    return routes.jobs.detail(copySourceId);
                                }
                                else {
                                    return null;
                                }
                            },
                            config: function (stbConfig) {
                                return stbConfig.getConfigPromise();
                            }
                        },
                        onEnter: function ($rootScope) {
                            $rootScope.$emit('breadcrumbs', [
                                { url: '/', text: 'Stanby Recruiting' },
                                { url: '/jobs#/', text: '求人' },
                                { url: '', text: '新しい求人を作成' }
                            ]);
                        }
                    }).state('edit', {
                        url: '/:jobId/edit/:applicationId',
                        templateUrl: '/internal/controllers/jobs/edit',
                        controller: 'JobEditCtrl as c',
                        roles: [enums.userRole.ADM.code, enums.userRole.REC.code],
                        resolve: {
                            jobFetchPromise: function ($stateParams, routes) {
                                var jobId = $stateParams['jobId'];
                                return routes.jobs.detail(jobId).success(function (job) {
                                    return job;
                                });
                            },
                            accountPromise: function (routes) {
                                return routes.account.getAccountInfo();
                            },
                            config: function (stbConfig) {
                                return stbConfig.getConfigPromise();
                            }
                        },
                        onEnter: function ($rootScope, jobFetchPromise) {
                            var job = jobFetchPromise.data;
                            $rootScope.$emit('breadcrumbs', [
                                { url: '/', text: 'Stanby Recruiting' },
                                { url: '/jobs#/', text: '求人' },
                                { url: '', text: job.name }
                            ]);
                        }
                    }).state('add.preview', {
                        templateUrl: '/internal/controllers/jobs/preview',
                        controller: 'JobPreviewCtrl as c',
                        roles: [enums.userRole.ADM.code, enums.userRole.REC.code]
                    }).state('edit.preview', {
                        templateUrl: '/internal/controllers/jobs/preview',
                        controller: 'JobPreviewCtrl as c',
                        roles: [enums.userRole.ADM.code, enums.userRole.REC.code]
                    });
                });
            }
            jobs.initRouting = initRouting;
        })(jobs = routing.jobs || (routing.jobs = {}));
    })(routing = stanby.routing || (stanby.routing = {}));
})(stanby || (stanby = {}));

stanby.routing.imagepopup.initRouting();
stanby.routing.jobcommon.initRouting();
stanby.directives.jobs.initJobDirectives();
stanby.routing.jobs.initRouting();

//# sourceMappingURL=../scripts/job-page.js.map