// ##########################################################################
// ############################################################### Web SERVER
// ##########################################################################
// Gulp Webserver 
// - Listens to 9010
// - to serve static files on its own
// - to proxy API requests to 9011
//
// https://github.com/schickling/gulp-webserver
// https://github.com/expressjs/serve-static
module.exports = function (gulp) {
  var webserver = require('gulp-webserver');
  var bsync = require('browser-sync');
  var serveStatic = require('serve-static');
  var common = require('./common.js')();

  var config = {
    indexHtml: 'index.html',
    notFoundHtml: 'error/404.html',
    fallbackExt: ['html'],
    proxies: [
      {
        source:'/api',
        target: 'http://localhost:9011/api'
      },{
        source:'/boards',
        target: 'http://localhost:9011/boards'
      //},{
      //  source:'/mock',
      //  target: 'http://localhost:9012'
      }
    ]
  };

  var setNoCacheHeaders = function(res) {
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Cache-Control', 'no-cache, no-store');
    res.setHeader('Expires', '-1');
  }

  gulp.task('webserver', function() {
    gulp.src([common.config.assetsDestDir, common.config.pagesDestDir])
      .pipe(webserver({
        port: 9010,
        // livereload: true,

        // Reverse-Proxy for API Calls
        proxies: config.proxies,

        fallback: config.notFoundHtml,

        // Try Html files for request whose URI has no extention
        middleware: [
          serveStatic(common.config.pagesDestDir, {
            extensions: config.fallbackExt, // e.g.) /hoge -> dist/pages/hoge.html
            index: config.indexHtml,
            setHeaders: setNoCacheHeaders
          }),
          serveStatic(common.config.assetsDestDir, {
            setHeaders: setNoCacheHeaders
          })
        ]
      }));
  });
};
