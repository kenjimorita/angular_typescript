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

var controllers;
(function (controllers) {
    var corporates;
    (function (corporates) {
        var CorporateProfileEdit = (function () {
            function CorporateProfileEdit(enums, $scope, $compile, stModal, stUtils, $location, $window, $state, routes, $timeout, stbImage, stbImagePopup, stbConfig, config, stStaticConfig) {
                this.enums = enums;
                this.$scope = $scope;
                this.$compile = $compile;
                this.stModal = stModal;
                this.stUtils = stUtils;
                this.$location = $location;
                this.$window = $window;
                this.$state = $state;
                this.routes = routes;
                this.$timeout = $timeout;
                this.stbImage = stbImage;
                this.stbImagePopup = stbImagePopup;
                this.stbConfig = stbConfig;
                this.config = config;
                this.stStaticConfig = stStaticConfig;
                this.flagFocusedMarkdown = false;
                this.isPreviewingMarkdown = false;
            }
            CorporateProfileEdit.prototype.init = function () {
                var _this = this;
                this.config = this.config.data;
                this.routes.corporatePublic.show().success(function (data) {
                    _this.corporate = data;
                    if (_this.corporate.logo) {
                        _this.logoImage = {
                            imageId: _this.corporate.logo.imageId,
                            prefix: _this.corporate.logo.prefix
                        };
                    }
                    if (!_this.corporate.content) {
                        _this.corporate.content = { descriptions: [] };
                    }
                });
            };
            CorporateProfileEdit.prototype.focusMarkdown = function () {
                this.flagFocusedMarkdown = true;
            };
            CorporateProfileEdit.prototype.uploadInlineImageToInsertText = function ($element, params) {
                var _this = params.this;
                _this.routes.images.uploadInline(params.form).success(function (res) {
                    var beforeText, afterText, text = $element.val(), urlImage = _this.stbImage.getFullImageUrl(_this.config, res.id, res.prefix), imageText = '![画像](' + urlImage + ' "画像")\n', position = $element[0].selectionStart;
                    if (!_this.flagFocusedMarkdown || position === text.length) {
                        position = 0;
                    }
                    if (position !== 0) {
                        imageText = '\n' + imageText;
                    }
                    beforeText = text.slice(0, position);
                    afterText = text.slice(position, text.length);
                    text = beforeText + imageText + afterText;
                    _this.corporate.content.markdownFreeText = text;
                }).error(function (err) {
                });
            };
            CorporateProfileEdit.prototype.addTdSet = function () {
                this.corporate.content.descriptions.push({ term: null, description: null });
            };
            CorporateProfileEdit.prototype.deleteTdSet = function (index) {
                this.corporate.content.descriptions.splice(index, 1);
                this.$scope.form1.$setDirty();
            };
            CorporateProfileEdit.prototype.validateTerm = function (formScope, mainVal, relationVal) {
                if (mainVal === null && relationVal === null) {
                    formScope.termDescDescription.$setDirty();
                    formScope.termDescTerm.$setDirty();
                }
                return (!mainVal && relationVal) ? false : true;
            };
            CorporateProfileEdit.prototype.saveDraft = function (form) {
                var _this = this;
                var modal = this.stModal.modalConfirm({
                    msg: '編集内容を保存します。続行しますか？'
                });
                modal.result.then(function () {
                    _this.trimTermDescItem(_this.corporate.content.descriptions);
                    _this.routes.corporatePublic.update(_this.corporate).success(function (data) {
                        _this.stUtils.withUpdateOkMessage(function () {
                        });
                        _this.$state.reload();
                        _this.corporate.versionNo += 1;
                        _this.$scope.form1.$setPristine();
                    });
                });
            };
            CorporateProfileEdit.prototype.trimTermDescItem = function (termDescItems) {
                var descItem;
                for (var i = 0; i < termDescItems.length; ++i) {
                    descItem = termDescItems[i];
                    if (!descItem.term && !descItem.description) {
                        termDescItems.splice(i, 1);
                        i -= 1;
                    }
                }
            };
            CorporateProfileEdit.prototype.editMarkdown = function () {
                this.isPreviewingMarkdown = false;
                this.$timeout(function () {
                    var $focusEl = $('.sg-form-markdown-textarea[name="markdownFreeText"]');
                    if ($focusEl.length === 1) {
                        $focusEl.focus();
                    }
                });
            };
            CorporateProfileEdit.prototype.previewHTML = function () {
                var _this = this;
                this.routes.utils.convertMarkdownToHtml(this.corporate.content.markdownFreeText).success(function (data) {
                    _this.corporate.htmlFreeText = data.htmlText;
                    _this.isPreviewingMarkdown = true;
                });
            };
            CorporateProfileEdit.prototype.showInlineImagePopup = function (textAreaId) {
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
                        that.corporate.content.markdownFreeText = text;
                        that.$scope.form1.$setDirty();
                    }
                });
            };
            CorporateProfileEdit.prototype.showCorporateImagePopup = function () {
                var _this = this;
                var initialImage = this.corporate.logoImage;
                this.stbImagePopup.showLogoImagePopup(initialImage, function (result) {
                    _this.corporate.logoImage = result;
                    _this.$scope.form1.$setDirty();
                });
            };
            CorporateProfileEdit.prototype.showCoverImagePopup = function () {
                var _this = this;
                var initialImage = this.corporate.coverImage;
                this.stbImagePopup.showCoverImagePopup(initialImage, function (result) {
                    _this.corporate.coverImage = result;
                    if (result) {
                        _this.coverImageUrl = _this.stbImage.getFullImageUrl(_this.config, result.imageId, result.prefix);
                    }
                    _this.$scope.form1.$setDirty();
                });
            };
            CorporateProfileEdit.prototype.showCoverInstruction = function () {
                var _this = this;
                var modal = this.stModal.modalConfirm({
                    title: 'カバー画像とは',
                    msg: '<p class="sg-modal-instruction sg-corporate-cover-instruction">「カバー画像」は、求人一覧ページで上部に掲載される画像です。<br>オフィスや職場の雰囲気が伝わる画像、会社の雰囲気がイメージしやすい画像を掲載することにより、求職者が求人に興味を持ちやすくなります。<ul class="sg-cover-list"><li>JPEG、PNG、GIFが登録可能な画像ファイルの形式です</li><li>画像ファイルの最大容量は5MB、最小サイズは横幅500px、縦幅200pxです</li></ul>',
                    okButton: 'カバー画像を変更する',
                    cancelButton: 'ウィンドウを閉じる'
                });
                modal.result.then(function () {
                    _this.showCoverImagePopup();
                });
            };
            CorporateProfileEdit.prototype.showLogoInstruction = function () {
                var _this = this;
                var modal = this.stModal.modalConfirm({
                    title: '企業ロゴとは',
                    msg: '<p class="sg-modal-instruction sg-corporate-logo-instruction">「企業ロゴ」は、求人一覧ページや求人詳細ページの上部に表示される企業やサービスのロゴ画像です。<br>企業ロゴが登録されていない場合は、会社名がテキストで表示されます。<ul class="sg-cover-list"><li>JPEG、PNG、GIFが登録可能な画像ファイルの形式です</li><li>画像ファイルの最大容量は5MB、最小サイズは横幅50px、縦幅50pxです</li></ul>',
                    okButton: '企業ロゴを変更する',
                    cancelButton: 'ウィンドウを閉じる'
                });
                modal.result.then(function () {
                    _this.showCorporateImagePopup();
                });
            };
            return CorporateProfileEdit;
        })();
        corporates.CorporateProfileEdit = CorporateProfileEdit;
    })(corporates = controllers.corporates || (controllers.corporates = {}));
})(controllers || (controllers = {}));
var stanby;
(function (stanby) {
    var routing;
    (function (routing) {
        var corporate;
        (function (corporate) {
            function initRouting() {
                angular.module('stanbyControllers').controller('CorporateEditCtrl', controllers.corporates.CorporateProfileEdit).config(function ($stateProvider, $urlRouterProvider, enums) {
                    $urlRouterProvider.otherwise('/edit');
                    $stateProvider.state('corporateEdit', {
                        url: '/edit',
                        templateUrl: '/templates/corporate/edit.html',
                        controller: 'CorporateEditCtrl as c',
                        roles: [enums.userRole.ADM.code, enums.userRole.REC.code],
                        resolve: {
                            config: function (stbConfig) {
                                return stbConfig.getConfigPromise();
                            }
                        },
                        onEnter: function ($rootScope) {
                            $rootScope.$emit('breadcrumbs', [
                                { url: '/', text: 'Stanby Recruiting' },
                                { url: '', text: '公開企業プロフィール' }
                            ]);
                        }
                    });
                });
            }
            corporate.initRouting = initRouting;
        })(corporate = routing.corporate || (routing.corporate = {}));
    })(routing = stanby.routing || (stanby.routing = {}));
})(stanby || (stanby = {}));

stanby.routing.imagepopup.initRouting();
stanby.routing.corporate.initRouting();

//# sourceMappingURL=../scripts/corporate-page.js.map