/**
 * NOTE(kitaly): DO NOT define vendor interfaces here
 * Project-specific (stanbyATS-specific) interfaces are defined below
 * (e.g. If you're using a feature in a new version of AngularJS, then you must update the scripts/vendor_def/angular.d.ts)
 */

//NOTE(kitaly): Ignore "no-unused-variable" for global variable declaration
/* tslint:disable:no-unused-variable */
declare var jQuery: JQueryStatic;
declare var $: JQueryStatic;
declare var _: _.LoDashStatic;

//NOTE(kitaly): For use of GoogleTagManager script
declare var dataLayer: Array<Object>;

declare module ng {
  export interface IRequestConfig {
    //NOTE(kitaly): suppress 401 error toast if this field is set to true
    suppress401ErrorMsg?: boolean;
  }
}
