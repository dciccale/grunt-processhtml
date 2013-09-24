'use strict';

var path = require('path');
var fs = require('fs');
var utils = require('./utils');

exports.init = function (grunt) {
  var _ = grunt.util._;
  var _tmplData, _filePath;

  var getBlocks = function (content) {
    /*
     * <!-- build:<type>[:target] [value] -->
     * - type (required) js, css, href, remove, template
     * - target|attribute i.e. dev, release or [href] [src]
     * - value (optional) i.e. script.min.js
    */
    var regbuild = /<!--\s*build:(\[?\w+\]?)(?::(\w+))?(?:\s*([^\s]+)\s*-->)*/;
    // <!-- /build -->
    var regend = /(?:<!--\s*)*\/build\s*-->/;
    // normalize line endings and split in lines
    var lines = content.replace(/\r\n/g, '\n').split(/\n/);
    var inside = false;
    var sections = [];
    var block;

    lines.forEach(function (l) {
      var build = l.match(regbuild);
      var endbuild = regend.test(l);
      var attr;

      if (build) {
        inside = true;
        attr = build[1].match(/(?:\[(\w+)\])*/)[1];
        block = {
          type: attr ? 'attr': build[1],
          attr: attr,
          target: build[2],
          asset: build[3],
          indent: /^\s*/.exec(l)[0],
          raw: []
        };
      }

      if (inside && block) {
        block.raw.push(l);
      }

      if (inside && endbuild) {
        inside = false;
        sections.push(block);
      }
    });

    return sections;
  };

  var HTMLProcessor = function (content, tmplData, filePath) {
    this.content = content;
    _tmplData = tmplData || {};
    _filePath = filePath || '';
    this.target = tmplData.environment;
    this.linefeed = /\r\n/g.test(content) ? '\r\n' : '\n';
    this.blocks = getBlocks(content);
  };

  var _blockTypes = {
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
        asset = !path.extname(block.asset) ? block.asset + path.basename(asset) : block.asset;
        return start + asset + end;
      });

      return content.replace(blockLine, replacedBlock);
    },

    remove: function (content, block, blockLine, blockContent) {
      var blockRegExp = utils.blockToRegExp(blockLine);
      return content.replace(blockRegExp, '');
    },

    template: function (content, block, blockLine, blockContent) {
      var compiledTmpl = _.template(blockContent, _tmplData);
      // clean template output and fix indent
      compiledTmpl = block.indent + _.trim(compiledTmpl).replace(/([\r\n])\s*/g, '$1' + block.indent);
      return content.replace(blockLine, compiledTmpl);
    },

    include: function (content, block, blockLine, blockContent) {
      var filePath = path.join(path.dirname(_filePath), block.asset);
      var fileContent;
      if (fs.existsSync(filePath)) {
        fileContent = block.indent + fs.readFileSync(filePath);
        content = content.replace(blockLine, fileContent);
      }
      return content;
    }
  };

  HTMLProcessor.prototype._getReplacer = function (block) {
    var blockLine = block.raw.join(this.linefeed);
    var blockContent = block.raw.slice(1, -1).join(this.linefeed);
    var replacer = function (content) {
      return _blockTypes[block.type](content, block, blockLine, blockContent);
    };

    return {
      replace: replacer
    };
  };

  HTMLProcessor.prototype.process = function () {
    var result = this.content;

    _.each(this.blocks, function (block) {
      // parse through correct block type also checking the build target
      if (_blockTypes[block.type] && (!block.target || block.target === this.target)) {
        result = this._getReplacer(block).replace(result);
      }
    }, this);

    return result;
  };

  return HTMLProcessor;
};
