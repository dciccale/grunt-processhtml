/*
 * grunt-processhtml
 * https://github.com/dciccale/grunt-processhtml
 *
 * Copyright (c) 2013-2014 Denis Ciccale (@tdecs)
 * Licensed under the MIT license.
 * https://github.com/dciccale/grunt-processhtml/blob/master/LICENSE-MIT
 */

'use strict';

var fs = require('fs');
var path = require('path');
var utils = require('./utils');
var blockTypes = require('./blocktypes');

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
var HTMLProcessor = function (options) {
  this.options = options;
  this.target = options.data.environment;

  // Register custom block types
  if (this.options.customBlockTypes.length) {
    utils._.each(this.options.customBlockTypes, function (processor) {
      require(processor).call(this, this);

    }, this);
  }
};

HTMLProcessor.prototype._blockTypes = blockTypes;

HTMLProcessor.prototype.registerBlockType = function (name, fn) {
  this._blockTypes[name] = fn;
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

HTMLProcessor.prototype._replaceBlocks = function (blocks) {
  var result = this.content;

  // Replace found blocks
  utils._.each(blocks, function (block) {

    // Parse through correct block type checking the build target
    if (this._blockTypes[block.type] && (!block.targets || utils._.indexOf(block.targets, this.target) >= 0)) {
      result = this._replace(block, result);
    } else if (this.options.strip) {
      result = this._strip(block, result);
    }
  }, this);

  return result;
};

// Process the file content
HTMLProcessor.prototype.process = function (filepath) {
  this.filepath = filepath;
  this.content = fs.readFileSync(filepath).toString();
  this.linefeed = /\r\n/g.test(this.content) ? '\r\n' : '\n';

  // Parse the file content to look for build comment blocks
  var blocks = getBlocks(this.content, this.options.commentMarker);

  // Replace found blocks
  var content = this._replaceBlocks(blocks);

  return content;
};

// Export the processor
module.exports = HTMLProcessor;
