/// <reference path="./controllers/users/users-corp-controller.ts" />
/// <reference path="./controllers/users/users-create-controller.ts" />
/// <reference path="./controllers/users/users-edit-controller.ts" />
/// <reference path="./controllers/users/users-list-controller.ts" />

module stanby.page.users {

  import usersCtrl = controllers.users;
  import usersMdl = stanby.models.users;


  export function initPage(){

    angular
      .module('stanbyControllers')
      .controller('UserListCtrl', usersCtrl.list.UserList)
      .controller('UserEditCtrl', usersCtrl.edit.UserEdit)
      .controller('UserCreateCtrl', usersCtrl.create.UserCreate)
      .controller('UserCorpCtrl', usersCtrl.corp.UserCorp)
      .config(($stateProvider, $urlRouterProvider) => {

        $urlRouterProvider.otherwise('/');

        $stateProvider
          .state('list', {
            url: '/',
            templateUrl: '/templates/users/list.html',
            controller: 'UserListCtrl as c',
            onEnter: ($rootScope) => {
              $rootScope.$emit('breadcrumbs', [
                { url: '/', text: 'Stanby Recruiting' },
                { url: '', text: 'アカウント管理' }
              ]);
            }
          })
          .state('create', {
            url: '/create',
            templateUrl: '/templates/users/edit.html',
            controller: 'UserCreateCtrl as c',
            onEnter: ($rootScope) => {
              $rootScope.$emit('breadcrumbs', [
                { url: '/', text: 'Stanby Recruiting' },
                { url: '/users#/', text: 'アカウント管理' },
                { url: '', text: 'ユーザー情報の追加' }
              ]);
            }
          })
          .state('edit', {
            url: '/:userId/edit',
            templateUrl: '/templates/users/edit.html',
            controller: 'UserEditCtrl as c',
            resolve: {
              userPromise: ($stateParams: ng.ui.IStateParamsService, routes: st.Routes): ng.IHttpPromise<usersMdl.UserDetailResponse> => {
                var userId = $stateParams['userId'];
                return routes.users.details(userId);
              }
            },
            onEnter: ($rootScope) => {
              $rootScope.$emit('breadcrumbs', [
                { url: '/', text: 'Stanby Recruiting' },
                { url: '/users#/', text: 'アカウント管理' },
                { url: '', text: 'ユーザー情報の編集' }
              ]);
            }
          })
          .state('corpInfo', {
            url: '/corpInfo',
            templateUrl: 'templates/users/corpInfo.html',
            controller: 'UserCorpCtrl as c',
            onEnter: ($rootScope) => {
              $rootScope.$emit('breadcrumbs', [
                { url: '/', text: 'Stanby Recruiting' },
                { url: '/users#/', text: 'アカウント管理' },
                { url: '', text: '企業アカウント' }
              ]);
            }
          })
          .state('corpEdit', {
            url: '/corpEdit',
            templateUrl: 'templates/users/corpEdit.html',
            controller: 'UserCorpCtrl as c',
            onEnter: ($rootScope) => {
              $rootScope.$emit('breadcrumbs', [
                { url: '/', text: 'Stanby Recruiting' },
                { url: '/users#/', text: 'アカウント管理' },
                { url: '/users#/corpInfo', text: '企業アカウント' },
                { url: '', text: '企業アカウントの編集' }
              ]);
            }
          });
      })
    ;
  }
}

stanby.page.users.initPage();
stanby.directives.users.inputs.initFormInputs();
stanby.services.users.initUserAccountsService();