// ##########################################################################
// ################################################################ VENDOR JS
// ##########################################################################
module.exports = function (gulp) {
  var del = require('del');
  var runSequence = require('run-sequence');
  var path = require('path');
  var rev = require("gulp-rev");
  var gulpif = require("gulp-if");
  var common = require('./common.js')();

  var config = {
    cleanTarget: 'dist/assets/scripts/vendor_js/**',
    srcDir: 'src/scripts/vendor_js/**',
    revManifest: 'js-rev-manifest.json'
  }

  // Vendor JS Task
  // 1. Cleans js/js.map files in dist/vendor
  // 2. Rev's vendor js files and place them in dist
  gulp.task('vendor-js', function(cb){
    runSequence(
      'vendor-js:del',
      'vendor-js:build',
      cb
    );
  });

  gulp.task('vendor-js:del', function(cb){
    del(config.cleanTarget, function(){
      cb();
    });
  });


  gulp.task('vendor-js:build', function(){

    var needsOptimize = !common.BUILD_MODE.isDevelopment;

    return gulp
      .src(config.srcDir, {
        base: path.join(process.cwd(), 'src')
      })
      .pipe(gulpif(needsOptimize,
        rev()
      ))
      .pipe(gulp.dest(common.config.assetsDestDir))
      .pipe(gulpif(needsOptimize,
        rev.manifest(config.revManifest)
      ))
      .pipe(gulpif(needsOptimize,
        gulp.dest(common.config.revManifestDir)
      ));
  });
};
