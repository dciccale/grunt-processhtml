# grunt-processhtml [![Build Status](https://travis-ci.org/dciccale/grunt-processhtml.png?branch=master)](https://travis-ci.org/dciccale/grunt-processhtml)

> Process html files at build time to modify them depending on the release environment

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-processhtml --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-processhtml');
```

## The "processhtml" task

Process `html` files with special comments:

```html
<!-- build:<type>[:target] [value] -->
...
<!-- /build -->
```

- type (required) is one of: js, css, remove or template. or any html attribute if written like this: [href], [src],
  etc.
- target (optional) is the target name of your grunt task, for example: `dist`. Is supported for all types, so you can
  always specify the target if needed.
- value (optional) could be: script.min.js or a path if an attribute like [src] is specified to keep the original src
  filename intact but replace its path.

### Simple examples

```html
<!--
Change only the path of the src attribute and keep the original src filename.
This will replace the src path of many script tags if inside the build comment block.
-->

<!-- build:[src] js/ -->
<script src="my/deep/development/path/script.js"></script>
<!-- /build -->
<!-- this will change only the path to -->
<script src="js/script.js"></script>

<!-- build:remove -->
<p>This will be removed when any process is done</p>
<!-- /build -->

<!-- build:dist:remove -->
<p>But this one only when doing processhtml:dist</p>
<!-- /build -->

<!-- build:css style.min.css -->
<link rel="stylesheet" href="path/to/normalize.css">
<link rel="stylesheet" href="path/to/main.css">
<!-- /build -->
<!-- when any process done will change to -->
<link rel="stylesheet" href="style.min.css">

<!-- build:template
<p>Hello, <%= name %></p>
/build -->

<!--
notice that the template block is commented
to prevent breaking the html file and keeping it functional
-->
```

### Overview
In your project's Gruntfile, add a section named `processhtml` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  processhtml: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
})
```

### Options

#### options.process
Type: `Boolean`
Default value: `false`

Process the entire `html` file through `grunt.template.process`, a default object with the buld target will be passed to the
template in the form of `{environment: target}` where environment will be the build target of the grunt task.

*Important note: The `process` option is not needed if you don't want to process the entire html file. See the example
below to see that you can have templates blocks to be processed.*

If you do wan't to process the whole file as a template, it will be compiled after compiling the inside template blocks
if any.

#### options.data
Type: `Object`
Default value: `{environment: target}`

An object `data` that is passed to the `html` file used to compile all template blocks and the entire file if `process`
is true.
If a custom object is passed as `data`, this will be merged with the default to keep the `environment` key intact.

### Usage Examples

#### Default Options
Set the task in your grunt file which is going to process the `index.html` file and save the output to
`dest/index.html`

```js
grunt.initConfig({
  processhtml: {
    options: {
      data: {
        message: 'Hello world!'
      }
    },
    files: {
      'dest/index.html': ['index.html']
    }
  }
});
```

#### What will be processed?
Following the previous task configuration, the `index.html` could look like this:

```html
<!doctype html>
<title>title</title>

<!-- build:[href] img/ -->
<link rel="apple-touch-icon-precomposed" href="my/theme/img/apple-touch-icon-precomposed.png">
<link rel="apple-touch-icon-precomposed" href="my/theme/img/apple-touch-icon-72x72-precomposed.png" sizes="72x72">
<!-- /build -->

<!-- build:css style.min.css -->
<link rel="stylesheet" href="normalize.css">
<link rel="stylesheet" href="main.css">
<!-- /build -->

<!-- build:template
<p><%= message %></p>
/build -->

<!-- build:remove -->
<p>This is the html file without being processed</p>
<!-- remove -->

<!-- build:js app.min.js -->
<script src="js/libs/require.js" data-main="js/config.js"></script>
<!-- /build -->
```

After processing this file, the output will be:

```html
<!doctype html>
<title>title</title>

<link rel="apple-touch-icon-precomposed" href="img/apple-touch-icon-precomposed.png">
<link rel="apple-touch-icon-precomposed" href="img/apple-touch-icon-72x72-precomposed.png" sizes="72x72">

<link rel="stylesheet" href="style.min.css">

<p>Hello world!</p>

<script src="app.min.js"></script>
```

#### Advanced example
In this example there are multiple targets where we can process the html file depending on which target is being run.

```js
grunt.initConfig({
  processhtml: {
    dev: {
      options: {
        data: {
          message: 'This is development environment'
        }
      },
      files: {
        'dest/index.html': ['index.html']
      }
    },
    dist: {
      options: {
        process: true
        data: {
          title: 'My app',
          message: 'This is production distribution'
        }
      }
    }
  }
});
```

The `html` to be processed:

```html
<!doctype html>
<!-- notice that no special comment is used here, as process is true.
if you don't mine having <%= title %> as the title of your app
when not being processed, is a perfectly valid title string -->
<title><%= title %></title>

<!-- build:css style.min.css -->
<link rel="stylesheet" href="normalize.css">
<link rel="stylesheet" href="main.css">
<!-- /build -->

<!-- build:template
<p><%= message %></p>
/build -->

<!-- build:remove -->
<p>This is the html file without being processed</p>
<!-- remove -->

<!-- build:dist:remove -->
<script src="js/libs/require.js" data-main="js/config.js"></script>
<!-- -->

<!-- build:template
<% if (environment === 'dev') { %>
<script src="app.js"></script>
<% } else { %>
<script src="app.min.js"></script>
<% } %>
/build -->
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
- 0.1.0 Initial release
