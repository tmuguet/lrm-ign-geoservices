module.exports = function (config) {
  config.set({
    frameworks: ['mocha', 'chai', 'sinon', 'happen'],
    plugins: [
      'karma-mocha',
      'karma-chai',
      'karma-sinon',
      'karma-happen',
      'karma-phantomjs-launcher',
      // 'karma-chrome-launcher',
      // 'karma-safari-launcher',
      'karma-firefox-launcher',
      'karma-coverage',
    ],

    files: [
      'node_modules/jquery/dist/jquery.min.js',
      'node_modules/leaflet/dist/leaflet.js',
      'node_modules/leaflet-routing-machine/dist/leaflet-routing-machine.min.js',
      'node_modules/@mapbox/corslite/corslite.js',
      'dist/lrm-ign-geoservices.js',
      'test/*.js',
      'test/**/*Spec.js',
    ],

    reporters: ['progress', 'coverage'],

    preprocessors: {
      'dist/lrm-ign-geoservices.js': ['coverage'],
    },

    coverageReporter: {
      type: 'html',
      dir: 'coverage/',
    },

    // browsers: ["PhantomJS"],
    browsers: ['Firefox'],

    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 5000,

    // Workaround for PhantomJS random DISCONNECTED error
    browserDisconnectTimeout: 10000, // default 2000
    browserDisconnectTolerance: 1, // default 0

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: true,
  });
};
