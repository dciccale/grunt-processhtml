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
  },

  marker: function (test) {
    test.expect(1);

    var actual = grunt.file.read('test/fixtures/commentMarker/commentMarker.processed.html');
    var expected = grunt.file.read('test/expected/commentMarker/commentMarker.html');
    test.equal(actual, expected, 'should process and output an html file as defined by the build special comments for marker target');

    test.done();
  },

  strip: function (test) {
    test.expect(1);

    var actual = grunt.file.read('test/fixtures/strip/strip.processed.html');
    var expected = grunt.file.read('test/expected/strip/strip.html');
    test.equal(actual, expected, 'should remove build comments for non-targets');

    test.done();
  },

  multiple: function (test) {
    test.expect(3);

    var actual = grunt.file.read('test/fixtures/multiple/mult_one.processed.html');
    var expected = grunt.file.read('test/expected/multiple/mult_one.html');
    test.equal(actual, expected, 'parse comment block defining multiple targets (1)');

    actual = grunt.file.read('test/fixtures/multiple/mult_two.processed.html');
    expected = grunt.file.read('test/expected/multiple/mult_two.html');
    test.equal(actual, expected, 'parse comment block defining multiple targets (2)');

    actual = grunt.file.read('test/fixtures/multiple/mult_three.processed.html');
    expected = grunt.file.read('test/expected/multiple/mult_three.html');
    test.equal(actual, expected, 'parse comment block defining multiple targets (3)');

    test.done();
  },

  include_js: function (test) {
    test.expect(1);

    var actual = grunt.file.read('test/fixtures/include/include.processed.html');
    var expected = grunt.file.read('test/expected/include/include.html');
    test.equal(actual, expected, 'include a js file');

    test.done();
  },

  conditional_ie: function (test) {
    test.expect(1);

    var actual = grunt.file.read('test/fixtures/conditional_ie/conditional_ie.processed.html');
    var expected = grunt.file.read('test/expected/conditional_ie/conditional_ie.html');
    test.equal(actual, expected, 'correctly parse build comments inside conditional ie statement');

    test.done();
  }
};
