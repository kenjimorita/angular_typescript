// ##########################################################################
// ############################################################ DESIGN ASSETS
// ##########################################################################
module.exports = function (gulp) {
  var del = require('del');
  var runSequence = require('run-sequence');
  var filter = require('gulp-filter');
  var cssmin = require('gulp-minify-css');
  var revall = require('gulp-rev-all');
  var gulpif = require('gulp-if');
  var path = require('path');
  var common = require('./common.js')();

  // Builds Design Assets (Images/Fonts/CSS)
  // - Build fingerprinted files
  // - Replace URL referring to Images/Fonts with fingerprinted file names in CSS files
  // - Generates rev-manifest json file
  gulp.task('design', function(cb){
    runSequence(
      'design:del',
      'design:build',
      cb
    )
  });

  gulp.task('design:del', function (cb) {
    del(common.designConfig.delTarget, function () {
      cb();
    });
  });

  gulp.task('design:build', function(){
    var filterCss = filter('**/*.css');
    var filterNoneEmailImages = filter(['**/*', '!**/images/emails/*']);
    var needsOptimize = !common.BUILD_MODE.isDevelopment;

    var stream = gulp
      .src(common.designConfig.srcGlob, {
        base: path.join(process.cwd(), 'src')
      })
      .pipe(gulpif(needsOptimize,
        filterCss
      ))
      .pipe(gulpif(needsOptimize,
        cssmin()
      ))
      .pipe(gulpif(needsOptimize,
        filterCss.restore()
      ))
      .pipe(gulpif(needsOptimize,
        filterNoneEmailImages //NOTE(kitaly): メール用の画像にはフットプリント付けない、メール送信するAPI側から分からないので
      ))
      .pipe(gulpif(needsOptimize,
        revall({
          quiet: true, // Suppress debug logs
          ignore: [] // NOTE(kitaly): override default ignore for .ico files
        })
      ))
      .pipe(gulpif(needsOptimize,
        filterNoneEmailImages.restore()
      ))
      .pipe(gulp.dest(common.config.assetsDestDir))
      .pipe(gulpif(needsOptimize,
        revall.manifest({
          fileName: common.designConfig.revManifest
        })
      ))
      .pipe(gulpif(needsOptimize,
        gulp.dest(common.config.revManifestDir)
      ));

    return stream;
  });

  gulp.task('design:watch', function () {
    gulp.watch(common.designConfig.srcGlob, ['design']);
  });
};
