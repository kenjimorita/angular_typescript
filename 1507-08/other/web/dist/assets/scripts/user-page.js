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

var controllers;
(function (controllers) {
    var users;
    (function (users) {
        var corp;
        (function (corp) {
            var UserCorp = (function () {
                function UserCorp($scope, $state, stModal, stUtils, routes) {
                    this.$scope = $scope;
                    this.$state = $state;
                    this.stModal = stModal;
                    this.stUtils = stUtils;
                    this.routes = routes;
                }
                UserCorp.prototype.init = function () {
                    var _this = this;
                    this.routes.corporate.show().success(function (data) {
                        _this.corpInfo = {
                            name: data.name,
                            nameKana: data.nameKana,
                            phone: data.phone,
                            phoneType: data.phoneType,
                            postalCode: data.postalCode,
                            address: data.address,
                            versionNo: data.versionNo,
                            updatedBy: data.updatedBy,
                            updatedAt: data.updatedAt,
                            details: data.details
                        };
                    });
                };
                UserCorp.prototype.validateForm = function (form) {
                    var errArr = [];
                    var maxLength = function (entry, length) {
                        if (entry.length > length) {
                            return false;
                        }
                    };
                    if (maxLength(form.details.contact.name, 50) == false)
                        errArr.push("担当者・部署が長すぎます" + form.details.contact.name.length);
                    if (maxLength(form.details.contact.email, 100) == false)
                        errArr.push("お問い合わせ用メールアドレスが長すぎます");
                    if (maxLength(form.details.contact.phone, 25) == false)
                        errArr.push("お問い合わせ用電話番号が長すぎます");
                    if (maxLength(form.name, 100) == false)
                        errArr.push("企業名が長すぎます");
                    var currentYear = new Date().getFullYear();
                    if (!_.isEmpty(form.details.establishedAt)) {
                        if (form.details.establishedAt.year && (Number(form.details.establishedAt.year) < 1 || Number(form.details.establishedAt.year) > currentYear))
                            errArr.push("設立年をご確認ください。");
                        if (form.details.establishedAt.month && (Number(form.details.establishedAt.month) < 1 || Number(form.details.establishedAt.month) > 12))
                            errArr.push("設立月をご確認ください。");
                        if (form.details.establishedAt.month == "")
                            delete form.details.establishedAt.month;
                        if (form.details.establishedAt.year == "")
                            delete form.details.establishedAt.year;
                        if (form.details.establishedAt.month)
                            form.details.establishedAt.month = Number(form.details.establishedAt.month);
                        if (form.details.establishedAt.year)
                            form.details.establishedAt.year = Number(form.details.establishedAt.year);
                    }
                    ;
                    return errArr;
                };
                UserCorp.prototype.updateInfo = function (form) {
                    var _this = this;
                    var proceed = this.stModal.modalConfirm({
                        msg: '編集内容を保存します。続行しますか？'
                    });
                    proceed.result.then(function () {
                        var errList = _this.validateForm(_this.corpInfo);
                        if (!_.isEmpty(errList)) {
                            _this.stUtils.toastDanger(errList.join('<br/>'));
                            return;
                        }
                        _this.routes.corporate.update(_this.corpInfo).success(function (data) {
                            _this.stUtils.toastInfo("更新しました。");
                            _this.$state.go('corpInfo');
                        }).error(function (data) {
                            _this.stUtils.toastDanger("更新失敗しました。");
                        });
                    });
                };
                return UserCorp;
            })();
            corp.UserCorp = UserCorp;
        })(corp = users.corp || (users.corp = {}));
    })(users = controllers.users || (controllers.users = {}));
})(controllers || (controllers = {}));

