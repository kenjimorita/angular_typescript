// ##########################################################################
// ############################################################### PDF-Viewer
// ##########################################################################
module.exports = function (gulp) {
  var del = require('del');
  var filter = require('gulp-filter');
  var runSequence = require('run-sequence');
  var gzip = require('gulp-gzip');
  var minjs = require('gulp-uglify');
  var cssmin = require('gulp-minify-css');
  var common = require('./common.js')();
  var filter = require('gulp-filter');
  var gzip = require('gulp-gzip');

  var config = {
    cleanGlob: 'dist/assets/pdfviewer/**/*',
    srcGlob: 'src/pdfviewer/**/*',
    destDir: common.config.assetsDestDir + 'pdfviewer/'
  }

  gulp.task('pdfviewer', function(callback){
    runSequence(
      'pdfviewer:del',
      'pdfviewer:copy',
      callback
    );
  });

  gulp.task('pdfviewer:del', function(cb){
    del(config.cleanGlob, function(){
      cb();
    });
  });

  gulp.task('pdfviewer:copy', function(){

    var stream = gulp.src(config.srcGlob);

    if(!common.BUILD_MODE.isDevelopment){ //NOTE(kitaly): Pre-compress js/html/css files to enable gzip_static of Nginx

      var jsFilter = filter('**/*.js');
      var cssFilter = filter('**/*.css');

      stream = stream
        .pipe(jsFilter)
        .pipe(minjs({
          preserveComments: function(node, comment){
            var licenseRegexp = /^\!|^@preserve|^@cc_on|\bMIT\b|\bMPL\b|\bGPL\b|\(c\)|License|Copyright/mi

              // ライセンス文はキープする
            if (licenseRegexp.test(comment.value) || comment.line === 1 || comment.line === _prevCommentLine + 1) {
              _prevCommentLine = comment.line;
              return true;
            } else {
              _prevCommentLine = 0;
              return false;
            }
          }
        }))
        .pipe(jsFilter.restore())
        .pipe(cssFilter)
        .pipe(cssmin({
          keepSpecialComments: '*' // " /*! .. comment .. */ " というようなコメントは全て残す
        }))
        .pipe(cssFilter.restore());

      var compressFilter = filter(['**/*.html', '**/*.css', '**/*.js']);
      stream = stream
        .pipe(compressFilter)
        .pipe(gzip())
        .pipe(compressFilter.restore());
    }

    return stream.pipe(gulp.dest(config.destDir));
  });
};
