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

module.exports = function (gulp) {

  var gulp = require('gulp');
  var fs = require('fs');
  var path = require('path');
  var _ = require('lodash');
  var debug = require('gulp-debug');
  var runSequence = require('run-sequence');
  var typescript = require('gulp-typescript');
  var sourcemaps = require('gulp-sourcemaps');
  var uglify = require('gulp-uglify');
  var concat = require('gulp-concat');
  var rev = require('gulp-rev');
  var merge = require('merge-stream');
  var common = require('./common.js')();
  var gulpif = require('gulp-if');
  var del = require('del');
  var rename = require('gulp-rename');
  var tslint = require('gulp-tslint');
  var gutil = require('gulp-util');


  const config = {
    delBlob: [
      'dist/assets/scripts/**/*.js',
      'dist/assets/scripts/**/*.js.map',
      'dist/assets/typescripts/**/*.ts',
      '!dist/assets/scripts/vendor_js/**',
      '!dist/assets/scripts/vendor_js/**'
    ],
    buildSrcDir: 'src/scripts/',
    buildSrcBlob: 'src/scripts/**/*.ts',
    lintTargetBlob: ['src/scripts/**/*.ts', '!src/scripts/vendor_def/**/*'],
    buildDestDir: 'dist/assets/',
    copySrcBlob: 'src/scripts/**/*.ts',
    revManifest: 'ts-rev-manifest.json'
  };

  var keepSource = !common.BUILD_MODE.isProduction;
  var needsOptimize = !common.BUILD_MODE.isDevelopment;

  gulp.task('ts', function (callback) {
    runSequence(
      'ts:del',
      'ts:build',
      callback
    );
  });


  /**
   * Removes all output javascript & copied typescript
   */
  gulp.task('ts:del', function (callback) {

    del(config.delBlob, function(){
      callback();
    });

  });


  /**
   * Checks code-style with TsLint
   */
  gulp.task('ts:lint', function(callback) {

    const warningReporter = function (output, file, options) {
      var pluginLabel = '[' + gutil.colors.cyan('tslint') + ']';
      var warningLabel = gutil.colors.yellow('warning');

      _.forEach(output, function(warning) {
        var ruleName = '(' + warning.ruleName + ')';
        var position = '[' + warning.startPosition.line + ', ' + warning.startPosition.position + ']:';
        var failureMessage = warning.failure;

        gutil.log(pluginLabel, warningLabel, ruleName, file.relative, position, failureMessage);
      });
    };


    return gulp
      .src(config.lintTargetBlob)
      .pipe(tslint())
      .pipe(tslint.report(warningReporter, {
        emitError: false
      }));
  });


  /**
   * Compiles typescripts into javascripts
   * - Compile TS into JS
   * - Concat into few javascript files
   * - Append revisioning number to file name (hoge-1a2ad31.js)
   * - Sourcemaps bet. input TS and output JS
   */
  gulp.task('ts:build', function(){

    // NOTE(kitaly): 本当は task 外で定義しないと、差分コンパイルが効かないらしいが、watchと相性が悪いのでここに仕方なく定義してみた
    var tsProject = typescript.createProject({
      removeComments: true,
      sortOutput: true,
      //declarationFiles: true,
      noExternalResolve: true
    });

    // TS Files -> JS Files
    var tsResult = gulp
        .src(config.buildSrcBlob)
        .pipe(gulpif(keepSource,
          sourcemaps.init()
        ))
        .pipe(typescript(tsProject))
      ;


    tsResult.setMaxListeners(50); //NOTE(kitaly): Prepare for the stream to be listened from multiple streams

    // Concat files referenced from main files (e.g. stanby-app.ts, job-page.ts, etc.)
    var mainJsList = fs.readdirSync(config.buildSrcDir)
      .filter(function(file){
        var isFile = fs.statSync(path.join(config.buildSrcDir, file)).isFile();
        var isTsFile = file.lastIndexOf('.ts') == (file.length - 3);

        return isFile && isTsFile;
      })
      .map(function(file) {

        var outputName = file.replace(/\.ts$/, '.js');
        var referenceBase = file;

        return tsResult.js
          .pipe(typescript.filter(tsProject, {
            referencedFrom: [referenceBase]
          }))
          .pipe(concat({
            path: outputName,
            cwd: ''
          }))
        ;
      });


    // Uglify -> Rev-Number'ing -> Place Output JS files
    var outputJsStream = merge(mainJsList)
      .pipe(gulpif(needsOptimize,
        uglify({
          mangle: false
        })
      ))
      .pipe(rename(function(path){
        path.dirname = 'scripts/' + path.dirname;
        return path;
      }))
      .pipe(gulpif(needsOptimize,
        rev()
      ))
      .pipe(gulp.dest(config.buildDestDir));


    // Output sourcemapping files
    var sourceMappingStream = outputJsStream
      .pipe(gulpif(keepSource,
        sourcemaps.write('.', {
          includeContent: true
        })
      ))
      .pipe(gulpif(keepSource,
        gulp.dest(config.buildDestDir)
      ));

    // Output rev-number'ed file name mapping file
    var revManifestStream = outputJsStream
      .pipe(gulpif(needsOptimize,
        rev.manifest(config.revManifest)
      ))
      .pipe(gulpif(needsOptimize,
        gulp.dest(common.config.revManifestDir)
      ));

    return merge(sourceMappingStream, revManifestStream);
  });


  gulp.task('ts:watch', function () {
    gulp.watch(config.buildSrcBlob, ['ts']);
  });
}