var stanby;
(function (stanby) {
    var services;
    (function (services) {
        var users;
        (function (users) {
            var UserAccountsService = (function () {
                function UserAccountsService(routes, $q, stUtils, $state) {
                    this.routes = routes;
                    this.$q = $q;
                    this.stUtils = stUtils;
                    this.$state = $state;
                }
                UserAccountsService.prototype.getUser = function (userId) {
                    var defer = this.$q.defer();
                    var model;
                    this.routes.users.details(userId).success(function (data) {
                        model = {
                            email: data.corpUser.email,
                            currentEmail: data.corpUser.email,
                            fullName: data.corpUser.fullName,
                            status: data.corpUser.status.code,
                            title: data.corpUser.title,
                            versionNo: data.corpUser.versionNo,
                            roles: data.roles.map(function (r) { return r.role; }),
                            roleVersionNo: data.roles[0].versionNo
                        };
                        defer.resolve(model);
                    });
                    return defer.promise;
                };
                UserAccountsService.prototype.create = function (user) {
                    var _this = this;
                    var defer = this.$q.defer();
                    var promise = defer.promise;
                    this.isEmailUnique(user.email).then(function () {
                        _this.doCreate(user).then(function () {
                            defer.resolve();
                        }, function (xhr) {
                            defer.reject(xhr);
                        });
                    }, function (xhr) {
                        defer.reject(xhr);
                    });
                    return promise;
                };
                UserAccountsService.prototype.save = function (userId, user, emailUpdated) {
                    var _this = this;
                    var defer = this.$q.defer();
                    var promise = defer.promise;
                    if (emailUpdated) {
                        this.isEmailUniqueForUpdate(user.email, user.currentEmail).then(function () {
                            _this.doUpdate(userId, user).then(function () {
                                defer.resolve();
                            }, function (xhr) {
                                defer.reject(xhr);
                            });
                        }, function (xhr) {
                            var errList = [];
                            errList.push("すでに使用されているメールアドレスです");
                            _this.stUtils.toastDanger(errList.join('<br/>'));
                            defer.reject(errList);
                        });
                    }
                    else {
                        this.doUpdate(userId, user).then(function () {
                            defer.resolve();
                        }, function (xhr) {
                            defer.reject(xhr);
                        });
                    }
                    return promise;
                };
                UserAccountsService.prototype.saveUserStatus = function (userId, data) {
                    var defer = this.$q.defer();
                    var promise = defer.promise;
                    this.routes.users.updateStatus(userId, data).success(function () {
                        defer.resolve();
                    }).error(function (xhr) {
                        defer.reject(xhr);
                    });
                    return promise;
                };
                UserAccountsService.prototype.doCreate = function (user) {
                    var defer = this.$q.defer();
                    this.routes.users.create(user).success(function () {
                        defer.resolve();
                    }).error(function (xhr) {
                        defer.reject(xhr);
                    });
                    return defer.promise;
                };
                UserAccountsService.prototype.doUpdate = function (userId, user) {
                    var defer = this.$q.defer();
                    this.routes.users.update(userId, user).success(function (data) {
                        defer.resolve();
                    }).error(function (xhr) {
                        defer.reject(xhr);
                    });
                    return defer.promise;
                };
                UserAccountsService.prototype.isEmailUnique = function (email) {
                    var defer = this.$q.defer();
                    this.routes.validation.emailDuplicate(email).success(function (data) {
                        defer.resolve();
                    }).error(function (xhr) {
                        defer.reject(xhr);
                    });
                    return defer.promise;
                };
                UserAccountsService.prototype.isEmailUniqueForUpdate = function (newEmail, currentEmail) {
                    var defer = this.$q.defer();
                    this.routes.validation.emailDuplicateForUpdate(newEmail, currentEmail).success(function (data) {
                        defer.resolve();
                    }).error(function (xhr) {
                        defer.reject(xhr);
                    });
                    return defer.promise;
                };
                return UserAccountsService;
            })();
            users.UserAccountsService = UserAccountsService;
            function initUserAccountsService() {
                angular.module('stanby').service('usersAccountService', ['routes', '$q', 'stUtils', '$state', function (routes, $q, stUtils, $state) {
                    return new stanby.services.users.UserAccountsService(routes, $q, stUtils, $state);
                }]);
            }
            users.initUserAccountsService = initUserAccountsService;
        })(users = services.users || (services.users = {}));
    })(services = stanby.services || (stanby.services = {}));
})(stanby || (stanby = {}));

