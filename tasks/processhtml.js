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

  var utils = require('../lib/utils');
  var HTMLProcessor = require('../lib/htmlprocessor');
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
    });

    // Extend template data with the current target
    grunt.util._.extend(options.data, {
      environment: this.target
    });

    // Set custom delimiters
    var templateSettings = options.templateSettings;
    if (templateSettings && templateSettings.opener && templateSettings.closer) {
      grunt.template.addDelimiters('lodash', templateSettings.opener, templateSettings.closer);
      options.delimiters = 'lodash';
    }

    // Allow registering custom block types
    var customBlockTypes = options.customBlockTypes;
    if (customBlockTypes && customBlockTypes.length) {
      options.customBlockTypes = customBlockTypes.map(function (processor) {
        return path.resolve(processor);
      });
    }

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
          content = utils.template(content, options);
        }

        return content;
      }).join(grunt.util.linefeed);

      grunt.file.write(f.dest, src);
      grunt.log.writeln('File "' + f.dest + '" created.');
    });
  });
};
