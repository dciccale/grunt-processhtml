# grunt-processhtml [![Build Status](https://travis-ci.org/dciccale/grunt-processhtml.png?branch=master)](https://travis-ci.org/dciccale/grunt-processhtml) [![NPM version](https://badge.fury.io/js/grunt-processhtml.png)](http://badge.fury.io/js/grunt-processhtml)

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

##### type
This is required.

Types: `js`, `jslist`, `css`, `csslist`, `remove`, `template` or `include`. or any html attribute if written like this: `[href]`, `[src]`, etc.

##### target
This is optional.

Is the target name of your grunt task, for example: `dist`. Is supported for all types, so you can always specify the target if needed.

##### value
Required for types: `js`, `css`, `include` and `[attr]`.

Optional for types: `remove`, `template`.

Could be a file name: `script.min.js` or a path if an attribute like `[src]` is specified to keep the original file name intact but replace its path.

### Simple examples

##### `build:js[:target] <value>`

Replace many script tags into one.

`[:target]` Optional build target.

`<value>` Required value: A file path.

```html
<!-- build:js app.min.js -->
<script src="my/lib/path/lib.js"></script>
<script src="my/deep/development/path/script.js"></script>
<!-- /build -->

<!-- changed to -->
<script src="app.min.js"></script>
```

##### `build:jslist[:target] <value>`

Recursively scans a directory and subdirectories for javascript files and adds them as script tags.  This task keeps the original comments so that the html file can be used live without needing a template.

`[:target]` Optional build target.

`<value>` Required value: A directory to recursively search for Javascript files to source

```html
<!-- build:jslist src/ -->
<!-- /build -->

<!-- changed to -->
<!-- build:jslist src/ -->
<script src="myapp/app.js"></script>
<script src="myapp/controllers/controllers.js"></script>
<!-- /build -->
```

##### `build:css[:target] <value>`

Replace many stylesheet link tags into one.

`[:target]` Optional build target.

`<value>` Required value: A file path.

```html
<!-- build:css style.min.css -->
<link rel="stylesheet" href="path/to/normalize.css">
<link rel="stylesheet" href="path/to/main.css">
<!-- /build -->

<!-- changed to -->
<link rel="stylesheet" href="style.min.css">
```

##### `build:csslist[:target] <value>`

Recursively scans a directory and subdirectories for css files and adds them as script tags.  This task keeps the original comments so that the html file can be used live without needing a template.

`[:target]` Optional build target.

`<value>` Required value: A directory to recursively search for CSS files to link

```html
<!-- build:csslist src/ -->
<!-- /build -->

<!-- changed to -->
<!-- build:csslist src/ -->
<link rel="stylesheet" href="css/style.css">
<link rel="stylesheet" href="css/blocks.css">
<!-- /build -->
```

##### `build:<[attr]>[:target] <value>`

Change the value of an attribute. In most cases using `[src]` and `[href]` will be enough but it works with any html attribute.

`<[attr]>` Required html attribute, i.e. `[src]`, `[href]`.

`[:target]` Optional build target.

`<value>` Required value: A path or a file path.

```html
<!-- If only a path is used, the original file name will remain -->

<!-- build:[src] js/ -->
<script src="my/lib/path/lib.js"></script>
<script src="my/deep/development/path/script.js"></script>
<!-- /build -->

<!-- changed the src attribute path -->
<script src="js/lib.js"></script>
<script src="js/script.js"></script>

<!-- build:[href] img/ -->
<link rel="apple-touch-icon-precomposed" href="skins/demo/img/icon.png">
<link rel="apple-touch-icon-precomposed" href="skins/demo/img/icon-72x72.png" sizes="72x72">
<!-- /build -->

<!-- changed the href attribute path -->
<link rel="apple-touch-icon-precomposed" href="img/icon.png">
<link rel="apple-touch-icon-precomposed" href="img/icon-72x72.png" sizes="72x72">

<!-- build:[class]:dist production -->
<html class="debug_mode">
<!-- /build -->

<!-- this will change the class to 'production' only when de 'dist' build is executed -->
<html class="production">

```

##### `build:include[:target] <value>`

Include an external file.

`[:target]` Optional build target.

`<value>` Required value: A file path.

```html
<!-- build:include header.html -->
This will be replaced by the content of header.html
<!-- /build -->

<!-- build:include:dev dev/content.html -->
This will be replaced by the content of dev/content.html
<!-- /build -->

<!-- build:include:dist dist/content.html -->
This will be replaced by the content of dist/content.html
<!-- /build -->
```

