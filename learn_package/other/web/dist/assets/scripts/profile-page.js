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
    var profile;
    (function (profile) {
        var Profile = (function () {
            function Profile(enums, routes, stUtils, profilePromise, $scope) {
                var _this = this;
                this.enums = enums;
                this.routes = routes;
                this.stUtils = stUtils;
                this.profilePromise = profilePromise;
                $scope.enums = this.enums;
                $scope.routes = this.routes;
                $scope.init = function () {
                    $scope.profile = profilePromise.data.corpUser;
                    $scope.roles = _.pluck(profilePromise.data.roles, 'role');
                };
                $scope.resendConfirmation = function () {
                    _this.routes.profile.resendConfirmation().success(function () {
                        _this.stUtils.toastInfo('認証メールを再送しました。');
                    }).error(function () {
                        _this.stUtils.toastDanger('認証メールの再送に失敗しました。');
                    });
                };
            }
            return Profile;
        })();
        profile.Profile = Profile;
        var Password = (function () {
            function Password($scope, $state, stUtils, routes) {
                $scope.init = function () {
                    $scope.password = {
                        password: null,
                        newPassword: null,
                        newPasswordConfirm: null
                    };
                };
                $scope.update = function (form) {
                    if (form.$valid) {
                        routes.profile.changePassword($scope.password).success(function (data) {
                            stUtils.toastInfo('パスワードを変更しました。');
                            $state.transitionTo("profile");
                        }).error(function (xhr) {
                            if (xhr.key == 'auth.signup.currentPasswordNotMatch') {
                                stUtils.toastDanger('現在のパスワードが間違っています。');
                                $scope.password = null;
                            }
                            else if (xhr.key == 'auth.password.invalidFormat') {
                                stUtils.toastDanger(xhr.msg);
                                $scope.password = null;
                            }
                        });
                    }
                };
            }
            return Password;
        })();
        profile.Password = Password;
        var Email = (function () {
            function Email($scope, $state, stUtils, routes, _) {
                $scope.init = function () {
                    $scope.email = "";
                };
                $scope.update = function (form) {
                    if (form.$valid) {
                        routes.profile.changeEmail({ email: $scope.email }).success(function (data) {
                            stUtils.withUpdateOkMessage(function () {
                                $state.transitionTo("profile");
                            });
                        }).error(function (xhr) {
                            var errList = xhr['details']['email'];
                            var duplicateError = _.find(errList, { 'key': 'error.profile.emailDuplication' });
                            if (duplicateError) {
                                stUtils.toastDanger('すでに使用されているメールアドレスです。');
                            }
                        });
                    }
                    else {
                        stUtils.toastDanger("入力エラーがあります");
                    }
                };
            }
            return Email;
        })();
        profile.Email = Email;
        var BasicInfo = (function () {
            function BasicInfo($scope, $state, stModal, stUtils, routes) {
                $scope.init = function () {
                    routes.profile.show().success(function (data) {
                        $scope.profile = data;
                    });
                };
                $scope.update = function (form) {
                    var modal = stModal.modalConfirm({
                        msg: '変更を保存します。よろしいですか？'
                    });
                    if (form.$valid) {
                        modal.result.then(function () {
                            if (!$scope.profile.title) {
                                $scope.profile.title = null;
                            }
                            var data = {
                                fullName: $scope.profile.fullName,
                                title: $scope.profile.title
                            };
                            routes.profile.update(data).success(function (data) {
                                stUtils.withUpdateOkMessage(function () {
                                    $state.transitionTo("profile");
                                });
                            });
                        });
                    }
                };
            }
            return BasicInfo;
        })();
        profile.BasicInfo = BasicInfo;
    })(profile = controllers.profile || (controllers.profile = {}));
})(controllers || (controllers = {}));
var stanby;
(function (stanby) {
    var routing;
    (function (routing) {
        var profile;
        (function (profile) {
            function initRouting() {
                angular.module('stanbyControllers').config(function ($stateProvider, $urlRouterProvider) {
                    $urlRouterProvider.otherwise('/');
                    $stateProvider.state('profile', {
                        url: '/',
                        templateUrl: '/internal/profile/show.html',
                        controller: 'ProfileCtrl as pc',
                        resolve: {
                            accountPromise: function (routes) {
                                return routes.account.getAccountInfo();
                            },
                            profilePromise: function (routes) {
                                return routes.users.loginUserDetails();
                            }
                        },
                        onEnter: function ($rootScope) {
                            $rootScope.$emit('breadcrumbs', [
                                { url: '/', text: 'Stanby Recruiting' },
                                { url: '', text: 'アカウント設定' }
                            ]);
                        }
                    }).state('profile_change_basic', {
                        url: '/basic',
                        templateUrl: '/internal/profile/edit.html',
                        controller: 'BasicInfoCtrl as bic',
                        onEnter: function ($rootScope) {
                            $rootScope.$emit('breadcrumbs', [
                                { url: '/', text: 'Stanby Recruiting' },
                                { url: '/profile#/', text: 'アカウント設定' },
                                { url: '', text: 'アカウント情報の編集' }
                            ]);
                        }
                    }).state('profile_change_password', {
                        url: '/password',
                        templateUrl: '/internal/profile/password.html',
                        controller: 'PasswordCtrl as pc',
                        onEnter: function ($rootScope) {
                            $rootScope.$emit('breadcrumbs', [
                                { url: '/', text: 'Stanby Recruiting' },
                                { url: '/profile#/', text: 'アカウント設定' },
                                { url: '', text: 'パスワード変更' }
                            ]);
                        }
                    }).state('profile_change_email', {
                        url: '/email',
                        templateUrl: '/internal/profile/email.html',
                        controller: 'EmailCtrl as ec',
                        onEnter: function ($rootScope) {
                            $rootScope.$emit('breadcrumbs', [
                                { url: '/', text: 'Stanby Recruiting' },
                                { url: '/profile#/', text: 'アカウント設定' },
                                { url: '', text: 'メールアドレス変更' }
                            ]);
                        }
                    });
                }).controller('ProfileCtrl', controllers.profile.Profile).controller('BasicInfoCtrl', controllers.profile.BasicInfo).controller('PasswordCtrl', controllers.profile.Password).controller('EmailCtrl', controllers.profile.Email);
            }
            profile.initRouting = initRouting;
        })(profile = routing.profile || (routing.profile = {}));
    })(routing = stanby.routing || (stanby.routing = {}));
})(stanby || (stanby = {}));

stanby.routing.profile.initRouting();

//# sourceMappingURL=../scripts/profile-page.js.map