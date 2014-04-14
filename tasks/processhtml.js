/*
 * grunt-processhtml
 * https://github.com/dciccale/grunt-processhtml
 *
 * Copyright (c) 2013-2014 Denis Ciccale (@tdecs)
 * Licensed under the MIT license.
 * https://github.com/dciccale/grunt-processhtml/blob/master/LICENSE-MIT
 */

'use strict';

module.exports = function (grunt) {

  var HTMLProcessor = require('htmlprocessor');
  var path = require('path');

  grunt.registerMultiTask('processhtml', 'Process html files at build time to modify them depending on the release environment', function () {
    var options = this.options({
      process: false,
      data: {},
      templateSettings: null,
      includeBase: null,
      commentMarker: 'build',
      strip: false,
      recursive: false,
      customBlockTypes: [],
      environment: this.target
    });


    var html = new HTMLProcessor(options);

    this.files.forEach(function (f) {
      var src = f.src.filter(function (filepath) {
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).map(function (filepath) {
        var content = html.process(filepath);

        if (options.process) {
          content = html.template(content, html.data, options.templateSettings);
        }

        return content;
      }).join(grunt.util.linefeed);

      grunt.file.write(f.dest, src);
      grunt.log.writeln('File "' + f.dest + '" created.');
    });
  });
};
