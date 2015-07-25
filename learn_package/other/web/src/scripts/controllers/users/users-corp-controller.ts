/// <reference path="../../vendor_def/tsd.d.ts" />
/// <reference path="../../services/common/routes.ts" />

module controllers.users.corp {
  
  import CorpAccountModel = stanby.models.users.CorpAccountModel;

  /**
   * 企業アカウント
   */
  export class UserCorp {
    corpInfo: CorpAccountModel;
    constructor(
      private $scope: any,
      private $state: ng.ui.IStateService,
      private stModal: std.Modal,
      private stUtils: std.Utils,
      private routes: st.Routes
    ) {}

    /* get data, load form */
    init():void {
      this.routes.corporate.show().success((data: CorpAccountModel) => {
        this.corpInfo =
        {
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
    }

    validateForm(form): Array<string> {
      var errArr: string[] = [];

      //check length
      var maxLength = function(entry, length){
        if (entry.length > length) {
          return false;
        }
      };

      //必須項目
      if (maxLength(form.details.contact.name, 50) == false) errArr.push("担当者・部署が長すぎます" + form.details.contact.name.length);
      if (maxLength(form.details.contact.email, 100) == false) errArr.push("お問い合わせ用メールアドレスが長すぎます");
      if (maxLength(form.details.contact.phone, 25) == false) errArr.push("お問い合わせ用電話番号が長すぎます");
      if (maxLength(form.name, 100) == false) errArr.push("企業名が長すぎます");

      //日付けチェック(主にIE対策)
      var currentYear = new Date().getFullYear();
      if (!_.isEmpty(form.details.establishedAt)) {
        if (form.details.establishedAt.year && (Number(form.details.establishedAt.year) < 1 || Number(form.details.establishedAt.year) > currentYear)) errArr.push("設立年をご確認ください。");
        if (form.details.establishedAt.month && (Number(form.details.establishedAt.month) < 1 || Number(form.details.establishedAt.month) > 12)) errArr.push("設立月をご確認ください。");

        //IE9対策
        if (form.details.establishedAt.month == "") delete form.details.establishedAt.month;
        if (form.details.establishedAt.year == "") delete form.details.establishedAt.year;
        if (form.details.establishedAt.month) form.details.establishedAt.month = Number(form.details.establishedAt.month);
        if (form.details.establishedAt.year) form.details.establishedAt.year = Number(form.details.establishedAt.year);
      };

      return errArr;
    }

    /* update form */
    updateInfo(form: ng.IFormController) {
      var proceed = this.stModal.modalConfirm({
        msg: '編集内容を保存します。続行しますか？'
      });

      proceed.result.then(() => {
        /* validation */
        var errList = this.validateForm(this.corpInfo);
        if (!_.isEmpty(errList)){
          this.stUtils.toastDanger(errList.join('<br/>'));
          return;
        }
        this.routes.corporate.update(this.corpInfo)
          .success((data) => {
            this.stUtils.toastInfo("更新しました。");
            this.$state.go('corpInfo');
          })
          .error((data) => {
            this.stUtils.toastDanger("更新失敗しました。");
          });
      });
    }

  }
}