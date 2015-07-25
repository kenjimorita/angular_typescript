/// <reference path="../vendor_def/tsd.d.ts" />

declare module stanby.models.tracking {

  export interface SuccessfulAjaxEvent {
    event: string;
    stSuccessfulAjaxCallMethod: string;
    stSuccessfulAjaxCallUrl: string;
  }
}