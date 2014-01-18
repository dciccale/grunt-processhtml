# grunt-processhtml
# https://github.com/dciccale/grunt-processhtml
#
# Copyright (c) 2013 Denis Ciccale (@tdecs)
# Licensed under the MIT license.
# https://github.com/dciccale/grunt-processhtml/blob/master/LICENSE-MIT

"use strict"

module.exports = ->

  @initConfig
    jshint:
      all: ["tasks/**/*.js", "<%= nodeunit.tests %>"]
      options:
        jshintrc: ".jshintrc"

    processhtml:
      dev:
        options:
          data:
            message: "This is dev target"

        files:
          "test/fixtures/dev/index.processed.html": ["test/fixtures/index.html"]

      dist:
        options:
          process: true
          data:
            title: "My app"
            message: "This is dist target"

        files:
          "test/fixtures/dist/index.processed.html": ["test/fixtures/index.html"]

      custom:
        options:
          templateSettings:
            opener: '{{'
            closer: '}}'
          data:
            message: "This has custom delimiters for the template"

        files:
          "test/fixtures/custom/custom.processed.html": ["test/fixtures/custom.html"]
          
      marker:
        options:
          commentMarker: 'process'
          data:
            message: "This uses a custom comment marker"
          
        files:
          "test/fixtures/commentMarker/commentMarker.processed.html": ["test/fixtures/commentMarker.html"]

      strip:
        options:
          strip: true

        files:
          "test/fixtures/strip/strip.processed.html": ["test/fixtures/strip.html"]

      ###
      The following three tests are for describing multiple targets
      ###
      mult_one:
        files:
          "test/fixtures/multiple/mult_one.processed.html": ["test/fixtures/multiple.html"]

      mult_two:
        files:
          "test/fixtures/multiple/mult_two.processed.html": ["test/fixtures/multiple.html"]

      mult_three:
        files:
          "test/fixtures/multiple/mult_three.processed.html": ["test/fixtures/multiple.html"]

    nodeunit:
      tests: ["test/*_test.js"]

  @loadTasks "tasks"

  @loadNpmTasks "grunt-contrib-jshint"
  @loadNpmTasks "grunt-contrib-nodeunit"
  @loadNpmTasks "grunt-release"

  @registerTask "test", ["processhtml", "nodeunit"]
  @registerTask "default", ["jshint", "test"]