var controllers;
(function (controllers) {
    var users;
    (function (users) {
        var create;
        (function (create) {
            var UserCreate = (function () {
                function UserCreate(enums, $scope, _, stModal, stUtils, $state, usersAccountService) {
                    this.enums = enums;
                    this.$scope = $scope;
                    this._ = _;
                    this.stModal = stModal;
                    this.stUtils = stUtils;
                    this.$state = $state;
                    this.usersAccountService = usersAccountService;
                    this.isEnabled = true;
                    this.disableButton = false;
                    this.model = {
                        email: "",
                        fullName: "",
                        password: "",
                        status: "ENA",
                        roles: [],
                        currentEmail: "fake@dummy.com"
                    };
                    this.heading = 'ユーザー情報の追加';
                    this.allRoles = _.keys(this.enums.userRole);
                    this.allStatus = _.keys(this.enums.userStatus);
                    this.roles = _.keys(this.enums.userRole);
                    this.$roles = $('#user-roles');
                    this.display = false;
                }
                UserCreate.prototype.updateRole = function (role, checked) {
                    if (checked) {
                        this.roles.push(role);
                    }
                    else {
                        this.roles = _.without(this.roles, role);
                    }
                    this.$scope.form1.$setDirty();
                };
                UserCreate.prototype.save = function (form) {
                    var _this = this;
                    this.disableButton = true;
                    this.setData(form);
                    var modal = this.stModal.modalConfirm({
                        msg: 'ユーザーを追加します。続行しますか？'
                    });
                    modal.result.then(function () {
                        _this.usersAccountService.create(_this.model).then(function () {
                            _this.stUtils.withUpdateOkMessage(function () {
                                _this.$state.transitionTo('list');
                            });
                        }, function (xhr) {
                            if (xhr.key == 'error.profile.emailDuplication') {
                                _this.stUtils.toastDanger('すでに使用されているメールアドレスです');
                            }
                            else {
                                _this.stUtils.toastDanger('ユーザーの追加に失敗しました。画面を再読み込みして最新の状態を確認してください。');
                            }
                        });
                    });
                };
                UserCreate.prototype.tooltip = function (role) {
                    if (role) {
                        return this.enums.userRole[role].desc;
                    }
                    return "";
                };
                UserCreate.prototype.setData = function (form) {
                    this.model.password = this.newPassword;
                    this.model.roles = this.roles;
                };
                return UserCreate;
            })();
            create.UserCreate = UserCreate;
        })(create = users.create || (users.create = {}));
    })(users = controllers.users || (controllers.users = {}));
})(controllers || (controllers = {}));

