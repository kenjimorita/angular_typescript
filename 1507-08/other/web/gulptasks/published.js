// ##########################################################################
// ################### Copy assets for published pages (Temporary, 2015.3.25)
// ##########################################################################
module.exports = function (gulp) {
  var common = require('./common.js')();
  var minjs = require('gulp-uglify');
  var filter = require('gulp-filter');

  gulp.task('published', ['published:copy']);

  gulp.task('published:copy', function(){
    var analyticsFilter = filter('**/stanby-recruiting-analytics.js');

    return gulp.src('src/published/**/*.*')
      .pipe(analyticsFilter)
      .pipe(minjs())
      .pipe(analyticsFilter.restore())
      .pipe(gulp.dest(common.config.assetsDestDir + 'published/'));
  });

  gulp.task('published:watch', function () {
    gulp.watch('src/published/**/*.*', ['published']);
  });
};
