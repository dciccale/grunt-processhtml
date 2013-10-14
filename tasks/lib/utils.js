'use strict';

exports.init = function (grunt) {
  var exports = {};

  var escapeRegExp = function (str) {
    return str.replace(/([.?*+\^=!:$\[\]\\(){}|\-])/g, '\\$1');
  };

  exports.blockToRegExp = function (blockLine) {
    var escaped = escapeRegExp(blockLine);
    return new RegExp(escaped.replace(/^\s*|[\r\n]+\s*/g, '\\s*').replace(/\n{1}$/g, '\\n'));
  };

  exports.template = function (tmpl, options) {
    return grunt.template.process(tmpl, options);
  };

  return exports;
};
