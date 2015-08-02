// ##########################################################################
// ############################################################## TYPE SCRIPT
// ##########################################################################
// Typescript Task
// [1] -> [2, 3] -> done
//
// 1. Cleans ts copied or compiled files in dist
// 2. Copy original ts source files
// 3. Compiles ts into js/sourcemap files and place them in dist along with original source files
//

//TODO(kitaly): Remove this file later
module.exports = function (gulp) {
  var typescript = require('gulp-typescript');
  var sourcemaps = require('gulp-sourcemaps');
  var runSequence = require('run-sequence');
  var rename = require('gulp-rename');
  var minjs = require('gulp-uglify');
  var rev = require("gulp-rev");
  var del = require('del');
  var path = require('path');
  var gulpif = require('gulp-if');
  var gdebug = require('gulp-debug');
  var common = require('./common.js')();

  var config = {
    cleanTarget: [
      'dist/assets/typescripts/**/*.ts',
      'dist/assets/javascripts/**/*.js',
      'dist/assets/javascripts/**/*.js.map',
      '!dist/assets/javascripts/vendor/**',
      '!dist/assets/javascripts/vendor/**'
    ],
    srcTarget: 'src/typescripts/**/*.ts',
    copyTarget: 'src/typescripts/**/*.ts',
    revManifest: 'ts-rev-manifest.json'
  };

  gulp.task('ts', function (callback) {
    runSequence(
      'ts:del',
      'ts:copy',
      'ts:build',
      callback
    );
  });

  gulp.task('ts:del', function (callback) {
    del(config.cleanTarget, function(){
      callback();
    });
  });

  gulp.task('ts:copy', function () {
    var keepSource = !common.BUILD_MODE.isProduction;

    return gulp
      .src(config.copyTarget)
      .pipe(gulpif(keepSource,
        gulp.dest(common.config.assetsDestDir + 'typescripts/')
      ));
  });

  gulp.task('ts:build', function () {

    var keepSource = !common.BUILD_MODE.isProduction;
    var needsOptimize = !common.BUILD_MODE.isDevelopment;

    var jsStream = gulp
      .src(config.srcTarget)
      .pipe(gulpif(keepSource,
        sourcemaps.init()
      ))
      .pipe(typescript({
        removeComments: true
      }))
      .on('error', function(e) {
        console.log(e.toString());
        this.emit('end');
      })
      .pipe(gulpif(common.BUILD_MODE.isProduction, //NOTE(kitaly): どうしても tsc -> minify の多段ソースマップが実現できないので
        minjs({ mangle: false })
      ))
      .pipe(gulpif(needsOptimize,
        rename(function(path){ // NOTE(kitaly): manifest ファイル上 はだけ javascripts/xxx/xxx という出力にしたい
          path.dirname = 'javascripts/' + path.dirname;
          return path;
        })
      ))
      .pipe(gulpif(needsOptimize,
        rev()
      ))
      .pipe(gulpif(needsOptimize,
        rename(function(path){
          if(path.dirname == 'javascripts'){
            path.dirname = '';
          } else {
            path.dirname = path.dirname.split('/')[1];
          }
          return path;
        })
      ))
      .pipe(gulpif(keepSource,
        sourcemaps.write('.', {
          includeContent: true
        })
      ))
      .pipe(gulp.dest(common.config.assetsDestDir + 'javascripts/'))
      .pipe(rename(function(path){
        path.dirname = 'javascripts/' + path.dirname;
        return path;
      }))
      .pipe(gulpif(needsOptimize,
        rev.manifest(config.revManifest)
      ))
      .pipe(gulpif(needsOptimize,
        gulp.dest(common.config.revManifestDir)
      ));

    return jsStream;
  });

  gulp.task('ts:watch', function () {
    gulp.watch(config.srcTarget, ['ts']);
  });
};
