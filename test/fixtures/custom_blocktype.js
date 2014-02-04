'use strict';

module.exports = function (processor) {
  processor.registerBlockType('test', function (content, block, blockLine, blockContent) {
    return content.replace(blockLine, block.indent + 'test');
  });
};
