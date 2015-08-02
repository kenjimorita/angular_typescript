// ##########################################################################
// ###################################################################### EJS
// ##########################################################################
module.exports = function (gulp) {
  var path = require('path');
  var del = require('del');
  var merge = require('merge');
  var rename = require('gulp-rename');
  var ejs = require('gulp-ejs');
  var runSequence = require('run-sequence');
  var common = require('./common.js')(gulp);
  var config = {
    cleanTarget: ['dist/**/*.html', '!dist/assets/pdfviewer/**'],
    watchBlob: 'src/ejs/**/*.ejs',
    srcTarget: 'src/ejs/**/*.html.ejs'
  }

  gulp.task('ejs', function(cb) {
    runSequence(
      'ejs:del',
      'ejs:build',
      cb
    );
  });

  gulp.task('ejs:del', function(cb){
    del(config.cleanTarget, function(){
      cb();
    });
  });

  gulp.task('ejs:build', function(){
    var
      tsRev,
      jsRev,
      scriptRev,
      designRev;

    // NOTE(kitaly): 開発環境以外はFootprint対応
    if (!common.BUILD_MODE.isDevelopment) {
      designRev = require('../' + common.config.revManifestDir + common.designConfig.revManifest);
      scriptRev = merge(
        require('../' + common.config.revManifestDir + 'ts-rev-manifest.json'),
        require('../' + common.config.revManifestDir + 'js-rev-manifest.json')
      );
      var revAssetsFn = function (path) {
        var scFound = scriptRev[path];
        if(scFound){
          return '/' +scFound;
        }
        var designFound = designRev['/' + path]; // NOTE(kitaly): なぜか gulp-rev-all での rev-manifest は key-value 共に "/" 始まりなので…
        if(designFound){
          return designFound;
        }

        throw new Error('Fingerprinted file not found on rev-manifest files!! FileName: ' + path);
      };

    } else {
      var revAssetsFn = function (path) {
        return '/' + path;
      };
    }

    return gulp
      .src(config.srcTarget)
      .pipe(ejs({
        revAssets: revAssetsFn
      }, {
        ext: '' // xxx.html.ejs -> xxx.html
      }))
      .on('error', function(e) {
        console.log(e);
        this.emit('end');
      })
      .pipe(rename(function(path){
        if(path.dirname && path.dirname.indexOf('pages') != 0){
          path.dirname = 'assets/' + path.dirname
        }
      }))
      .pipe(gulp.dest(common.config.destBaseDir));
  });

  gulp.task('ejs:watch', function () {
    gulp.watch(config.watchBlob, ['ejs']);
  });
};
