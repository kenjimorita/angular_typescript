// ##########################################################################
// ##################################################################### MOCK
// ##########################################################################
// Gulp Mock
// - Listens to 9012
// https://github.com/DaniloShan/gulp-mock
module.exports = function (gulp) {
  // var mock = require('gulp-mock');
  //var webserver = require('gulp-webserver');
  //var runSequence = require('run-sequence');
  //var common = require('./common.js')();
  //
  //var config = {
  //  srcTarget: 'mocks/',
  //  apiPath: 'api'
  //};
  //
  //gulp.task('mock', function () {
  //  runSequence(
  //    'mock:build',
  //    'mock:server'
  //  );
  //});
  //
  //gulp.task('mock:watch', function () {
  //  gulp.watch(config.srcTarget + '**/*.json', ['mock:build']);
  //});
  //
  //gulp.task('mock:build', function () {
  //  mock.config({
  //    sourcePath: config.srcTarget,
  //    apiPath: config.apiPath,
  //    dirName: __dirname
  //  });
  //
  //  gulp.src(config.srcTarget + '**/*.json')
  //    .pipe(mock())
  //    .pipe(gulp.dest('api/'));
  //});
  //
  //gulp.task('mock:server', function() {
  //  gulp.src('api/')
  //    .pipe(webserver({
  //      port: 9012
  //    }));
  //});
};