var controllers;
(function (controllers) {
    var users;
    (function (users) {
        var edit;
        (function (edit) {
            var UserEdit = (function () {
                function UserEdit(enums, $scope, _, stModal, stUtils, $state, $stateParams, stbUser, usersAccountService) {
                    this.enums = enums;
                    this.$scope = $scope;
                    this._ = _;
                    this.stModal = stModal;
                    this.stUtils = stUtils;
                    this.$state = $state;
                    this.$stateParams = $stateParams;
                    this.stbUser = stbUser;
                    this.usersAccountService = usersAccountService;
                    this.dummyPassword = "dummypassword";
                    this.newPassword = this.dummyPassword;
                    this.heading = "ユーザー情報の編集";
                    this.userId = this.$stateParams.userId;
                    var self = this;
                    usersAccountService.getUser(self.$stateParams.userId).then(function (modelResponse) {
                        self.model = modelResponse;
                        self.display = true;
                        stbUser.getAccountInfo(function (response) {
                            self.isDisableStatusChange = response.account.userId == self.userId || enums.userStatus[self.model.status] === enums.userStatus.REG;
                        });
                        if (enums.userStatus[self.model.status] === enums.userStatus.DIS) {
                            self.statusButtonName = "ステータスを有効にする";
                        }
                        else {
                            self.statusButtonName = "ステータスを無効にする";
                        }
                        self.isEnabled = enums.userStatus[self.model.status] === enums.userStatus.ENA;
                        self.allRoles = _.keys(enums.userRole);
                        self.allStatus = _.keys(enums.userStatus);
                        self.roles = self.model.roles;
                        self.$roles = $('#user-roles');
                    });
                    $scope.$on('$destroy', this.destroy);
                }
                UserEdit.prototype.destroy = function () {
                };
                UserEdit.prototype.updateRole = function (role, checked) {
                    if (checked) {
                        this.roles.push(role);
                    }
                    else {
                        this.roles = _.without(this.roles, role);
                    }
                    this.$scope.form1.$setDirty();
                };
                UserEdit.prototype.save = function (form) {
                    var _this = this;
                    var modal = this.stModal.modalConfirm({
                        title: '編集内容を保存します。続行しますか？',
                        msg: '対象のユーザーが現在ログイン中の場合、編集した内容はそのユーザーが次回ログインした時から反映されます。）'
                    });
                    modal.result.then(function () {
                        _this.setData(form);
                        _this.usersAccountService.save(_this.$stateParams.userId, _this.model, form.email.$dirty).then(function () {
                            _this.stUtils.withUpdateOkMessage(function () {
                                _this.$state.transitionTo('list');
                            });
                        }, function (xhr) {
                            if (xhr.key == 'error.user.role.cannotDropAdminRole') {
                                _this.stUtils.toastDanger('ログインユーザー自身の管理者権限を外すことはできません');
                            }
                            else {
                                _this.stUtils.toastDanger('ユーザーの更新に失敗しました。画面を再読み込みして最新の状態を確認してください。');
                            }
                        });
                    });
                };
                UserEdit.prototype.saveUserStatus = function (form) {
                    var _this = this;
                    var statusName = this.enums.userStatus.ENA;
                    if (this.enums.userStatus[this.model.status] === this.enums.userStatus.ENA) {
                        statusName = this.enums.userStatus.DIS;
                    }
                    var modal = this.stModal.modalConfirm({
                        msg: 'ステータスを' + statusName + 'に変更します。続行しますか？'
                    });
                    modal.result.then(function () {
                        _this.setData(form);
                        _this.usersAccountService.saveUserStatus(_this.$stateParams.userId, { status: _this.model.status, versionNo: _this.model.versionNo }).then(function () {
                            _this.stUtils.withUpdateOkMessage(function () {
                                _this.$state.transitionTo('list');
                            });
                        }, function (xhr) {
                            _this.stUtils.toastDanger('ユーザーの更新に失敗しました。画面を再読み込みして最新の状態を確認してください。');
                        });
                    });
                };
                UserEdit.prototype.tooltip = function (role) {
                    if (role) {
                        return this.enums.userRole[role].desc;
                    }
                    return "";
                };
                UserEdit.prototype.setData = function (form) {
                    if (form.newPassword.$dirty && this.newPassword != this.dummyPassword) {
                        this.model.password = this.newPassword;
                    }
                    this.model.roles = this.roles;
                };
                return UserEdit;
            })();
            edit.UserEdit = UserEdit;
        })(edit = users.edit || (users.edit = {}));
    })(users = controllers.users || (controllers.users = {}));
})(controllers || (controllers = {}));

var controllers;
(function (controllers) {
    var users;
    (function (users) {
        var list;
        (function (list) {
            var UserList = (function () {
                function UserList(enums, routes, $scope) {
                    this.enums = enums;
                    this.routes = routes;
                    this.$scope = $scope;
                    this.searchParam = '';
                    this.isFiltered = true;
                }
                UserList.prototype.init = function () {
                    var _this = this;
                    this.routes.users.list(status, '').success(function (data) {
                        _this.users = data.users;
                        _this.usersForView = _this.users;
                        _this.watchSearchParam();
                    });
                };
                UserList.prototype.watchSearchParam = function () {
                    var _this = this;
                    this.$scope.$watch(function () {
                        return _this.searchParam;
                    }, function (newValue, oldValue) {
                        _this.filterBySearch(newValue);
                    });
                };
                UserList.prototype.filterBySearch = function (searchParam) {
                    this.usersForView = _.filter(this.users, function (user) {
                        var regex = new RegExp(searchParam);
                        if (regex.test(user.fullName) || regex.test(user.email) || regex.test(user.title)) {
                            return user;
                        }
                    });
                };
                UserList.prototype.filter = function () {
                    var _this = this;
                    this.isFiltered = !this.isFiltered;
                    this.status = this.isFiltered ? null : "DIS";
                    this.routes.users.list(this.status, '').success(function (data) {
                        _this.usersForView = data.users;
                    });
                };
                UserList.prototype.hasRole = function (roles, checkString) {
                    return _.contains(roles, checkString);
                };
                return UserList;
            })();
            list.UserList = UserList;
        })(list = users.list || (users.list = {}));
    })(users = controllers.users || (controllers.users = {}));
})(controllers || (controllers = {}));

