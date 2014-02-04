/*
 * grunt-processhtml
 * https://github.com/dciccale/grunt-processhtml
 *
 * Copyright (c) 2013-2014 Denis Ciccale (@tdecs)
 * Licensed under the MIT license.
 * https://github.com/dciccale/grunt-processhtml/blob/master/LICENSE-MIT
 */

'use strict';

var grunt = require('grunt');

var utils = module.exports = {};

var escapeRegExp = function (str) {
  return str.replace(/([.?*+\^=!:$\[\]\\(){}|\-])/g, '\\$1');
};

utils.blockToRegExp = function (blockLine) {
  var escaped = escapeRegExp(blockLine);
  return new RegExp(escaped.replace(/^\s*|[\r\n]+\s*/g, '\\s*').replace(/\n{1}$/g, '\\n'));
};

utils.template = function (tmpl, options) {
  return grunt.template.process(tmpl, options);
};

utils._ = grunt.util._;
