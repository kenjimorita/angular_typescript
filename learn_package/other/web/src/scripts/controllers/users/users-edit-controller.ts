/// <reference path="../../vendor_def/tsd.d.ts" />
/// <reference path="../../services/common/routes.ts" />
/// <reference path="../../services/users/user-accounts-service.ts" />

module controllers.users.edit {
  import UserModel = stanby.models.users.UserModel;
  import UserParams = stanby.models.users.UserParams;

  /**
   * ユーザー情報の編集
   */
  export class UserEdit {
    userId: string;
    heading: string;
    model: UserModel;
    allRoles: string[];
    allStatus: string[];
    roles: string[];
    isEnabled: boolean;
    $roles: any;
    dummyPassword = "dummypassword";
    newPassword = this.dummyPassword;
    statusButtonName: string;
    isDisableStatusChange: boolean;
    display: boolean;

    constructor(
      public enums: sb.Enums,
      private $scope,
      private _:_.LoDashStatic,
      private stModal: std.Modal,
      private stUtils: std.Utils,
      private $state: ng.ui.IStateService,
      private $stateParams: UserParams,
      private stbUser: stb.UserService,
      private usersAccountService: stanby.services.users.UserAccountsService
    ) 
    {
      this.heading = "ユーザー情報の編集";
      this.userId = this.$stateParams.userId;

      var self = this;

      // NOTE(JH): moved logic for retrieving a user out to it's own service class
      usersAccountService.getUser(self.$stateParams.userId)
      .then(function(modelResponse) {
        self.model = modelResponse;
        self.display = true;

        // check if account is disabled
        stbUser.getAccountInfo(function(response) {
          // can't disable the account if it's the current user's account
          self.isDisableStatusChange = response.account.userId == self.userId ||
              enums.userStatus[self.model.status] === enums.userStatus.REG;


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

      // bind to controller's destroy event
      $scope.$on('$destroy', this.destroy);
    }

    private destroy():void {
      // clean up event listeners that were added or any $timeout promises
    }

    // add or remove a role from the current user
    updateRole(role, checked) {
      if (checked) {
        this.roles.push(role);
      }
      else {
        this.roles = _.without(this.roles, role);
      }

      // dirty the form
      this.$scope.form1.$setDirty();
    }


    /**
     * Save the user details, navigates back to the users list page if successful. Otherwise displays
     * error messages via stUtils.toastDanger
     *
     * @param form The form to save
     */
    save(form: any):void {
      var modal = this.stModal.modalConfirm({
        title: '編集内容を保存します。続行しますか？',
        msg: '対象のユーザーが現在ログイン中の場合、編集した内容はそのユーザーが次回ログインした時から反映されます。）'
      });

      modal.result.then(() => {
        // update the password and roles if necessary
        this.setData(form);

        this.usersAccountService.save(this.$stateParams.userId, this.model, form.email.$dirty)
        .then(() => {
          this.stUtils.withUpdateOkMessage(() => {
            this.$state.transitionTo('list');
          })
        }, (xhr) => {
          if (xhr.key == 'error.user.role.cannotDropAdminRole') {
            this.stUtils.toastDanger('ログインユーザー自身の管理者権限を外すことはできません');
          }
          else {
            this.stUtils.toastDanger('ユーザーの更新に失敗しました。画面を再読み込みして最新の状態を確認してください。');
          }
        });
      });
    }

    /**
     * Update the status of a user, navigates back to the users list page if successful. Otherwise displays
     * error messages via stUtils.toastDanger
     *
     * @param form The form of the user to update
     */
    saveUserStatus(form: any):void {
      var statusName =  this.enums.userStatus.ENA;
      if (this.enums.userStatus[this.model.status] === this.enums.userStatus.ENA) {
        statusName =  this.enums.userStatus.DIS;
      }
      var modal = this.stModal.modalConfirm({
        msg: 'ステータスを'+ statusName +'に変更します。続行しますか？'
      });

      modal.result.then(() => {
        this.setData(form);

        this.usersAccountService.saveUserStatus(this.$stateParams.userId, {status: this.model.status, versionNo: this.model.versionNo})
        .then(() => {
          this.stUtils.withUpdateOkMessage(() => {
            this.$state.transitionTo('list');
          });
        }, (xhr) => {
            this.stUtils.toastDanger('ユーザーの更新に失敗しました。画面を再読み込みして最新の状態を確認してください。');
        });
      });
    }

    tooltip(role) {
      if (role) {
        return this.enums.userRole[role].desc;
      }

      return "";
    }

    private setData(form: any): void {
      if(form.newPassword.$dirty && this.newPassword != this.dummyPassword){
        this.model.password = this.newPassword;
      }
      this.model.roles = this.roles;
    }
  }
}
