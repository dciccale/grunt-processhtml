# grunt-processhtml
# https://github.com/dciccale/grunt-processhtml
# Copyright (c) 2013 Denis Ciccale (@tdecs)
# Licensed under the MIT license.
# https://github.com/dciccale/grunt-processhtml/blob/master/LICENSE-MIT
"use strict"
module.exports = (grunt) ->

  grunt.initConfig
    jshint:
      all: ["Gruntfile.js", "tasks/*.js", "<%= nodeunit.tests %>"]
      options:
        jshintrc: ".jshintrc"

    clean:
      tests: ["tmp"]

    processhtml:
      dev:
        options:
          data:
            message: "This is dev target"

        files:
          "dev/index.html": ["test/fixtures/index.html"]

      dist:
        options:
          process: true
          data:
            title: "My app"
            message: "This is dist target"

        files:
          "dist/index.html": ["test/fixtures/index.html"]

    nodeunit:
      tests: ["test/*_test.js"]

  grunt.loadTasks "tasks"

  grunt.loadNpmTasks "grunt-contrib-jshint"
  grunt.loadNpmTasks "grunt-contrib-clean"
  grunt.loadNpmTasks "grunt-contrib-nodeunit"

  grunt.registerTask "test", ["clean", "processhtml", "nodeunit"]

  grunt.registerTask "default", ["jshint", "test"]
