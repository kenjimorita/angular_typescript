// ----------------------------------------------------------------------------
// Stanby Corporate Gulp File
// ----------------------------------------------------------------------------
var gulp = require('gulp');
var url = require('url');
var clean = require('gulp-clean');
var unzip = require('gulp-unzip');
var sourcemaps = require('gulp-sourcemaps');
var watch = require('gulp-watch');
var _ = require('lodash');
var rename = require('gulp-rename');
var ejs = require("gulp-ejs");
var revall = require('gulp-rev-all');
var filter = require('gulp-filter');
var merge = require('merge');
var path = require('path');
var gzip = require('gulp-gzip');
var proxy = require('proxy-middleware');
var runSequence = require('run-sequence');

// Include gulp tasks
require('./gulptasks/ts.js')(gulp);
require('./gulptasks/ejs.js')(gulp);
require('./gulptasks/design.js')(gulp);
require('./gulptasks/documents.js')(gulp);
require('./gulptasks/vendor-js.js')(gulp);
require('./gulptasks/webserver.js')(gulp);
require('./gulptasks/pdfviewer.js')(gulp);
require('./gulptasks/published.js')(gulp);

var common = require('./gulptasks/common.js')(gulp);

if(common.BUILD_MODE.isDevelopment){
  // require('./gulptasks/mock.js')(gulp);
}

// ##########################################################################
// ############################################################# DEFAULT TASK
// ##########################################################################
// The default task contains nothing
gulp.task('default', function() {
    console.log(' _____ _____ ___   _   _ ________   __');
    console.log('/  ___|_   _/ _ \\ | \\ | || ___ \\ \\ / /');
    console.log('\\ `--.  | |/ /_\\ \\|  \\| || |_/ /\\ V / ');
    console.log(' `--. \\ | ||  _  || . ` || ___ \\ \\ /  ');
    console.log('/\\__/ / | || | | || |\\  || |_/ / | |  ');
    console.log('\\____/  \\_/\\_| |_/\\_| \\_/\\____/  \\_/  ');
    console.log('~ Stanby Recruiting Assets Build Script ~');
    console.log('');
    console.log('The default task contains nothing. Please check gulpfile.js');
  }
);

/* ##########################################################################
   ############################################################## BUILD LOCAL
   ########################################################################## */
/**
 * Gulp Build-Local
 * Executes all the tasks required for local development
 */
gulp.task('build', function(callback){
  var pararellList = [
    'ts',
    'ts:lint',
    'vendor-js',
    'design',
    'documents',
    'published',
    'pdfviewer'
  ]

  if(common.BUILD_MODE.isDevelopment){
    // taskList.push('mock:build');
  }

  console.log('=================================')
  if(common.BUILD_MODE.isDevelopment) console.log("Building in Develop Mode");
  if(common.BUILD_MODE.isStaging) console.log("Building in Staging Mode");
  if(common.BUILD_MODE.isProduction) console.log("Building in Production Mode");
  console.log('=================================')

  runSequence(
    pararellList,
    'ejs',
    callback
  );
});

/* ##########################################################################
   ############################################################### GULP WATCH
   ########################################################################## */
gulp.task('watch', function () {
  runSequence(
    'build',
    'ts:watch',
    'design:watch',
    'documents:watch',
    'ejs:watch',
    'published:watch',
    // 'mock:watch',
    // 'mock:server',
    'webserver',
    function () {
      console.log('Watching files!!!!!');
    }
  );
});

/* ======================================================
   Old (2015/Feb/05時点であまりメンテされてなさそう by kitaly)
   ====================================================== */

var baseTargetDir = 'public/javascripts/vendor/';
var baseSourceDir = 'bower_components/';
var baseTestTargetDir = 'test/javascript/vendor/';

//JavaScript/CSS paths

// var targets = [
//   //JavaScripts
//   'jquery/dist/jquery.js',
//   'jquery/dist/jquery.min.js',
//   'jquery/dist/jquery.min.map',
//   'jquery-easing/jquery.easing.min.js',
//   'jquery-ui/jquery-ui.min.js',
//   'lodash/dist/lodash.js',
//   'lodash/dist/lodash.min.js',
//   'angular/angular.js',
//   'angular/angular.min.js',
//   'angular/angular.min.js.map',
//   'angular-i18n/angular-locale_ja-jp.js',
//   'angular-animate/angular-animate.js',
//   'angular-animate/angular-animate.min.js',
//   'angular-animate/angular-animate.min.js.map',
//   'angular-sanitize/angular-sanitize.js',
//   'angular-sanitize/angular-sanitize.min.js',
//   'angular-sanitize/angular-sanitize.min.js.map',
//   'angular-ui-router/release/angular-ui-router.js',
//   'angular-ui-router/release/angular-ui-router.min.js',
//   'angular-ui-bootstrap-bower/ui-bootstrap-tpls.js',
//   'angular-ui-bootstrap-bower/ui-bootstrap-tpls.min.js',
//   'angular-ui-utils/angular-ui-utils/ui-utils.js',
//   'angular-ui-utils/angular-ui-utils/ui-utils.min.js',
//   'html5shiv/dist/html5shiv.js',
//   'html5shiv/dist/html5shiv.min.js',
//   'respondJs/src/respond.js',
//   'es5-shim/es5-shim.js',
//   'es5-shim/es5-shim.min.js'
// ];
var unzipTargets = [
  {source:'jasmine/dist/jasmine-standalone-2.0.0.zip', target:'jasmine-tmp'}
];
var testTargets = [
  'angular-mocks/angular-mocks.js',
  {source:'jasmine-tmp/lib/jasmine-2.0.0/**', target:'jasmine'}
];


/**
 * Remove all the javascript files in vendor
 */
gulp.task('clean-source', function(){
  return gulp.src(baseTargetDir + '**', {read:false})
    .pipe(clean());

});


/**
 * Remove all the javascript files in vendor in test
 */
gulp.task('clean-test', function(){
  return gulp.src(baseTestTargetDir + '**', {read:false})
    .pipe(clean());

});


/**
 * Unzip some of the downloaded files by Bower
 */
gulp.task('unzip', function () {
  _.each(unzipTargets, function(path){

    gulp.src(baseSourceDir + path.source)
      .pipe(unzip())
      .pipe(gulp.dest(baseSourceDir + path.target));
  });
});


/**
 * Copy selected JavaScript files from bower_components
 */
gulp.task('copy-source', function () {
  _.each(targets, function(path){

    if (_.isString(path)) {
      gulp.src(baseSourceDir + path)
        .pipe(gulp.dest(baseTargetDir));

    } else {
      gulp.src(baseSourceDir + path.source)
        .pipe(rename(path.target))
        .pipe(gulp.dest(baseTargetDir));
    }
  });
});


/**
 * Copy selected JavaScript files for testing from bower_components
 */
gulp.task('copy-test', function () {
  _.each(testTargets, function(path){

    if (_.isString(path)) {
      gulp.src(baseSourceDir + path)
        .pipe(gulp.dest(baseTestTargetDir));

    } else {
      gulp.src(baseSourceDir + path.source)
        .pipe(gulp.dest(baseTestTargetDir + path.target));
    }
  });
});
