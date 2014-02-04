var fs = require('fs');
var path = require('path');
var utils = require('./utils');

// Define default block types
module.exports = {

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
    compiledTmpl = block.indent + utils._.trim(compiledTmpl).replace(/([\r\n])\s*/g, '$1' + block.indent);

    return content.replace(blockLine, compiledTmpl);
  },

  include: function (content, block, blockLine, blockContent) {
    var base = this.options.includeBase || path.dirname(this.filepath);
    var filepath = path.join(base, block.asset);
    var l = blockLine.length;
    var fileContent, i;

    if (fs.existsSync(filepath)) {

      // Recursively process included files
      if (this.options.recursive) {
        fileContent = this.process(filepath);

      } else {
        fileContent = fs.readFileSync(filepath).toString();
      }

      // Add indentation and remove any last new line
      fileContent = block.indent + fileContent.replace(/\n$/, '');

      while ((i = content.indexOf(blockLine)) !== -1) {
        content = content.substring(0, i) + fileContent + content.substring(i + l);
      }
    }

    return content;
  }
};
