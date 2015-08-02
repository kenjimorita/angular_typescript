// ##########################################################################
// ############################################################ DOCUMENTS ASSETS
// ##########################################################################
module.exports = function (gulp) {
  var del = require('del');
  var runSequence = require('run-sequence');
  var common = require('./common.js')();

  // Builds Documents Assets (PDF/doc/docx/xls/xlsx,etc.)
  // - Build fingerprinted files
  // - Generates rev-manifest json file
  gulp.task('documents', function(cb){
    runSequence(
      'documents:del',
      'documents:build',
      cb
    )
  });

  gulp.task('documents:del', function (cb) {
    del(common.documentsConfig.delTarget, function () {
      cb();
    });
  });

  gulp.task('documents:build', function(){
    var stream = gulp
      .src(common.documentsConfig.srcGlob)
      .pipe(gulp.dest('dist/assets/documents'));
    return stream;
  });

  gulp.task('documents:watch', function () {
    gulp.watch(common.documentsConfig.srcGlob, ['documents']);
  });
};