var stanby;
(function (stanby) {
    var page;
    (function (page) {
        var users;
        (function (users) {
            var usersCtrl = controllers.users;
            function initPage() {
                angular.module('stanbyControllers').controller('UserListCtrl', usersCtrl.list.UserList).controller('UserEditCtrl', usersCtrl.edit.UserEdit).controller('UserCreateCtrl', usersCtrl.create.UserCreate).controller('UserCorpCtrl', usersCtrl.corp.UserCorp).config(function ($stateProvider, $urlRouterProvider) {
                    $urlRouterProvider.otherwise('/');
                    $stateProvider.state('list', {
                        url: '/',
                        templateUrl: '/templates/users/list.html',
                        controller: 'UserListCtrl as c',
                        onEnter: function ($rootScope) {
                            $rootScope.$emit('breadcrumbs', [
                                { url: '/', text: 'Stanby Recruiting' },
                                { url: '', text: 'アカウント管理' }
                            ]);
                        }
                    }).state('create', {
                        url: '/create',
                        templateUrl: '/templates/users/edit.html',
                        controller: 'UserCreateCtrl as c',
                        onEnter: function ($rootScope) {
                            $rootScope.$emit('breadcrumbs', [
                                { url: '/', text: 'Stanby Recruiting' },
                                { url: '/users#/', text: 'アカウント管理' },
                                { url: '', text: 'ユーザー情報の追加' }
                            ]);
                        }
                    }).state('edit', {
                        url: '/:userId/edit',
                        templateUrl: '/templates/users/edit.html',
                        controller: 'UserEditCtrl as c',
                        resolve: {
                            userPromise: function ($stateParams, routes) {
                                var userId = $stateParams['userId'];
                                return routes.users.details(userId);
                            }
                        },
                        onEnter: function ($rootScope) {
                            $rootScope.$emit('breadcrumbs', [
                                { url: '/', text: 'Stanby Recruiting' },
                                { url: '/users#/', text: 'アカウント管理' },
                                { url: '', text: 'ユーザー情報の編集' }
                            ]);
                        }
                    }).state('corpInfo', {
                        url: '/corpInfo',
                        templateUrl: 'templates/users/corpInfo.html',
                        controller: 'UserCorpCtrl as c',
                        onEnter: function ($rootScope) {
                            $rootScope.$emit('breadcrumbs', [
                                { url: '/', text: 'Stanby Recruiting' },
                                { url: '/users#/', text: 'アカウント管理' },
                                { url: '', text: '企業アカウント' }
                            ]);
                        }
                    }).state('corpEdit', {
                        url: '/corpEdit',
                        templateUrl: 'templates/users/corpEdit.html',
                        controller: 'UserCorpCtrl as c',
                        onEnter: function ($rootScope) {
                            $rootScope.$emit('breadcrumbs', [
                                { url: '/', text: 'Stanby Recruiting' },
                                { url: '/users#/', text: 'アカウント管理' },
                                { url: '/users#/corpInfo', text: '企業アカウント' },
                                { url: '', text: '企業アカウントの編集' }
                            ]);
                        }
                    });
                });
            }
            users.initPage = initPage;
        })(users = page.users || (page.users = {}));
    })(page = stanby.page || (stanby.page = {}));
})(stanby || (stanby = {}));
stanby.page.users.initPage();
stanby.directives.users.inputs.initFormInputs();
stanby.services.users.initUserAccountsService();

//# sourceMappingURL=../scripts/user-page.js.map