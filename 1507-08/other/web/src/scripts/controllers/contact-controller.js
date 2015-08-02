/// <reference path="../vendor_def/tsd.d.ts" />
/// <reference path="../services/common/routes.ts" />
var controllers;
(function (controllers) {
    var contact;
    (function (contact) {
        var ContactController = (function () {
            function ContactController(routes, stUtils) {
                this.routes = routes;
                this.stUtils = stUtils;
                this.sent = false;
            }
            ContactController.prototype.send = function () {
                var _this = this;
                this.routes.contact.send(this.email, this.inquiry)
                    .success(function (data) {
                    _this.sent = true;
                })
                    .error(function (data) {
                    _this.stUtils.toastDanger('通信に失敗しました。時間をおいて、再度お試しください。');
                });
            };
            return ContactController;
        })();
        contact.ContactController = ContactController;
    })(contact = controllers.contact || (controllers.contact = {}));
})(controllers || (controllers = {}));
var stanby;
(function (stanby) {
    var routing;
    (function (routing) {
        var contact;
        (function (contact) {
            function initRouting() {
                angular
                    .module('stanbyControllers')
                    .controller('ContactCtrl', controllers.contact.ContactController)
                    .config(function ($stateProvider, $urlRouterProvider) {
                    $urlRouterProvider.otherwise('');
                    $stateProvider.state('index', {
                        url: '',
                        templateUrl: '/templates/contact/index.html',
                        controller: 'ContactCtrl as c',
                        anonAllowed: true
                    });
                });
            }
            contact.initRouting = initRouting;
        })(contact = routing.contact || (routing.contact = {}));
    })(routing = stanby.routing || (stanby.routing = {}));
})(stanby || (stanby = {}));
