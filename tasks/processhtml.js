/*
 * grunt-processhtml
 * https://github.com/dciccale/grunt-processhtml
 *
 * Copyright (c) 2013 Denis Ciccale
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

  var HTMLProcessor = require('./lib/htmlprocessor').init(grunt);

  grunt.registerMultiTask('processhtml', 'Process html files at build time to modify them depending on the release environment', function () {
    var options = this.options({
      // process the whole file with data object when html processor finishes
      process: false,
      data: {}
    });

    var data = grunt.util._.extend(options.data, {
      environment: this.target
    });

    this.files.forEach(function (f) {
      var src = f.src.filter(function (filepath) {
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).map(function (filepath) {
        var content = grunt.file.read(filepath);
        var html = new HTMLProcessor(content, data);
        content = html.process();
        if (options.process) {
          content = grunt.template.process(content, options);
        }
        return content;
      }).join(grunt.util.linefeed);

      grunt.file.write(f.dest, src);
      grunt.log.writeln('File "' + f.dest + '" created.');
    });
  });
};
