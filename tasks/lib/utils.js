'use strict';

var escapeRegExp = function (str) {
  return str.replace(/([.?*+\^=!:$\[\]\\(){}|\-])/g, '\\$1');
};

exports.blockToRegExp = function (blockLine) {
  var escaped = escapeRegExp(blockLine);
  return new RegExp(escaped.replace(/^\s*|[\r\n]+\s*/g, '\\s*').replace(/\n{1}$/g, '\\n'));
};