##### `build:template[:target]`

Process a template block with a data object inside [options.data](#optionsdata).

`[:target]` Optional build target.


```html
<!-- build:template
<p>Hello, <%= name %></p>
/build -->

<!--
notice that the template block is commented
to prevent breaking the html file and keeping it functional
-->
```

##### `build:remove[:target]`

Remove a block.

`[:target]` Optional build target

```html
<!-- build:remove -->
<p>This will be removed when any processhtml target is done</p>
<!-- /build -->

<!-- build:remove:dist -->
<p>But this one only when doing processhtml:dist target</p>
<!-- /build -->
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

Process the entire `html` file through `grunt.template.process`, a default object with the build target will be passed to the
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

#### options.templateSettings
Type: `Object`
Default value: `null` (Will use default grunt template delimiters `<%` and `%>`)

Define the `templateSettings` option with a custom `opener` and `closer` delimiters to customize the
template syntax delimiters.

```javascript
templateSettings: {
  opener: '{{',
  closer: '}}'
}
```

#### options.includeBase
Type: `String`
Default value: `null` (Will use the path of the including file)

Specify an optional path to look for include files. ie, `app/assets/includes/`

#### options.commentMarker
Type: `String`
Default value: `build`

Specify the word used to indicate the special begin/end comments.  This is useful if you want to use this plugin
in conjuction with other plugins that use a similar, conflicting `build:<type>` comment
(such as [grunt-usemin](https://github.com/yeoman/grunt-usemin)).

With `options.commentMarker` set to `process`, a typical comment would look like:

```html
<!-- process:<type>[:target] [value] -->
...
<!-- /process -->
```

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
    dist: {
      files: {
        'dest/index.html': ['index.html']
      }
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

<!-- build:js app.min.js -->
<script src="js/libs/require.js" data-main="js/config.js"></script>
<!-- /build -->

<!-- build:include header.html -->
This will be replaced by the content of header.html
<!-- /build -->

<!-- build:template
<p><%= message %></p>
/build -->

<!-- build:remove -->
<p>This is the html file without being processed</p>
<!-- /build -->
```

After processing this file, the output will be:

```html
<!doctype html>
<title>title</title>

<link rel="apple-touch-icon-precomposed" href="img/apple-touch-icon-precomposed.png">
<link rel="apple-touch-icon-precomposed" href="img/apple-touch-icon-72x72-precomposed.png" sizes="72x72">

<link rel="stylesheet" href="style.min.css">

<script src="app.min.js"></script>

<h1>Content from header.html</h1>

<p>Hello world!</p>
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
        'dev/index.html': ['index.html']
      }
    },
    dist: {
      options: {
        process: true
        data: {
          title: 'My app',
          message: 'This is production distribution'
        }
      },
      files: {
        'dest/index.html': ['index.html']
      }
    },
    custom: {
      options: {
        templateSettings: {
          opener: '{{',
          closer: '}}'
        },
        data: {
          message: 'This has custom template delimiters'
        }
      },
      files: {
        'custom/custom.html': ['custom.html']
      }
    }
  }
});
```

The `index.html` to be processed (the `custom.html` is below):

```html
<!doctype html>
<!-- notice that no special comment is used here, as process is true.
if you don't mind having <%= title %> as the title of your app
when not being processed; is a perfectly valid title string -->
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
<!-- /build -->

<!-- build:remove:dist -->
<script src="js/libs/require.js" data-main="js/config.js"></script>
<!-- /build -->

<!-- build:template
<% if (environment === 'dev') { %>
<script src="app.js"></script>
<% } else { %>
<script src="app.min.js"></script>
<% } %>
/build -->
```

The `custom.html` to be processed:
```html
<!doctype html>
<html>
  <head>
    <title>Custom template delimiters example</title>
  </head>

  <body>
    <!-- build:template
    {{= message }}
    /build -->
  </body>
</html>
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
- 0.2.7 Added `commentMarker` option
- 0.2.6 Fix #14 and added grunt-release
- 0.2.5 Create first tag using grunt-release
- 0.2.3 Fix #8
- 0.2.2 Small code refactor
- 0.2.1 Added `templateSettings` option tu customize template delimiters
- 0.2.0 Added the `build:include` feature to include any external file
- 0.1.1 Lint js files inside tasks/lib/
- 0.1.0 Initial release
