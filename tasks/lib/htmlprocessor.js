/*
 * grunt-processhtml
 * https://github.com/dciccale/grunt-processhtml
 *
 * Copyright (c) 2013 Denis Ciccale (@tdecs)
 * Licensed under the MIT license.
 * https://github.com/dciccale/grunt-processhtml/blob/master/LICENSE-MIT
 */

'use strict';

var grunt = require('grunt');
var path = require('path');
var utils = require('./utils');

var getBlocks = function (content) {
  /*
   * <!-- build:<type>[:target] [value] -->
   * - type (required) js, css, href, remove, template
   * - target|attribute i.e. dev, release or [href] [src]
   * - value (optional) i.e. script.min.js
  */
  var regbuild = /<!--\s*build:(\[?[\w-]+\]?)(?::(\w+))?(?:\s*([^\s]+)\s*-->)*/;
  // <!-- /build -->
  var regend = /(?:<!--\s*)*\/build\s*-->/;
  // normalize line endings and split in lines
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
      attr = build[1].match(/(?:\[([\w-]+)\])*/)[1];
      block = {
        type: attr ? 'attr': build[1],
        attr: attr,
        target: build[2],
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
      // only run attr replacer for the block content
      var re = new RegExp('(\\s*(?:' + block.attr + ')=[\'"])(.*)?(".*)', 'gi');
      var replacedBlock = blockContent.replace(re, function (wholeMatch, start, asset, end) {
        // check if only the path was provided to leave the original asset name intact
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
      // clean template output and fix indent
      compiledTmpl = block.indent + grunt.util._.trim(compiledTmpl).replace(/([\r\n])\s*/g, '$1' + block.indent);
      return content.replace(blockLine, compiledTmpl);
    },

    include: function (content, block, blockLine, blockContent) {
      var filepath = path.join(path.dirname(filePath), block.asset);
      var fileContent;
      if (grunt.file.exists(filepath)) {
        fileContent = block.indent + grunt.file.read(filepath);
        content = content.replace(blockLine, fileContent);
      }
      return content;
    }
  };
};

var HTMLProcessor = module.exports = function (content, options, filePath) {
  this.content = content;
  this.target = options.data.environment;
  this.linefeed = /\r\n/g.test(content) ? '\r\n' : '\n';
  this.blocks = getBlocks(content);
  this.blockTypes = getBlockTypes(options, filePath);
};

HTMLProcessor.prototype._replace = function (block, content) {
  var blockLine = block.raw.join(this.linefeed);
  var blockContent = block.raw.slice(1, -1).join(this.linefeed);
  var result = this.blockTypes[block.type](content, block, blockLine, blockContent);
  return result;
};

HTMLProcessor.prototype.process = function () {
  var result = this.content;

  grunt.util._.each(this.blocks, function (block) {
    // parse through correct block type also checking the build target
    if (this.blockTypes[block.type] && (!block.target || block.target === this.target)) {
      result = this._replace(block, result);
    }
  }, this);

  return result;
};
