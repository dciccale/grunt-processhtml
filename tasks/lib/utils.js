/*
 * grunt-processhtml
 * https://github.com/dciccale/grunt-processhtml
 *
 * Copyright (c) 2013-2014 Denis Ciccale (@tdecs)
 * Licensed under the MIT license.
 * https://github.com/dciccale/grunt-processhtml/blob/master/LICENSE-MIT
 */

'use strict';

var utils = module.exports = {};
var grunt = require('grunt');

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
