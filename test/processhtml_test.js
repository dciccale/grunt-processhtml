'use strict';

var grunt = require('grunt');

exports.processhtml = {
  dev: function (test) {
    test.expect(1);

    var actual = grunt.file.read('test/fixtures/dev/index.processed.html');
    var expected = grunt.file.read('test/expected/dev/index.html');
    test.equal(actual, expected, 'should process and output an html file as defined by the build special comments for dev target');

    test.done();
  },

  dist: function (test) {
    test.expect(1);

    var actual = grunt.file.read('test/fixtures/dist/index.processed.html');
    var expected = grunt.file.read('test/expected/dist/index.html');
    test.equal(actual, expected, 'should process and output an html file as defined by the build special comments for dist target');

    test.done();
  },

  custom: function (test) {
    test.expect(1);

    var actual = grunt.file.read('test/fixtures/custom/custom.processed.html');
    var expected = grunt.file.read('test/expected/custom/custom.html');
    test.equal(actual, expected, 'should be able to process a template with custom delimiters');

    test.done();
  }
};
