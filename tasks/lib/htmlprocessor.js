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

// The processor
var HTMLProcessor = function (content, options, filePath) {
  this.content = content;
  this.options = options;
  this.filePath = filePath;
  this.target = options.data.environment;
  this.linefeed = /\r\n/g.test(content) ? '\r\n' : '\n';
};

// Returns a single line of the current block comment
HTMLProcessor.prototype._getBlockLine = function (block) {
  return block.raw.join(this.linefeed);
};

// Returns the block content (not including the build comments)
HTMLProcessor.prototype._getBlockContent = function (block) {
  return block.raw.slice(1, -1).join(this.linefeed);
};

// Replace passed block with the processed content
HTMLProcessor.prototype._replace = function (block, content) {
  var blockLine = this._getBlockLine(block);
  var blockContent = this._getBlockContent(block);
  var result = this._blockTypes[block.type].call(this, content, block, blockLine, blockContent);

  return result;
};

// Strips blocks not matched for the current target
HTMLProcessor.prototype._strip = function (block, content) {
  var blockLine = this._getBlockLine(block);
  var blockContent = this._getBlockContent(block);
  var blockRegExp = utils.blockToRegExp(blockLine);
  var result = content.replace(blockRegExp, '\n\n' + blockContent);

  return result;
};

// Define default block types
HTMLProcessor.prototype._blockTypes = {

  css: function (content, block, blockLine, blockContent) {
    return content.replace(blockLine, block.indent + '<link rel="stylesheet" href="' + block.asset + '">');
  },

  js: function (content, block, blockLine, blockContent) {
    return content.replace(blockLine, block.indent + '<script src="' + block.asset + '"><\/script>');
  },

  attr: function (content, block, blockLine, blockContent) {
    var re = new RegExp('(\\s*(?:' + block.attr + ')=[\'"])(.*)?(".*)', 'gi');

    // Only run attr replacer for the block content
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
    var compiledTmpl = utils.template(blockContent, this.options);

    // Clean template output and fix indent
    compiledTmpl = block.indent + grunt.util._.trim(compiledTmpl).replace(/([\r\n])\s*/g, '$1' + block.indent);

    return content.replace(blockLine, compiledTmpl);
  },

  include: function (content, block, blockLine, blockContent) {
    var base = this.options.includeBase || path.dirname(this.filePath);
    var filepath = path.join(base, block.asset);
    var l = blockLine.length;
    var fileContent, i;

    if (grunt.file.exists(filepath)) {
      fileContent = block.indent + grunt.file.read(filepath);

      // Remove any last new line
      fileContent = fileContent.replace(/\n$/, '');

      // Recursively process included files
      if (this.options.recursive) {
        fileContent = new HTMLProcessor(fileContent, this.options, filepath).process();
      }

      while ((i = content.indexOf(blockLine)) !== -1) {
        content = content.substring(0, i) + fileContent + content.substring(i + l);
      }
    }

    return content;
  }
};

HTMLProcessor.prototype._replaceBlocks = function (blocks) {
  var result = this.content;

  // Replace found blocks
  grunt.util._.each(blocks, function (block) {

    // Parse through correct block type checking the build target
    if (this._blockTypes[block.type] && (!block.targets || grunt.util._.indexOf(block.targets, this.target) >= 0)) {
      result = this._replace(block, result);
    } else if (this.options.strip) {
      result = this._strip(block, result);
    }
  }, this);

  return result;
};

// Process the file content
HTMLProcessor.prototype.process = function () {

  // Parse the file content to look for build comment blocks
  var blocks = getBlocks(this.content, this.options.commentMarker);

  // Replace found blocks
  var content = this._replaceBlocks(blocks);

  return content;
};

// Export the processor
module.exports = HTMLProcessor;
