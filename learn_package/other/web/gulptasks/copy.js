module.exports = function (gulp) {
  /**
   * Copy for use bower components
   */
  gulp.task('copy:bower', function (callback) {
    var targets = [
      //JavaScripts
      'jquery/dist/jquery.js',
      'jquery/dist/jquery.min.js',
      'jquery/dist/jquery.min.map',
      'jquery-easing/jquery.easing.min.js',
      'jquery-ui/jquery-ui.min.js',
      'lodash/dist/lodash.js',
      'lodash/dist/lodash.min.js',
      'angular/angular.js',
      'angular/angular.min.js',
      'angular/angular.min.js.map',
      'angular-i18n/angular-locale_ja-jp.js',
      'angular-animate/angular-animate.js',
      'angular-animate/angular-animate.min.js',
      'angular-animate/angular-animate.min.js.map',
      'angular-sanitize/angular-sanitize.js',
      'angular-sanitize/angular-sanitize.min.js',
      'angular-sanitize/angular-sanitize.min.js.map',
      'angular-ui-router/release/angular-ui-router.js',
      'angular-ui-router/release/angular-ui-router.min.js',
      'angular-ui-bootstrap-bower/ui-bootstrap-tpls.js',
      'angular-ui-bootstrap-bower/ui-bootstrap-tpls.min.js',
      'angular-ui-utils/angular-ui-utils/ui-utils.js',
      'angular-ui-utils/angular-ui-utils/ui-utils.min.js',
      'html5shiv/dist/html5shiv.js',
      'html5shiv/dist/html5shiv.min.js',
      'respondJs/src/respond.js',
      'es5-shim/es5-shim.js',
      'es5-shim/es5-shim.min.js'
    ];
  });
};
