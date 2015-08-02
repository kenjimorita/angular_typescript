/// <reference path="../../vendor_def/tsd.d.ts" />
/// <reference path="../../services/common/routes.ts" />
/// <reference path="../../services/users/user-accounts-service.ts" />

module controllers.users.create {

  import UserModel = stanby.models.users.UserModel;

  /**
   * ユーザー情報の作成
   */
  export class UserCreate {
    heading: string;
    model: UserModel;
    allRoles: string[];
    allStatus: string[];
    roles: string[];
    isEnabled: boolean = true;
    $roles: any;
    newPassword: string;
    display: boolean;
    disableButton: boolean = false;
    constructor(
      public enums: sb.Enums,
      private $scope,
      private _:_.LoDashStatic,
      private stModal: std.Modal,
      private stUtils: std.Utils,
      private $state: ng.ui.IStateService,
      private usersAccountService: stanby.services.users.UserAccountsService
    ) {
      this.model =
      {
        email: "",
        fullName: "",
        password: "",
        status: "ENA",
        roles: [],
        // must set this to allow initial duplicate email checking directive to work
        currentEmail: "fake@dummy.com"
      };
      this.heading = 'ユーザー情報の追加';
      this.allRoles = _.keys(this.enums.userRole);
      this.allStatus = _.keys(this.enums.userStatus);
      this.roles = _.keys(this.enums.userRole);
      this.$roles = $('#user-roles');
      this.display = false;
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

    save(form: any):void {
      this.disableButton = true;

      // update the password and roles if necessary
      this.setData(form);

      var modal = this.stModal.modalConfirm({
        msg: 'ユーザーを追加します。続行しますか？'
      });

      modal.result.then(() => {
        this.usersAccountService.create(this.model)
        .then(() => {
          this.stUtils.withUpdateOkMessage(() => {
            this.$state.transitionTo('list');
          });
        }, (xhr) => {
          if (xhr.key == 'error.profile.emailDuplication') {
            this.stUtils.toastDanger('すでに使用されているメールアドレスです');
          }
          else {
            this.stUtils.toastDanger('ユーザーの追加に失敗しました。画面を再読み込みして最新の状態を確認してください。');
          }
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
      this.model.password = this.newPassword;
      this.model.roles = this.roles;
    }
  }
}
