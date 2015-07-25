/// <reference path="../../vendor_def/tsd.d.ts" />

declare module std {
  import bs = ng.ui.bootstrap

  export interface Utils {
    withUpdateOkMessage(f:Function):void
    toastDanger(msg:string):void
    toastWarning(msg:string):void
    toastInfo(msg:string):void
  }

  export interface Modal {
    modalConfirm(content:ModalContent): bs.IModalServiceInstance
    modalAlert(content:ModalContent): bs.IModalServiceInstance
    modalCustom(options:bs.IModalSettings): bs.IModalServiceInstance
  }

  export interface ModalContent {
    msg: string
    title?: string
    cancelButton?: string
    okButton?: string
  }
}
