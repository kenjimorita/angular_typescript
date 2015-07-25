/// <reference path="../vendor_def/tsd.d.ts" />

declare module stanby.models.masters {

  export interface HtmlText {
    htmlText: string;
  }

  // ユーザーステータス
  export interface UserStatus {
    code: string;
    name: string;
  }
}