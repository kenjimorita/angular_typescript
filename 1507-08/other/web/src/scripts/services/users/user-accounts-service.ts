/// <reference path="../../vendor_def/tsd.d.ts" />
/// <reference path="../common/routes.ts" />
/// <reference path="../../directives/common/widgets.d.ts" />

/* tslint:disable:no-unused-variable */
import UserDetailResponse = stanby.models.users.UserDetailResponse;
import UserModel = stanby.models.users.UserModel;
import EmailValidationResponse = stanby.models.users.EmailValidationResponse;
/* tslint:enable */

module stanby.services.users {
    /**
     * Service class to handle User Accounts operations.
     */
    export class UserAccountsService {
        constructor(private routes:st.Routes,
                    private $q:ng.IQService,
                    private stUtils:std.Utils,
                    private $state:ng.ui.IStateService) {

        }

        /**
         * Fetch the user information from the server, returning a promise object with a UserModel
         * @param userId The userId to fetch a UserModel for
         * @returns {IPromise<UserModel>}
         */
        public getUser(userId:string):ng.IPromise<UserModel> {
            var defer = this.$q.defer();
            var model:UserModel;

            this.routes.users.details(userId).success((data:UserDetailResponse) => {
                model = {
                    email: data.corpUser.email,
                    currentEmail: data.corpUser.email,
                    fullName: data.corpUser.fullName,
                    status: data.corpUser.status.code,
                    title: data.corpUser.title,
                    versionNo: data.corpUser.versionNo,
                    roles: data.roles.map(r => r.role),
                    roleVersionNo: data.roles[0].versionNo
                }

                defer.resolve(model);
            });

            return defer.promise;
        }

        /**
         * Create a new user, will test for unique email address
         * @param user The new user to create
         */
        public create(user:UserModel):ng.IPromise<any> {
            var defer = this.$q.defer();
            var promise = defer.promise;

            this.isEmailUnique(user.email)
                .then(() => {
                    this.doCreate(user)
                        .then(() => {
                            defer.resolve();
                        }, (xhr) => {
                            defer.reject(xhr);
                        })
                }, (xhr) => {
                    defer.reject(xhr);
                });

            return promise;
        }

        /**
         * Save function to update a user.
         * @param userId The userId associated with the user
         * @param user The UserModel containing the updated user details
         * @param emailUpdated Flag to check for duplicate email addresses in the system
         * @returns {IPromise<T>} On success the promise object is empty, on error it contains a list of error messages
         */
        public save(userId:string, user:UserModel, emailUpdated:boolean):ng.IPromise<any> {
            var defer = this.$q.defer();
            var promise = defer.promise;

            // check if the email was updated and if it's unique
            if (emailUpdated) {
                this.isEmailUniqueForUpdate(user.email, user.currentEmail)
                    .then(() => {
                        this.doUpdate(userId, user)
                            .then(() => {
                                defer.resolve()
                            }, (xhr) => {
                                defer.reject(xhr)
                            });
                    }, (xhr) => {
                        var errList = [];
                        errList.push("すでに使用されているメールアドレスです");
                        this.stUtils.toastDanger(errList.join('<br/>'));
                        defer.reject(errList);
                    })
            }
            else {
                this.doUpdate(userId, user)
                    .then(() => {
                        defer.resolve();
                    }, (xhr) => {
                        defer.reject(xhr);
                    });
            }

            return promise;
        }

        /**
         * Update the user's enabled/disabled status
         * @param userId The user to update
         * @param data An object containing {status, versionNo}
         * @returns {IPromise<T>}  On success the promise object is empty, on error it contains a list of error messages
         */
        public saveUserStatus(userId:string, data:any):ng.IPromise<any> {
            var defer = this.$q.defer();
            var promise = defer.promise;

            this.routes.users.updateStatus(userId, data)
                .success(() => {
                    defer.resolve();
                })
                .error((xhr) => {
                    defer.reject(xhr);
                });

            return promise;
        }

        private doCreate(user:UserModel):ng.IPromise<any> {
            var defer = this.$q.defer();

            this.routes.users.create(user)
                .success(() => {
                    defer.resolve();
                })
                .error((xhr) => {
                    defer.reject(xhr);
                });

            return defer.promise;
        }

        private doUpdate(userId:string, user:UserModel):ng.IPromise<any> {
            var defer = this.$q.defer();

            this.routes.users.update(userId, user)
                .success(data => {
                    defer.resolve();
                })
                .error(xhr => {
                    defer.reject(xhr);
                });

            return defer.promise;
        }

        private isEmailUnique(email:string):ng.IPromise<any> {
            var defer = this.$q.defer();

            this.routes.validation.emailDuplicate(email)
                .success((data:EmailValidationResponse) => {
                    defer.resolve();
                })
                .error((xhr) => {
                    defer.reject(xhr);
                });

            return defer.promise;
        }

        private isEmailUniqueForUpdate(newEmail:string, currentEmail:string):ng.IPromise<any> {
            var defer = this.$q.defer();

            this.routes.validation.emailDuplicateForUpdate(newEmail, currentEmail)
                .success((data:EmailValidationResponse) => {
                    defer.resolve();
                })
                .error((xhr) => {
                    defer.reject(xhr);
                });

            return defer.promise;
        }


    }

    export function initUserAccountsService() {
        angular.module('stanby')
            .service('usersAccountService', ['routes', '$q', 'stUtils', '$state', function (routes:st.Routes, $q:ng.IQService,
                                                                                            stUtils:std.Utils, $state:ng.ui.IStateService):stanby.services.users.UserAccountsService {
                return new stanby.services.users.UserAccountsService(routes, $q, stUtils, $state);
            }]);
    }
}

