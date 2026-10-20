'use strict';

var grunt = require('grunt');
var test = require('node:test');
var assert = require('node:assert/strict');

test('repeated_includes', function () {
  var actual = grunt.file.read('test/fixtures/repeated_includes.processed.html');
  var expected = grunt.file.read('test/expected/repeated_includes.html');
  assert.equal(actual, expected, 'renders each include with the current variables');
});

test('commented_assets', function () {
  var actual = grunt.file.read('test/fixtures/commented_assets.processed.html');
  var expected = grunt.file.read('test/expected/commented_assets.html');
  assert.equal(actual, expected, 'ignores commented CSS and JavaScript assets');
});

test('literal_scripts', function () {
  var actual = grunt.file.read('test/fixtures/literal_scripts.processed.html');
  var expected = grunt.file.read('test/expected/literal_scripts.html');
  assert.equal(actual, expected, 'keeps JavaScript and shell interpolation with explicit template delimiters');
});

test('dev', function () {
  var actual = grunt.file.read('test/fixtures/dev/index.processed.html');
  var expected = grunt.file.read('test/expected/dev/index.html');
  assert.equal(actual, expected, 'should process and output an html file as defined by the build special comments for dev target');
});

test('dist', function () {
  var actual = grunt.file.read('test/fixtures/dist/index.processed.html');
  var expected = grunt.file.read('test/expected/dist/index.html');
  assert.equal(actual, expected, 'should process and output an html file as defined by the build special comments for dist target');
});

test('custom', function () {
  var actual = grunt.file.read('test/fixtures/custom/custom.processed.html');
  var expected = grunt.file.read('test/expected/custom/custom.html');
  assert.equal(actual, expected, 'should be able to process a template with custom delimiters');
});

test('marker', function () {
  var actual = grunt.file.read('test/fixtures/commentMarker/commentMarker.processed.html');
  var expected = grunt.file.read('test/expected/commentMarker/commentMarker.html');
  assert.equal(actual, expected, 'should process and output an html file as defined by the build special comments for marker target');
});

test('strip', function () {
  var actual = grunt.file.read('test/fixtures/strip/strip.processed.html');
  var expected = grunt.file.read('test/expected/strip/strip.html');
  assert.equal(actual, expected, 'should remove build comments for non-targets');
});

test('multiple', function () {
  var actual = grunt.file.read('test/fixtures/multiple/mult_one.processed.html');
  var expected = grunt.file.read('test/expected/multiple/mult_one.html');
  assert.equal(actual, expected, 'parse comment block defining multiple targets (1)');

  actual = grunt.file.read('test/fixtures/multiple/mult_two.processed.html');
  expected = grunt.file.read('test/expected/multiple/mult_two.html');
  assert.equal(actual, expected, 'parse comment block defining multiple targets (2)');

  actual = grunt.file.read('test/fixtures/multiple/mult_three.processed.html');
  expected = grunt.file.read('test/expected/multiple/mult_three.html');
  assert.equal(actual, expected, 'parse comment block defining multiple targets (3)');
});

test('include_js', function () {
  var actual = grunt.file.read('test/fixtures/include/include.processed.html');
  var expected = grunt.file.read('test/expected/include/include.html');
  assert.equal(actual, expected, 'include a js file');
});

test('conditional_ie', function () {
  var actual = grunt.file.read('test/fixtures/conditional_ie/conditional_ie.processed.html');
  var expected = grunt.file.read('test/expected/conditional_ie/conditional_ie.html');
  assert.equal(actual, expected, 'correctly parse build comments inside conditional ie statement');
});

test('recursive_process', function () {
  var actual = grunt.file.read('test/fixtures/recursive/recursive.processed.html');
  var expected = grunt.file.read('test/expected/recursive/recursive.html');
  assert.equal(actual, expected, 'recursively process included files');
});

test('custom_blocktype', function () {
  var actual = grunt.file.read('test/fixtures/custom_blocktype/custom_blocktype.processed.html');
  var expected = grunt.file.read('test/expected/custom_blocktype/custom_blocktype.html');
  assert.equal(actual, expected, 'define custom block types');
});

test('template', function () {
  var actual = grunt.file.read('test/fixtures/template/template.processed.html');
  var expected = grunt.file.read('test/expected/template/template.html');
  assert.equal(actual, expected, 'define custom block types');
});

test('inline', function () {
  var actual = grunt.file.read('test/fixtures/inline/inline.processed.html');
  var expected = grunt.file.read('test/expected/inline/inline.html');
  assert.equal(actual, expected, 'inline (embedd) css and js files');
});
