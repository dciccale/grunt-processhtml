'use strict';

var grunt = require('grunt');

exports.processhtml = {
  dev: function (test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/dev/index.html');
    var expected = grunt.file.read('test/expected/dev/index.html');
    test.equal(actual, expected, 'should process and output an html file as defined by the build special comments for dev target');

    test.done();
  },

  dist: function (test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/dist/index.html');
    var expected = grunt.file.read('test/expected/dist/index.html');
    test.equal(actual, expected, 'should process and output an html file as defined by the build special comments for dist target');

    test.done();
  }
};
