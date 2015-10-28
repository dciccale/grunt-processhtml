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
  var async = require('async');

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

    function clone(obj) {

        if(obj == null)
            return obj;

        var tp = typeof obj;
		
        if(tp === 'string' ||
            tp === 'number' ||
            tp === 'boolean' ||
            tp === 'function') {
            return obj;
        } else if(tp === 'object') {

            if(obj instanceof Date) {
                  return new Date(obj.getTime());
            } else if(obj instanceof RegExp) {
                return new RegExp(obj.source);
            } else {
                var copy = {};
                var props = Object.getOwnPropertyNames(obj);
                for(var prop in obj) {
                    if(obj.hasOwnProperty(prop)){
                        copy[prop] = clone(obj[prop]);
                    }
                }
                return copy;
            }
        } else {
            throw 'Cannot handle value of type \'' + tp + '\'.';
        }

    }

    var done = this.async();
    var html = new HTMLProcessor(options);

    async.eachSeries(this.files, function (f, n) {
      var destFile = path.normalize(f.dest);

      var srcFiles = f.src.filter(function (filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        }
        return true;
      });

      if (srcFiles.length === 0) {
        // No src files, goto next target. Warn would have been issued above.
        return n();
      }

      var result = [];
      async.concatSeries(srcFiles, function (file, next) {

        var content = html.process(file);

        if (options.process) {
          content = html.template(content, clone(html.data), options.templateSettings);
        }

        result.push(content);
        process.nextTick(next);

      }, function () {
        grunt.file.write(destFile, result.join(grunt.util.normalizelf(grunt.util.linefeed)));
        grunt.verbose.writeln('File ' + destFile.cyan + ' created.');
        n();
      });
    }, done);
  });
};
