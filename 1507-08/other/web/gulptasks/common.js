module.exports = function () {
  var minimist = require('minimist');
  var BUILD_MODE = {
    isProduction: false,
    isStaging: false,
    isDevelopment: false
  }

  function setupBuildMode(){
    var knownOptions = {
      string: 'env',
      default: { env: 'development' }
    };

    var envArg = minimist(process.argv.slice(2), knownOptions).env

    if(envArg == 'production') BUILD_MODE.isProduction = true
    else if(envArg == 'staging') BUILD_MODE.isStaging = true
    else if(envArg == 'development') BUILD_MODE.isDevelopment = true
    else throw Error('Invalid environment specification!')
  }

  setupBuildMode();

  return {
    config: {
      destBaseDir: 'dist/',
      pagesDestDir: 'dist/pages/',
      assetsDestDir: 'dist/assets/',
      revManifestDir: 'dist/rev-manifest/'
    },
    designConfig: {
      delTarget: ['dist/assets/images/**', 'dist/assets/stylesheets/**', 'dist/assets/**/*.ico', '!dist/assets/published/**'],
      srcGlob: ['src/images/**', 'src/stylesheets/**', 'src/**/*.ico'],
      revManifest: 'design-rev-manifest.json'
    },
    documentsConfig: {
      delTarget: ['dist/assets/documents/**', '!dist/assets/published/**'],
      srcGlob: 'src/documents/**',
    },
    BUILD_MODE: BUILD_MODE
  }
};
