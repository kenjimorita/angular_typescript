/// <reference path="../vendor_def/tsd.d.ts" />
/// <reference path="../services/common/routes.ts" />



module controllers.contact {

  export class ContactController {
    email: string;
    inquiry: string;
    sent: boolean = false;

    constructor(
      private routes:st.Routes,
      private stUtils: std.Utils
    ){}


    send(): void {
      this.routes.contact.send(this.email, this.inquiry)
        .success((data: any) => {
          this.sent = true
        })
        .error((data: any) => {
          this.stUtils.toastDanger('通信に失敗しました。時間をおいて、再度お試しください。');
        });
    }
  }

}


module stanby.routing.contact {

  export function initRouting(){
    angular
      .module('stanbyControllers')
      .controller('ContactCtrl', controllers.contact.ContactController)
      .config(($stateProvider, $urlRouterProvider) => {
        $urlRouterProvider.otherwise('');
        $stateProvider.state('index', {
          url: '',
          templateUrl: '/templates/contact/index.html',
          controller: 'ContactCtrl as c',
          anonAllowed: true
        });
      });
  }
}

