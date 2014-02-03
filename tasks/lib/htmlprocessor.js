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
var path = require('path');
var utils = require('./utils');

var getBlocks = function (content, marker) {
  /*
   * <!-- build:<type>[:target] [value] -->
   * - type (required) js, css, href, remove, template
   * - target|attribute i.e. dev, release or [href] [src]
   * - value (optional) i.e. script.min.js
  */
  var regbuild = new RegExp('<!--\\s*' + marker + ':(\\[?[\\w-]+\\]?)(?::([\\w,]+))?(?:\\s*([^\\s]+)\\s*-->)*');

  // <!-- /build -->
  var regend = new RegExp('(?:<!--\\s*)*\\/' + marker + '\\s*-->');

  // Normalize line endings and split in lines
  var lines = content.replace(/\r\n/g, '\n').split(/\n/);
  var inside = false;
  var sections = [];
  var block;

  lines.forEach(function (line) {
    var build = line.match(regbuild);
    var endbuild = regend.test(line);
    var attr;

    if (build) {
      inside = true;
      attr = build[1].match(/(?:\[([\w\-]+)\])*/)[1];
      block = {
        type: attr ? 'attr': build[1],
        attr: attr,
        targets: !!build[2] ? build[2].split(',') : null,
        asset: build[3],
        indent: /^\s*/.exec(line)[0],
        raw: []
      };
    }

    if (inside && block) {
      block.raw.push(line);
    }

    if (inside && endbuild) {
      inside = false;
      sections.push(block);
    }
  });

  return sections;
};

var getBlockTypes = function (options, filePath) {
  return {
    replaceAsset: function (content, block, blockLine, asset) {
      return content.replace(blockLine, block.indent + asset);
    },

    css: function (content, block, blockLine, blockContent) {
      return this.replaceAsset(content, block, blockLine, '<link rel="stylesheet" href="' + block.asset + '">');
    },

    js: function (content, block, blockLine, blockContent) {
      return this.replaceAsset(content, block, blockLine, '<script src="' + block.asset + '"><\/script>');
    },

    attr: function (content, block, blockLine, blockContent) {

      // Only run attr replacer for the block content
      var re = new RegExp('(\\s*(?:' + block.attr + ')=[\'"])(.*)?(".*)', 'gi');
      var replacedBlock = blockContent.replace(re, function (wholeMatch, start, asset, end) {

        // Check if only the path was provided to leave the original asset name intact
        asset = (!path.extname(block.asset) && /\//.test(block.asset))? block.asset + path.basename(asset) : block.asset;

        return start + asset + end;
      });

      return content.replace(blockLine, replacedBlock);
    },

    remove: function (content, block, blockLine, blockContent) {
      var blockRegExp = utils.blockToRegExp(blockLine);

      return content.replace(blockRegExp, '');
    },

    template: function (content, block, blockLine, blockContent) {
      var compiledTmpl = utils.template(blockContent, options);

      // Clean template output and fix indent
      compiledTmpl = block.indent + grunt.util._.trim(compiledTmpl).replace(/([\r\n])\s*/g, '$1' + block.indent);

      return content.replace(blockLine, compiledTmpl);
    },

    include: function (content, block, blockLine, blockContent) {
      var base = options.includeBase || path.dirname(filePath);
      var filepath = path.join(base, block.asset);
      var l = blockLine.length;
      var fileContent, i;

      if (grunt.file.exists(filepath)) {
        fileContent = block.indent + grunt.file.read(filepath);
        while ((i = content.indexOf(blockLine)) !== -1) {
          content = content.substring(0, i) + fileContent + content.substring(i + l);
        }
      }

      return content;
    }
  };
};

var HTMLProcessor = module.exports = function (content, options, filePath) {
  this.content = content;
  this.target = options.data.environment;
  this.linefeed = /\r\n/g.test(content) ? '\r\n' : '\n';
  this.blocks = getBlocks(content, options.commentMarker);
  this.blockTypes = getBlockTypes(options, filePath);
	this.strip = options.strip === true;
};

HTMLProcessor.prototype._replace = function (block, content) {
  var blockLine = block.raw.join(this.linefeed);
  var blockContent = block.raw.slice(1, -1).join(this.linefeed);
  var result = this.blockTypes[block.type](content, block, blockLine, blockContent);

  return result;
};

HTMLProcessor.prototype._strip = function (block, content) {
  var blockLine = block.raw.join(this.linefeed);
  var blockRegExp = utils.blockToRegExp(blockLine);
  var blockContent = block.raw.slice(1, -1).join(this.linefeed);
  var result = content.replace(blockRegExp, '\n\n' + blockContent);

  return result;
};

HTMLProcessor.prototype.process = function () {
  var result = this.content;

  grunt.util._.each(this.blocks, function (block) {

    // Parse through correct block type also checking the build target
    if (this.blockTypes[block.type] && (!block.targets || grunt.util._.indexOf(block.targets, this.target) >= 0)) {
      result = this._replace(block, result);
    } else if (this.strip) {
      result = this._strip(block, result);
    }
  }, this);

  return result;
};
