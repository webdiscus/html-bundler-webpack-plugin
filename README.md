<div align="center">
    <h1>
        <img height="200" src="https://raw.githubusercontent.com/webdiscus/html-bundler-webpack-plugin/master/images/plugin-logo.png">
        <br>
        <a href="https://github.com/webdiscus/html-bundler-webpack-plugin">HTML Bundler Plugin for Webpack</a>
    </h1>
    <div>The plugin renders HTML templates with referenced resources of styles, scripts, images</div>
</div>

---
[![npm](https://img.shields.io/npm/v/html-bundler-webpack-plugin?logo=npm&color=brightgreen "npm package")](https://www.npmjs.com/package/html-bundler-webpack-plugin "download npm package")
[![node](https://img.shields.io/node/v/html-bundler-webpack-plugin)](https://nodejs.org)
[![node](https://img.shields.io/github/package-json/dependency-version/webdiscus/html-bundler-webpack-plugin/peer/webpack)](https://webpack.js.org/)
[![Test](https://github.com/webdiscus/html-bundler-webpack-plugin/actions/workflows/test.yml/badge.svg)](https://github.com/webdiscus/html-bundler-webpack-plugin/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/webdiscus/html-bundler-webpack-plugin/branch/master/graph/badge.svg?token=Q6YMEN536M)](https://codecov.io/gh/webdiscus/html-bundler-webpack-plugin)
[![node](https://img.shields.io/npm/dm/html-bundler-webpack-plugin)](https://www.npmjs.com/package/html-bundler-webpack-plugin)

## HTML as entrypoint

The plugin supports HTML templates as entrypoints.\
In HTML templates can be referenced any resources such as JS, SCSS, images and other assets, similar to how it works in Vite.\
For example: 
- `<link href="@images/favicon.png" type="image/png" rel=icon />`
- `<link href="./style.scss" rel="stylesheet">`
- `<script src="./App.tsx" defer="defer"></script>`
- `<img src="@images/fig.png" srcset="@images/fig-640.png 640w, @images/fig-800.png 800w" />`
   
Note: `@images` is the Webpack alias to a source images directory.


The plugin detects all source files referenced in HTML and extracts processed assets to the output directory.
In the generated HTML and CSS, the plugin substitutes the source filenames with the output filenames.

<img width="830" style="max-width: 100%;" src="https://raw.githubusercontent.com/webdiscus/html-bundler-webpack-plugin/devel/images/workflow.png">

### 💡 Highlights

- An [entry point](#option-entry) is an HTML template.
- Binding the source **script/style** filenames directly in HTML using `<script>` and `<link>`.
- Resolving [source](#loader-option-sources) asset files specified in standard attributes `href` `src` `srcset` etc.
- Inline [JS](#recipe-inline-js), [CSS](#recipe-inline-css), [SVG](#recipe-inline-image), [PNG](#recipe-inline-image) without additional plugins and loaders.
- Support for [template engines](#recipe-template-engine) such as [Eta](#using-template-eta), [EJS](#using-template-ejs), [Handlebars](#using-template-handlebars), [Nunjucks](#using-template-nunjucks), [LiquidJS](#using-template-liquidjs) and others.
- Dynamically loading template variables after changes using the [data](#loader-option-data) option.
- Auto generation of `<link rel="preload">` to [preload](#option-preload) fonts, images, video, scripts, styles, etc.


### ✅ Profit

You can specify the script and style source files directly in an HTML template,
no longer need to define them in the Webpack entry or import styles in JavaScript.

### ❓Question / Feature Request / Bug

If you have discovered a bug or have a feature suggestion, feel free to create an [issue](https://github.com/webdiscus/html-bundler-webpack-plugin/issues) on GitHub.


## 🔆 What's New in v2

- **NEW:** added support for importing style files in JavaScript.\
  **Note:** this feature was added for compatibility with `React` projects.\
  The importing styles in JavaScript is the `bad practice`. This is the `wrong way`.\
  In new projects you should specify style source files directly in HTML. This the `right way`.
- **BREAKING CHANGE:** Upgrade the default [Eta](https://eta.js.org) templating engine from `v2` to `v3`.\
  If you use the `Eta` syntax, may be you need to update templates.

For full release notes see the [changelog](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/CHANGELOG.md).

---

## Simple usage example

Add source scripts and styles directly to HTML:

```html
<html>
<head>
  <!-- specify source style files -->
  <link href="./style.scss" rel="stylesheet">
  <!-- specify source script files here and/or in body -->
  <script src="./main.js" defer="defer"></script>
</head>
<body>
  <h1>Hello World!</h1>
  <!-- specify source image files -->
  <img src="./map.png">
</body>
</html>
```

The generated HTML contains the output filenames of the processed source files,
while the `script` and `link` tags remain in place:

```html
<html>
<head>
  <link href="assets/css/style.05e4dd86.css" rel="stylesheet">
  <script src="assets/js/main.f4b855d8.js" defer="defer"></script>
</head>
<body>
  <h1>Hello World!</h1>
  <img src="assets/img/map.58b43bd8.png">
</body>
</html>
```

Add the HTML templates in the `entry` option (syntax is identical to [Webpack entry](https://webpack.js.org/configuration/entry-context/#entry)):

```js
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  plugins: [
    new HtmlBundlerPlugin({
      // define a relative or absolute path to template pages
      entry: 'src/views/',
      // OR define templates manually
      entry: {
        index: 'src/views/home.html', // => dist/index.html
        'news/sport': 'src/views/news/sport/index.html', // => dist/news/sport.html
      },
    }),
  ],
  // ... loaders for styles, images, etc.
};
```

See the [complete Webpack configuration](#simple-webpack-config).

> How to create multiple HTML pages with html-bundler-webpack-plugin, see the [boilerplate](https://github.com/webdiscus/webpack-html-scss-boilerplate).


<a id="contents" name="contents" href="#contents"></a>
## Contents

1. [Features](#features)
1. [Install and Quick start](#install)
1. [Webpack options](#webpack-options)
   - [output](#webpack-option-output)
     - [path](#webpack-option-output-path)
     - [publicPath](#webpack-option-output-publicPath)
     - [filename](#webpack-option-output-filename)
   - [entry](#webpack-option-entry)
1. [Plugin options](#plugin-options)
   - [test](#option-test) (RegEx to handle matching templates)
   - [entry](#option-entry) (define templates or path to templates)
   - [outputPath](#option-outputPath) (output path of HTML file)
   - [filename](#option-filename) (output filename of HTML file)
   - [js](#option-js) (options to extract JS)
   - [css](#option-css) (options to extract CSS)
   - [postprocess](#option-postprocess)
   - [preload](#option-preload) (inject preload link tags)
   - [minify](#option-minify) (minification of generated HTML)
   - [minifyOptions](#option-minifyOptions) (minification options for auto minify)
   - [extractComments](#option-extractComments)
   - [verbose](#option-verbose)
   - [watchFiles](#option-watchFiles)
   - [loaderOptions](#option-loaderOptions) (simplify access to loader options)
1. [Loader options](#loader-options)
   - [sources](#loader-option-sources) (processing of custom tag attributes)
   - [root](#loader-option-root) (allow to resolve root path in attributes)
   - [preprocessor](#loader-option-preprocessor) (templating)
     - [eta](#loader-option-preprocessorOptions-eta)
     - [ejs](#loader-option-preprocessorOptions-ejs)
     - [handlebars](#loader-option-preprocessorOptions-handlebars)
     - [nunjucks](#loader-option-preprocessorOptions-nunjucks)
     - [custom](#loader-option-preprocessor-custom) (using any template engine)
   - [preprocessorOptions](#loader-option-preprocessorOptions) (templating options)
   - [data](#loader-option-data) (pass data into templates)
1. [Using template engines](#recipe-template-engine)
   - [Eta](#using-template-eta)
   - [EJS](#using-template-ejs)
   - [Handlebars](#using-template-handlebars)
   - [Mustache](#using-template-mustache)
   - [Nunjucks](#using-template-nunjucks)
   - [LiquidJS](#using-template-liquidjs)
   - [Pug](https://github.com/webdiscus/pug-plugin)
1. [Setup HMR (Live Reload)](#setup-hmr)
1. [Recipes](#recipes)
   - [How to keep source folder structure in output directory](#recipe-entry-keep-folder-structure)
   - [How to use source images in HTML](#recipe-use-images-in-html)
   - [How to resize and generate responsive images](#recipe-responsive-images)
   - [How to preload fonts](#recipe-preload-fonts)
   - [How to inline CSS in HTML](#recipe-inline-css)
   - [How to inline JS in HTML](#recipe-inline-js)
   - [How to inline SVG, PNG images in HTML](#recipe-inline-image)
   - [How to process a PHP template](#recipe-preprocessor-php)
   - [How to pass data into multiple templates](#recipe-pass-data-to-templates)
   - [How to use some different template engines](#recipe-diff-templates)
   - [How to config `splitChunks`](#recipe-split-chunks)
   - [How to split CSS files](#recipe-split-css)
   - [How to keep package name for split chunks from **node_modules**](#recipe-split-chunks-keep-module-name)
1. Demo examples
   - Multiple page e-shop template (`Handlebars`) [demo](https://alpine-html-bootstrap.vercel.app/) | [source](https://github.com/webdiscus/demo-shop-template-bundler-plugin)
   - Design system NIHR: Components, Elements, Layouts (`Handlebars`) [demo](https://design-system.nihr.ac.uk) | [source](https://github.com/webdiscus/design-system)
   - Asia restaurant (`Nunjucks`) [demo](https://webdiscus.github.io/demo-asia-restaurant-bundler-plugin) | [source](https://github.com/webdiscus/demo-asia-restaurant-bundler-plugin)
   - 10up / Animation Best Practices [demo](https://animation.10up.com/) | [source](https://github.com/10up/animation-best-practices)
1. Code examples
   - How to use the tailwindcss [source](https://github.com/webdiscus/html-bundler-webpack-plugin/tree/master/examples/tailwindcss/)

<a id="features" name="features" href="#features"></a>
## Features

- HTML template is the entry point for all resources
- extracts CSS from the source style filename specified in HTML via a `<link>` tag
- extracts JS from the source script filename specified in HTML via a `<script>` tag
- resolves source filenames in the CSS `url()` and in HTML attributes
- extracts resolved resources to output directory
- generated HTML contains output filenames
- support the module types `asset/resource` `asset/inline` `asset` `asset/source` ([*](#note-asset-source))
- `inline CSS` in HTML
- `inline JavaScript` in HTML
- `inline image` as `base64 encoded` data-URL for PNG, JPG, etc. in HTML and CSS
- `inline SVG` as SVG tag in HTML
- `inline SVG` as `utf-8` data-URL in CSS
- auto generation of `<link rel="preload">` to preload used assets
- support the `auto` publicPath
- enable/disable extraction of comments to `*.LICENSE.txt` file
- supports template engines such as [Eta](https://eta.js.org), [EJS](https://ejs.co), [Handlebars](https://handlebarsjs.com), [Nunjucks](https://mozilla.github.io/nunjucks/), [LiquidJS](https://github.com/harttle/liquidjs) and others
- support for both `async` and `sync` preprocessor
- dynamically loading template variables after changes using the [data](#loader-option-data) option
- minification of generated HTML
- support for importing style files in JavaScript (not recomended, because it is `bad practice`)

<a id="note-asset-source" name="note-asset-source" href="#note-asset-source"></a>
(*) - `asset/source` works currently for SVG only, in a next version will work for other files too

Just one HTML bundler plugin replaces the most used functionality of the plugins and loaders:

| Package                                                                                                  | Features                                                            | 
|----------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------|
| [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin)                                   | creates HTML and inject `script` tag for compiled JS file into HTML |
| [mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin)                    | injects `link` tag for processed CSS file into HTML                 |
| [webpack-remove-empty-scripts](https://github.com/webdiscus/webpack-remove-empty-scripts)                | removes generated empty JS files                                    |
| [html-webpack-inject-preload](https://github.com/principalstudio/html-webpack-inject-preload)            | inject preload link tags                                            |
| [preload-webpack-plugin](https://github.com/vuejs/preload-webpack-plugin)                                | inject preload link tags                                            |
| [html-loader](https://github.com/webpack-contrib/html-loader)                                            | exports HTML                                                        |
| [html-webpack-inline-source-plugin](https://github.com/dustinjackson/html-webpack-inline-source-plugin)  | inline JS and CSS into HTML from sources                            |
| [style-loader](https://github.com/webpack-contrib/style-loader)                                          | injects an inline CSS into HTML                                     |
| [posthtml-inline-svg](https://github.com/andrey-hohlov/posthtml-inline-svg)                              | injects an inline SVG icon into HTML                                |
| [resolve-url-loader](https://github.com/bholloway/resolve-url-loader)                                    | resolves a relative URL in CSS                                      |
| [svg-url-loader](https://github.com/bhovhannes/svg-url-loader)                                           | encodes a SVG data-URL as utf8                                      |
| [handlebars-webpack-plugin](https://github.com/sagold/handlebars-webpack-plugin)                         | renders handlebars templates                                        |


<a id="install" name="install" href="#install"></a>
## Install and Quick start

Install the `html-bundler-webpack-plugin`:
```bash
npm install html-bundler-webpack-plugin --save-dev
```

Install additional packages for styles:
```bash
npm install css-loader sass sass-loader --save-dev
```

For example, there is a template _./src/views/home/index.html_:

```html
<html>
<head>
  <title><%= title %></title>
  <link href="./style.scss" rel="stylesheet">
  <script src="./main.js" defer="defer"></script>
</head>
<body>
  <h1>Hello <%= name %>!</h1>
  <img src="./map.png">
</body>
</html>
```

To compile this template use the following Webpack configuration:

<a id="simple-webpack-config" name="simple-webpack-config" href="#simple-webpack-config"></a>
```js
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        // define templates here
        index: { // => dist/index.html (key is output filename w/o '.html')
          import: 'src/views/home.html', // template file
          data: { title: 'Homepage', name: 'Heisenberg' } // pass variables into template
        },
        'news/sport': 'src/views/news/sport/index.html', // => dist/news/sport.html
      },
      js: {
        // output filename of JS extracted from source script specified in `<script>`
        filename: 'assets/js/[name].[contenthash:8].js',
      },
      css: {
        // output filename of CSS extracted from source file specified in `<link>`
        filename: 'assets/css/[name].[contenthash:8].css',
      },
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(css|sass|scss)$/,
        use: ['css-loader', 'sass-loader'],
      },
      {
        test: /\.(ico|png|jp?g|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext][query]',
        },
      },
    ],
  },
};
```

> **Note**
>
> To define the JS output filename, use the `js.filename` option of the plugin.\
> Don't use Webpack's `output.filename`, hold all relevant settings in one place - in plugin options.\
> Both places have the same effect, but `js.filename` has priority over `output.filename`.

No additional template loader is required. The plugin handels templates with base `EJS`-like syntax automatically.
The default templating engine is [Eta](https://eta.js.org).

For using the native `EJS` syntax see [Templating with EJS](#using-template-ejs).\
For using the `Handlebars` see [Templating with Handlebars](#using-template-handlebars).\
For other templates see [Template engines](#recipe-template-engine).

For custom templates you can use the [preprocessor](#loader-option-preprocessor) option to handels any template engine.

---


#### [↑ back to contents](#contents)
<a id="webpack-options" name="webpack-options" href="#webpack-options"></a>
## Webpack options

Important Webpack options used to properly configure this plugin.

<a id="webpack-option-output" name="webpack-options-output" href="#webpack-options-output"></a>
<a id="webpack-option-output-path" name="webpack-options-output-path" href="#webpack-options-output-path"></a>
### `output.path`
Type: `string` Default: `path.join(process.cwd(), 'dist')`

The root output directory for all processed files, as an absolute path.\
You can omit this option, then all generated files will be saved under `dist/` in your project directory.

<a id="webpack-option-output-publicPath" name="webpack-options-output-publicPath" href="#webpack-options-output-publicPath"></a>
### `output.publicPath`
Type: `string|function` Default: `auto`

The value of the option is prefixed to every URL created by this plugin.
If the value is not the empty string or `auto`, then the option must end with `/`.

The possible values:
- `publicPath: 'auto'` - automatically determines a path of an asset relative of their issuer.
  The generated HTML page can be opened directly form the local directory and all js, css and images will be loaded in a browser.
- `publicPath: ''` - a path relative to an HTML page, in the same directory. The resulting path is different from a path generated with  `auto`.
- `publicPath: '/'` - a path relative to `document root` directory on a server
- `publicPath: '/assets/'` - a sub path relative to `document root` directory on a server
- `publicPath: '//cdn.example.com/'` - an external URL with the same protocol (`http://` or `https://`)
- `publicPath: 'https://cdn.example.com/'` - an external URL with the `https://` protocol only

<a id="webpack-option-output-filename" name="webpack-options-output-filename" href="#webpack-options-output-filename"></a>
### `output.filename`
Type: `string|function` Default: `[name].js`

The output name of a generated JS file.\
Highly recommended to define the filename in the Plugin option [`js.filename`](#option-js).

The output name of a generated CSS file is determined in the Plugin option [`css.filename`](#option-css).

Define output JS and CSS filenames in the Plugin option, in one place:

```js
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
module.exports = {
  plugins: [
    new HtmlBundlerPlugin({
      js: {
        // define the output name of a generated JS file here
        filename: 'assets/js/[name].[contenthash:8].js',
      },
      css: {
        // define the output name of a generated CSS file here
        filename: 'assets/css/[name].[contenthash:8].css',
      },
    }),
  ],
};
```

<a id="webpack-option-entry" name="webpack-options-entry" href="#webpack-options-entry"></a>
### `entry`

The starting point to build the bundle.

> **Note**
>
> Using this plugin an `entry point` is an HTML template.
> All script and style source files must be specified in the HTML template.

You can use the Webpack `entry` option to define HTML templates,
but it is highly recommended to define all templates in plugin option [`entry`](#option-entry),
because it has an additional `data` property (not available in the Webpack entry)
to pass custom variables into the HTML template.

For details see the [plugin option `entry`](#option-entry).

#### [↑ back to contents](#contents)
<a id="plugin-options" name="plugin-options" href="#plugin-options"></a>
## Plugin options

<a id="option-test" name="option-test" href="#option-test"></a>
### `test`
Type: `RegExp` Default: `/\.(html|ejs|eta|hbs|handlebars|njk)$/`

The `test` option allows to handel only those templates as entry points that match the name of the source file.

For example, if you have other templates, e.g. `*.liquid`, as entry points, then you can set the option to match custom template files: `test: /\.(html|liquid)$/`.

The `test` value is used in the [default loader](#loader-options).

**Why is it necessary to define it? Can't it be automatically processed?**

This plugin is very powerful and has many experimental features not yet documented.
One of the next features will be the processing scripts and styles as entry points for library bundles without templates.
To do this, the plugin must differentiate between a template entry point and a script/style entry point.
This plugin can completely replace the functionality of mini-css-extract-plugin and webpack-remove-empty-scripts in future.

<a id="option-entry" name="option-entry" href="#option-entry"></a>
### `entry`
Type: `object` is identical to [Webpack entry](https://webpack.js.org/configuration/entry-context/#entry)
plus additional `data` property to pass custom variables into the HTML template.

Define all your HTML templates in the `entry` option.

An HTML template is a starting point for collecting all the dependencies used in your web application.
Specify source scripts (JS, TS) and styles (CSS, SCSS, LESS, etc.) directly in HTML.
The plugin automatically extracts JS and CSS whose source files are specified in an HTML template.

#### Simple syntax

The key of an entry object is the `output file` w/o extension, relative by the [`outputPath`](#option-outputPath) option.\
The value is the `source file`, absolute or relative by the Webpack config file.

```js
{
  entry: {
    index: 'src/views/home/index.html', // => dist/index.html
    'news/sport': 'src/views/news/sport/index.html', // => dist/news/sport.html
  },
}
```

#### Advanced syntax

The entry value might be an object:

```ts
type entryValue = {
  import: string,
  filename: string
  data: object|string,
}
```

- `import` - a source file, absolute or relative by the Webpack config file
- `filename` - an output file, relative by the 'outputPath' option
- `data` - a data passed into [`preprocessor`](#loader-option-preprocessor) to render a template with variables
     - type `object` - a data object is loaded once with Webpack start
     - type `string` - an absolute or relative filename of the JSON or JS file. The JS file must export an object. The data file will be reloaded after changes.

To pass global variables in all templates use the [data](#loader-option-data) loader option.

Usage example:

```js
{
  entry: {
    // output ./dist/news/sport.html
    'news/sport': { // the key is the output file name without '.html'
      import: 'src/views/news/sport.html',
      data: {
        title: 'Sport', // pass data as an object
      }
    },

    // output ./dist/about/index.html
    about: {
      import: 'src/views/about.html',
      filename: 'about/index.html', // define custom output filename
      data: 'src/data/about.json', // load data from JSON file
    },
  },
}
```

The data file _src/data/about.json_:
```json
{
  "title": "About"
}
```

> **Note**
>
> You can define templates both in Webpack `entry` and in the `entry` option of the plugin. The syntax is identical.
> But the `data` property can only be defined in the `entry` option of the plugin.


<a id="option-entry-path" name="option-entry-path" href="#option-entry-path"></a>
#### Entry as a path to templates

Type: `string`

You can define the entry as a path to recursively detect all templates from that directory.

When the value of the `entry` is a string, it must be an absolute or relative path to the templates' directory.
Templates matching the [test](#option-test) option are detected recursively from the path.
The output files will have the same folder structure as source template directory.

For example, there are files in the template directory `./src/views/`
```
./src/views/index.html
./src/views/about/index.html
./src/views/news/sport/index.html
./src/views/news/sport/script.js
./src/views/news/sport/style.scss
...
```

Define the entry option as the relative path to pages:
```js
new HtmlBundlerPlugin({
  entry: 'src/views/',
})
```

Files that are not matching to the [test](#option-test) option are ignored.
The output HTML filenames keep their source structure in the output directory relative to the entry path:

```
./dist/index.html
./dist/about/index.html
./dist/news/sport/index.html
...
```


If you need to modify the output HTML filename, use the [filename](#option-filename) option as the function.

For example, we want keep a source structure for all pages, 
while `./src/views/home/index.html` should not be saved as `./dist/home/index.htm`, but as `./dist/index.htm`:

```js
new HtmlBundlerPlugin({
  // path to templates
  entry: 'src/views/',

  filename: ({ filename, chunk: { name } }) => {
    // transform 'home/index' filename to output file 'index.html'
    if (name === 'home/index') {
      return 'index.html'; // save as index.html in output directory
    }
    // bypass the original structure
    return '[name].html';
  },
})
```

#### [↑ back to contents](#contents)
<a id="option-outputPath" name="option-outputPath" href="#option-outputPath"></a>
### `outputPath`
Type: `string` Default: `webpack.options.output.path`

The output directory for processed file. This directory can be relative by `webpack.options.output.path` or absolute.


<a id="option-filename" name="option-filename" href="#option-filename"></a>
### `filename`
Type: `string | Function` Default: `[name].html`

The HTML output filename relative by the [`outputPath`](#option-outputPath) option.

If type is `string` then following substitutions (see [output.filename](https://webpack.js.org/configuration/output/#template-strings) for chunk-level) are available in template string:
- `[id]` The ID of the chunk.
- `[name]` The filename without extension or path.
- `[contenthash]` The hash of the content.
- `[contenthash:nn]` The `nn` is the length of hashes (defaults to 20).

If type is `Function` then following arguments are available in the function:
- `@param {PathData} pathData` has the useful properties (see the [type PathData](https://webpack.js.org/configuration/output/#outputfilename)):
  - `pathData.filename` the full path to source file
  - `pathData.chunk.name` the name of entry key
- `@return {string}` The name or template string of output file.


#### [↑ back to contents](#contents)
<a id="option-js" name="option-js" href="#option-js"></a>
### `js`
Type: `Object`\
Default properties:
```js
{
  filename: '[name].js',
  chunkFilename: '[id].js',
  outputPath: null,
  inline: false,
}
```

- `filename` - an output filename of extracted JS. Details see by [filename option](#option-filename).
- `chunkFilename` - an output filename of non-initial chunk files. Details see by [chunkFilename](https://webpack.js.org/configuration/output/#outputchunkfilename).
- `outputPath` - an output path of extracted JS. Details see by [outputPath option](#option-outputPath).
- `inline` - globally inline all extracted JS into HTML, available values:
  - `false` - extract processed JS in an output file, defaults
  - `true` - inline processed JS into HTML
  - `'auto'` - in `development` mode - inline JS, in `production` mode - extract in a file

> **Note**
> 
> The `filename` and `chunkFilename` options are the same as in Webpack `output` options, just defined in one place along with other relevant plugin options.
> You don't need to define them in the in Webpack `output` options anymore. Keep the config clean & clear.

The `test` property absent because all JS files specified in `<script>` tag are automatically detected.

This is the option to extract JS from a script source file specified in the HTML tag:
```html
<script src="./main.js"></script>
```

The default JS output filename is `[name].js`.
You can specify your own filename using [webpack filename substitutions](https://webpack.js.org/configuration/output/#outputfilename):

```js
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
module.exports = {
  plugins: [
    new HtmlBundlerPlugin({
      js: {
        filename: 'assets/js/[name].[contenthash:8].js',
      },
    }),
  ],
};
```

The `[name]` is the base filename script.
For example, if source file is `main.js`, then output filename will be `assets/js/main.1234abcd.js`.\
If you want to have a different output filename, you can use the `filename` options as the [function](https://webpack.js.org/configuration/output/#outputfilename).

The `chunkFilename` option only takes effect if you have the `optimization.splitChunks` option.

For example:


```js
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
module.exports = {
  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: 'src/views/index.html',
      },
      js: {
        filename: 'assets/js/[name].[contenthash:8].js',
        chunkFilename: 'assets/js/[id].[contenthash:8].js',
      },
    }),
  ],
  optimization: {
    splitChunks: {
      cacheGroups: {
        scripts: {
          test: /\.(js|ts)$/, // <= IMPORTANT: split only JS files
          chunks: 'all',
        },
      },
    },
  },
};
```

> **Warning**
> 
> Webpack tries to split and concatenate chunks of all files (templates, styles, scripts) into jumbles.
> Therefore, the `test` option `MUST` be specified to match only source JS files, otherwise Webpack will generate **invalid output files**.

Also see [How to keep package name for split chunks from **node_modules**](#recipe-split-chunks-keep-module-name).

#### [↑ back to contents](#contents)
<a id="option-css" name="option-css" href="#option-css"></a>
### `css`
Type: `Object`\
Default properties:
```js
{
  test: /\.(css|scss|sass|less|styl)$/,
  filename: '[name].css',
  outputPath: null,
  inline: false,
}
```

- `test` - an RegEpx to process all source styles that pass test assertion
- `filename` - an output filename of extracted CSS. Details see by [filename option](#option-filename).
- `outputPath` - an output path of extracted CSS. Details see by [outputPath option](#option-outputPath).
- `inline` - globally inline all extracted CSS into HTML, available values:
  - `false` - extract processed CSS in an output file, defaults
  - `true` - inline processed CSS into HTML via `style` tag
  - `'auto'` - in `development` mode - inline CSS, in `production` mode - extract in a file

This is the option to extract CSS from a style source file specified in the HTML tag:
```html
<link href="./style.scss" rel="stylesheet">
```

> **Warning**
>
> Don't import source styles in JavaScript! Styles must be specified directly in HTML.
> Don't define source JS files in Webpack entry! Scripts must be specified directly in HTML.

The default CSS output filename is `[name].css`.
You can specify your own filename using [webpack filename substitutions](https://webpack.js.org/configuration/output/#outputfilename):

```js
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
module.exports = {
  plugins: [
    new HtmlBundlerPlugin({
      css: {
        filename: 'assets/css/[name].[contenthash:8].css',
      },
    }),
  ],
};
```

The `[name]` is the base filename of a loaded style.
For example, if source file is `style.scss`, then output filename will be `assets/css/style.1234abcd.css`.\
If you want to have a different output filename, you can use the `filename` options as the [function](https://webpack.js.org/configuration/output/#outputfilename).

> **Warning**
>
> Don't use `mini-css-extract-plugin` because the bundler plugin extracts CSS much faster than other plugins.
> 
> Don't use `resolve-url-loader` because the bundler plugin resolves all URLs in CSS, including assets from node modules.
> 
> Don't use `style-loader` because the bundler plugin can auto inline CSS.


#### [↑ back to contents](#contents)
<a id="option-postprocess" name="option-postprocess" href="#option-postprocess"></a>
### `postprocess`
Type:
```ts
type postprocess = (
  content: string,
  info: ResourceInfo,
  compilation: Compilation,
) => string|null;

type ResourceInfo = {
  verbose: boolean,
  isEntry: boolean,
  filename:
    | string
    | ((pathData: PathData) => string),
  outputPath: string,
  sourceFile: string,
  assetFile: string,
};
```

Default: `null`

Called after a source of an asset module is rendered, but not yet processed by other plugins.

The `postprocess` have the following arguments:

- `content: string` - a content of processed file
- `info: ResourceInfo` - an info about current file
- `compilation: Compilation` - the Webpack [compilation object](https://webpack.js.org/api/compilation-object/)

The `ResourceInfo` have the following properties:

- `verbose: boolean` - the value defined in the [`verbose`](#option-verbose) option
- `isEntry: boolean` - if is `true`, the resource is the entry point, otherwise is a resource loaded in the entry point
- `filename: string|function` - a filename of the resource, see [filename](https://webpack.js.org/configuration/output/#outputfilename)
- `outputPath: string` - a full path of the output directory
- `sourceFile: string` - a full path of the source file, without URL query
- `assetFile: string` - an output asset file relative by outputPath

Return new content as a `string`.
If return `null`, the result processed via Webpack plugin is ignored and will be saved a result processed via the loader.


#### [↑ back to contents](#contents)
<a id="option-preload" name="option-preload" href="#option-preload"></a>
### `preload`
Type: `Array<preload>` Default: `null`
```ts
type preload = {
  test: RegExp,
  as: string,
  rel?: string,
  type?: string,
  attributes?: {},
};
```

Generates and injects preload tags `<link rel="preload">` in the head before all `link` or `script` tags for all matching source assets resolved in templates and styles.

The descriptions of the properties:

- `test` - an RegEpx to match source asset files.
- `as` - a content type, one of `audio` `document` `embed` `font` `image` `object` `script` `style` `track` `video` `worker`
- `rel` - a value indicates how to load a resource, one of `preload` `prefetch` , defaults `preload`
- `type` - a [MIME type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types) of the content.\
  Defaults the type is detected automatically, for example: 
  - `map.png` as `image/png`
  - `map.jpg` as `image/jpeg`
  - `map.svg` as `image/svg+xml`
  - `film.mp4` as `video/mp4`
  - `film.ogv` as `video/ogg`
  - `film.webm` as `video/webm`
  - `sound.mp3` as `audio/mpeg`
  - `sound.oga` as `audio/ogg`
  - `sound.weba` as `audio/webm`
  - etc.
- `attributes` - an object with additional custom attributes like `crossorigin` `media` etc.,\
  e.g. `attributes: { crossorigin: true }`, `attributes: { media: '(max-width: 900px)' }`.\
  Defaults `{}`.

If you define the `attributes` than you can write the `as`, `rel` and `type` properties in the `attributes`.

For example:
```js
{
  test: /\.(ttf|woff2?)$/,
  attributes: { as: 'font', rel: 'prefetch', crossorigin: true },
},
```

#### Preload styles

```js
preload: [
  {
    test: /\.(css|scss|less)$/,
    as: 'style',
  },
],
```

The generated preload tag like following:
```html
<link rel="preload" href="css/style.1f4faaff.css" as="style">
```

#### Preload scripts

```js
preload: [
  {
    test: /\.(js|ts)$/,
    as: 'script',
  },
],
```

The generated preload tag like following:
```html
<link rel="preload" href="js/main.c608b1cd.js" as="script">
```

#### Preload images

To preload all images use the options:

```js
preload: [
  {
    test: /\.(png|jpe?g|webp|svg)$/,
    as: 'image',
  },
],
```

The generated preload tags like following:
```html
<link rel="preload" href="img/apple.697ef306.png" as="image" type="image/png">
<link rel="preload" href="img/lemon.3666c92d.svg" as="image" type="image/svg+xml">
```

You can preload images with a URL query, e.g. `image.png?size=640`, using the `media` attribute:

```js
preload: [
  {
    test: /\.(png|jpe?g|webp)\?.*size=480/,
    attributes: { as: 'image', media: '(max-width: 480px)' },
  },
  {
    test: /\.(png|jpe?g|webp)\?.*size=640/,
    attributes: { as: 'image', media: '(max-width: 640px)' },
  },
],
```

> **Note**
> 
> The `media` attribute be useful when used [responsive-loader](https://www.npmjs.com/package/responsive-loader).


#### Preload fonts

```js
preload: [
  {
    test: /\.(ttf|woff2?)$/,
    attributes: { as: 'font', crossorigin: true },
  },
],
```

> **Note**
> 
> Font preloading requires the `crossorigin` attribute to be set.
> See [font preload](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/preload#what_types_of_content_can_be_preloaded).


#### Preload tags order

The generated preload tags are grouped by content type and sorted in the order of the specified `preload` options.

For example, there is an HTML template with specified source assets:

```html
<html>
<head>
  <script src="./main.js" defer></script>
  <link href="./style.scss" rel="stylesheet" />
</head>
<body>
  <img src="./apple.png" alt="apple">
  <script src="./app.js"></script>
  <img src="./lemon.svg" alt="lemon">
</body>
</html>
```

Specify the order of preload tags:
```js
preload: [
  // 1. preload images
  {
    test: /\.(png|jpe?g|webp|svg)$/,
    as: 'image',
  },
  // 2. preload styles
  {
    test: /\.(css|scss)$/,
    as: 'style',
  },
  // 3. preload scripts
  {
    test: /\.(js|ts)$/,
    as: 'script',
  },
],
```

The generated HTML contains the preload tags exactly in the order of `preload` options:

```html
<html>
<head>
  <!-- 1. preload images -->
  <link rel="preload" href="img/apple.697ef306.png" as="image" type="image/png">
  <link rel="preload" href="img/lemon.3666c92d.svg" as="image" type="image/svg+xml">
  <!-- 2. preload styles -->
  <link rel="preload" href="css/style.1f4faaff.css" as="style">
  <!-- 3. preload scripts -->
  <link rel="preload" href="js/main.c608b1cd.js" as="script">
  <link rel="preload" href="js/app.2c8d13ac.js" as="script">
  
  <script src="js/main.c608b1cd.js" defer></script>
  <link href="css/style.1f4faaff.css" rel="stylesheet" />
</head>
<body>
  <img src="img/apple.697ef306.png" alt="apple">
  <script src="js/app.2c8d13ac.js"></script>
  <img src="img/lemon.3666c92d.svg" alt="lemon">
</body>
</html>
```


#### [↑ back to contents](#contents)
<a id="option-minify" name="option-minify" href="#option-minify"></a>
### `minify`
Type: `Object|string|boolean` Default: `false`

For minification generated HTML is used the [html-minifier-terser](https://github.com/terser/html-minifier-terser) with the following `default options`:
```js
{
  collapseWhitespace: true,
  keepClosingSlash: true,
  removeComments: true,
  removeRedundantAttributes: false, // prevents styling bug when input "type=text" is removed
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  useShortDoctype: true,
  minifyCSS: true,
  minifyJS: true,
}
```

Possible values:
- `false` - disable minification
- `true` - enable minification with default options
- `auto` - in `development` mode disable minification, in `production` mode enable minification with default options,
  use [minifyOptions](#option-minifyOptions) to customize options
- `{}` - enable minification with custom options, this object are merged with `default options`\
  see [options reference](https://github.com/terser/html-minifier-terser#options-quick-reference)


<a id="option-minifyOptions" name="option-minifyOptions" href="#option-minifyOptions"></a>
### `minifyOptions`
Type: `Object` Default: `null`

When the [minify](#option-minify) option is set to `auto`, you can configure minification options using the `minifyOptions`.


#### [↑ back to contents](#contents)
<a id="option-extractComments" name="option-extractComments" href="#option-extractComments"></a>
### `extractComments`
Type: `boolean` Default: `false`

Enable/disable extracting comments from source scripts to the `*.LICENSE.txt` file.

When using `splitChunks` optimization for node modules containing comments,
Webpack extracts those comments into a separate text file.
By default, the plugin don't create such unwanted text files.
But if you want to extract files like `*.LICENSE.txt`, set this option to `true`.


<a id="option-verbose" name="option-verbose" href="#option-verbose"></a>
### `verbose`
Type: `string|boolean` Default: `false`

The verbose option allows to display in console the processing information about extracted resources.
All resources are grouped by their issuers.

Possible values:
- `false` - do not display information
- `true` - display information
- `auto` - in `development` mode enable verbose, in `production` mode disable verbose

> **Note**
>
> If you want to colorize the console output in your app, use the best Node.js lib [ansis][ansis].


#### [↑ back to contents](#contents)
<a id="option-watchFiles" name="option-watchFiles" href="#option-watchFiles"></a>
### `watchFiles`
Type:
```ts
type watchFiles = {
  paths?: Array<string>;
  files?: Array<RegExp>;
  ignore?: Array<RegExp>;
}
```

Default:
```js
watchFiles: {
  paths: ['./src'], 
  files: [/\.(html|ejs|eta)$/],
  ignore: [
    /[\\/](node_modules|dist|test)$/, // ignore standard project dirs
    /[\\/]\..+$/, // ignore hidden dirs and files, e.g.: .git, .idea, .gitignore, etc.
    /package(?:-lock)*\.json$/, // ingnore npm files
    /webpack\.(.+)\.js$/, // ignore Webpack config files
    /\.(je?pg|png|ico|webp|svg|woff2?|ttf|otf|eot)$/, // ignore binary assets
  ],
}
```

Allow to configure paths and files to watch file changes for rebuild in `watch` or `serv` mode.

> **Note**
>
> To watch changes with a `live reload` in the browser, you must additionally configure the `watchFiles` in `devServer`,
> see [setup HMR](#setup-hmr).

#### Properties:

- `paths` -  A list of relative or absolute paths to directories where should be watched `files`.\
  The watching path for each template defined in the entry will be autodetect as the first level subdirectory of the template relative to the project's root path.
  E.g., the template `./src/views/index.html` has the watching path of `./src`.

- `files` - Watch the files specified in `paths`, except `ignore`, that match the regular expressions.
  Defaults, are watched only files that match the [`test`](#option-test) plugin option.

- `ignore` - Ignore the specified paths or files, that match the regular expressions.


For example, all source files are in the `./src` directory,
while some partials included in a template are in `./vendor/` directory, then add it to the `paths`:

```js
watchFiles: {
  paths: ['vendor'],
},
```

If you want watch changes in some special files used in your template that are only loaded through the template engine,
add them to the `files` property:

```js
watchFiles: {
  paths: ['vendor'],
  files: [
    /data\.(js|json)$/,
  ],
},
```

To exclude watching of files defined in `paths` and `files`, you can use the `ignore` property.
This option has the prio over paths and files.

> **Note**
>
> To display all watched files, enable the [`verbose`](#option-verbose) option.


#### [↑ back to contents](#contents)
<a id="option-loaderOptions" name="option-loaderOptions" href="#option-loaderOptions"></a>
### `loaderOptions`

This is the reference to the [loader options](#loader-options).
You can specify loader options here in the plugin options to avoid explicitly defining the `HtmlBundlerPlugin.loader` in `module.rules`.
The `HtmlBundlerPlugin.loader` will be added automatically.

For example, both configurations are functionally identical:

_1) the variant using the `loaderOptions`_ (recommended for common use cases)
```js
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
module.exports = {
  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: 'src/views/index.ejs',
      },
      loaderOptions: {
        // resolve files specified in non-standard attributes 'data-src', 'data-srcset'
        sources: [{ tag: 'img', attributes: ['data-src', 'data-srcset'], }],
        // compile a template into HTML using `ejs` module
        preprocessor: 'ejs',
      },
    }),
  ],
};
```

_2) the variant using the `module.rules`_
```js
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
module.exports = {
  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: 'src/views/index.ejs',
      },
    }),
  ],
  module: {
    rules: [
      {
        test: /.(html|ejs)$/,
        loader: HtmlBundlerPlugin.loader,
        options: {
          sources: [{ tag: 'img', attributes: ['data-src', 'data-srcset'], }],
          preprocessor: 'ejs',
        },
      },
    ],
  },
};
```

For common use cases, the first option is recommended. So your config is smaller and cleaner.

The second variant use only for special cases, e.g. when you have templates with different syntax.
An example see by [How to use some different template engines](#recipe-diff-templates).


> **Note**
>
> Options defined in `module.rules` take precedence over the same options defined in `loaderOptions`.
---

#### [↑ back to contents](#contents)
<a id="loader-options" name="loader-options" href="#loader-options"></a>
## Loader options

<a id="default-loader" name="default-loader" href="#default-loader"></a>
The `default loader`:
```js
{
  test: /\.(html|ejs|eta|hbs|handlebars|njk)$/,
  loader: HtmlBundlerPlugin.loader,
}
```

You can omit the loader in Webpack `modules.rules`.
If the `HtmlBundlerPlugin.loader` is not configured, the plugin add it with default options automatically.

The default loader handels HTML files and `EJS`-like templates.

> **Note**
>
> It is recommended to define all loader options in the [`loaderOptions`](#option-loaderOptions) by the plugin options
> to keep the webpack config clean and smaller.


> **Warning**
>
> The plugin works only with the own loader `HtmlBundlerPlugin.loader`.
> Do not use another loader.
> This loader replaces the functionality of `html-loader` and many other template loaders.


<a id="loader-option-sources" name="loader-option-sources" href="#loader-option-sources"></a>
### `sources`
Type:
```ts
type sources =
  | boolean
  | Array<{
      tag?: string;
      attributes?: Array<string>;
      filter?: ({
        tag: string,
        attribute: string,
        value: string,
        attributes: string,
        resourcePath: string
      }) => boolean|undefined;
    }>;
```

Default: `true`

The `sources` option allow to specify a tag attribute that should be resolved.

<a id="loader-option-sources-default" name="loader-option-sources-default" href="#loader-option-sources-default"></a>
#### Default attributes

By default, resolves source files in the following tags and attributes:

| Tag      | Attributes                                                                                                   |
|----------|--------------------------------------------------------------------------------------------------------------|
| `link`   | `href` for `type="text/css"` `rel="stylesheet"` `as="style"` `as="script"`<br>`imagesrcset` for `as="image"` |
| `script` | `src`                                                                                                        |
| `img`    | `src` `srcset`                                                                                               |
| `image`  | `href` `xlink:href`                                                                                          |
| `use`    | `href` `xlink:href`                                                                                          |
| `input`  | `src` (for `type="image"`)                                                                                   |
| `source` | `src` `srcset`                                                                                               |
| `audio`  | `src`                                                                                                        |
| `track`  | `src`                                                                                                        |
| `video`  | `src` `poster`                                                                                               |
| `object` | `data`                                                                                                       |

> **Warning**
>
> It is not recommended to use the [deprecated](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/xlink:href) `xlink:href` attribute by the `image` and `use` tags.

> **Note**
>
> Automatically are processed only attributes containing a relative path or Webpack alias:
> - `src="./image.png"` or `src="image.png"` - an asset in the local directory
> - `src="../../assets/image.png"` - a relative path to parent directory
> - `src="@images/image.png"` - an image directory as Webpack alias
>
> Url values are not processed:
> - `src="https://example.com/img/image.png"`
> - `src="//example.com/img/image.png"`
> - `src="/img/image.png"`
>
> Others not file values are ignored, e.g.:
> - `src="data:image/png; ..."`
> - `src="javascript: ..."`


<a id="loader-option-sources-filter" name="loader-option-sources-filter" href="#loader-option-sources-filter"></a>
#### Filter function

The `filter` is called for all attributes of the tag defined as defaults and in `sources` option.
The argument is an object containing the properties:
- `tag: string` - a name of the HTML tag
- `attribute: string` - a name of the HTML attribute
- `value: string` - a value of the HTML attribute
- `attributes: string` - all attributes of the tag
- `resourcePath: string` - a path of the HTML template

The processing of an attribute can be ignored by returning `false`.

To disable the processing of all attributes, set the `sources` option as `false`.


Examples of using argument properties:
```js
{
  tag: 'img',
  // use the destructuring of variables from the object argument  
  filter: ({ tag, attribute, value, attributes, resourcePath }) => {
    if (attribute === 'src') return false;
    if (value.endsWith('.webp')) return false;
    if ('srcset' in attributes && attributes['srcset'] === '') return false;
    if (resourcePath.indexOf('example')) return false;
    // otherwise return 'true' or nothing (undefined) to allow the processing
  },
}
```

The default sources can be extended with new tags and attributes.

For example, add the processing of the `data-src` and `data-srcset` attributes to the `img` tag:

```js
new HtmlBundlerPlugin({
  entry: {
    index: 'src/views/index.html',
  },
  loaderOptions: {
    sources: [
      {
        tag: 'img',
        attributes: ['data-src', 'data-srcset'],
      },
    ],
  },
})
```

You can use the `filter` function to allow the processing only specific attributes.

The `filter` function must return `true` or `undefined` to enable the processing of specified tag attributes.
Return `false` to disable the processing.

For example, allow processing only for images in `content` attribute of the `meta` tag:

```html
<html>
<head>
  <!-- ignore the 'content' attribute via filter -->
  <meta name="theme-color" content="#ffffff">
  <meta property="og:title" content="Frutis" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:video:type" content="video/mp4" />
  
  <!-- resolve the 'content' attribute via filter  -->
  <meta property="og:image" content="./frutis.png" />
  <meta property="og:video" content="./video.mp4" />
</head>
<body>
  <!-- resolve standard 'src' attribute -->
  <img src="./image.png">
</body>
</html>
```

Use the `filter` function:

```js
new HtmlBundlerPlugin({
  entry: {
    index: 'src/views/index.html',
  },
  loaderOptions: {
    sources: [
      {
        tag: 'meta',
        attributes: ['content'],
        // allow to handlen an image in the 'content' attribute of the 'meta' tag
        // when the 'property' attribute contains one of: 'og:image', 'og:video'
        filter: ({ attributes }) => {
          const attrName = 'property';
          const attrValues = ['og:image', 'og:video'];
          if (attributes[attrName] && attrValues.indexOf(attributes[attrName]) < 0) {
            return false; // return false to disable processing
          }
          // return true or undefined to enable processing
        },
      },
    ],
  },
})
```

The filter can disable an attribute of a tag.

For example, disable the processing of default attribute `srcset` of the `img` tag:

```js
new HtmlBundlerPlugin({
  entry: {
    index: 'src/views/index.html',
  },
  loaderOptions: {
    sources: [
      {
        tag: 'img',
        filter: ({ attribute }) => attribute !== 'srcset',
      }
    ],
  },
})
```


#### [↑ back to contents](#contents)
<a id="loader-option-root" name="loader-option-root" href="#loader-option-root"></a>
### `root`
Type: `string|boolean` Default: `false`

The `root` option allow to resolve an asset file with leading `/` root path.

Defaults is disabled because the file with leading `/` is a valide URL in the public path, e.g. `dist/`.
The files with leading `/` are not processed.

Define the `root` option as the absolute path to the source directory to enable the processing.

For example, there are project files:
```
./src/views/index.html
./src/styles/style.scss
./src/scripts/main.js
./src/images/apple.png
```

Define the `root` loader option:

```js
new HtmlBundlerPlugin({
  entry: {
    index: 'src/views/index.html',
  },
  loaderOptions: {
    root: path.join(__dirname, 'src'),
  },
})
```

Now you can use the `/` root path for the source assets:
```html
<html>
<head>
  <link href="/styles/style.scss" rel="stylesheet">
  <script src="/scripts/main.js" defer="defer"></script>
</head>
<body>
  <h1>Hello World!</h1>
  <img src="/images/apple.png">
</body>
</html>
```


#### [↑ back to contents](#contents)
<a id="loader-option-preprocessor" name="loader-option-preprocessor" href="#loader-option-preprocessor"></a>
### `preprocessor`

You can use a pre-configured preprocessor for a template engine, or you can define your own preprocessor as a function.

#### Pre-configured

For most popular templating engines, preprocessors are already pre-configured.

```ts
type preprocessor = 'eta' | 'ejs' | 'handlebars' | 'nunjucks';
```

The default value is `'eta'`, see [Eta](https://eta.js.org) templating engine. 
The npm package `eta` is already installed with this plugin.

> The `Eta` has the EJS-like syntax, is only 2KB gzipped and is much fasted than EJS.

You can pass a custom options of the template engine using the [preprocessorOptions](#loader-option-preprocessorOptions).

For example, if you have `EJS` templates:

install npm package `ejs`
```
npm i -D ejs
```

define the `preprocessor` as `'ejs'` string
```js
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
module.exports = {
  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: 'src/views/pages/home/index.ejs',
      },
      loaderOptions: {
        preprocessor: 'ejs',
      },
    }),
  ],
};
```

See the options for the pre-configured preprocessors:
[eta](#loader-option-preprocessorOptions-eta),
[ejs](#loader-option-preprocessorOptions-ejs),
[handlebars](#loader-option-preprocessorOptions-handlebars),
[nunjucks](#loader-option-preprocessorOptions-nunjucks).

<a id="loader-option-preprocessor-custom" name="loader-option-preprocessor-custom" href="#loader-option-preprocessor-custom"></a>
#### Custom

To use any templating engine you can define the `preprocessor` as a function.

```ts
type preprocessor = (
  template: string,
  loaderContext: LoaderContext
) => string|Promise;
```

The default `preprocessor` is pre-configured as the following function:
```js
const { Eta } = require('eta');
const eta = new Eta({
  async: false, // defaults is false, wenn is true then must be used `await includeAsync()`
  useWith: true, // allow to use variables in template without `it.` scope
  views: process.cwd(), // directory that contains templates
});
preprocessor = (template, { data }) => eta.renderString(template, data);
```

The function arguments:

- `template` - a raw content of a template file defined in the [`entry`](#option-entry) option.
- `loaderContext` - the [Loader Context](https://webpack.js.org/api/loaders/#the-loader-context) object contained useful properties:
  - `mode: string` - a Webpack mode: `production`, `development`, `none`
  - `rootContext: string` - a path to Webpack context
  - `resource: string` - a template file, including query
  - `resourcePath: string` - a template file
  - `data: object|null` - variables passed in [`entry.{page}.data`](#option-entry) and [`loader.data`](#loader-option-data)

The preprocessor is called for each entry file, before processing of the content.
The function can be used to compile the template with any template engine,
such as [Eta](https://eta.js.org), [EJS](https://ejs.co), [Handlebars](https://handlebarsjs.com), [Mustache](https://github.com/janl/mustache.js), [Nunjucks](https://mozilla.github.io/nunjucks), [LiquidJS](https://github.com/harttle/liquidjs), etc.

The function returns new content as a `string` for sync or `Promise` for async processing.

The example for your own `sync` render function:

```js
{
  preprocessor: (template, { data }) => render(template, data)
}
```

The example of using `Promise` for your own `async` render function:

```js
{
  preprocessor: (template, { data }) =>
    new Promise((resolve) => {
      const result = render(template, data);
      resolve(result);
    })
}
```

> **Note**
>
> The plugin supports `EJS`-like templates "out of the box" therefore the `HtmlBundlerPlugin.loader` can be omitted in the Webpack config.


#### [↑ back to contents](#contents)
<a id="loader-option-preprocessorOptions" name="loader-option-preprocessorOptions" href="#loader-option-preprocessorOptions"></a>
### `preprocessorOptions`
Type: `Object` Default: `{}`

With the `preprocessorOptions` you can pass template engine options when used the [preprocessor](#loader-option-preprocessor) as the string: `eta`, `ejs`, `handlebars` or `nunjucks`.
Each preprocessor has its own options, depend on using template engine.

<a id="loader-option-preprocessorOptions-eta" name="loader-option-preprocessorOptions-eta" href="#loader-option-preprocessorOptions-eta"></a>
#### Options for `preprocessor: 'eta'` (default)
```js
loaderOptions: {
  preprocessor: 'eta',
  preprocessorOptions: {
    async: false, // defaults 'false', wenn is 'true' then must be used `await includeAsync()`
    useWith: true, // defaults 'true', use variables in template without `it.` scope
    views: 'src/views', // relative path to directory that contains templates
    // views: path.join(__dirname, 'src/views'), // absolute path to directory that contains templates
  },
},
```

For the complete list of options see [here](https://eta.js.org/docs/api/configuration).

For example, there are a template page and partials:
```
src/views/page/home.html
src/views/includes/gallery.html
src/views/includes/teaser.html
src/views/partials/footer.html
src/views/partials/menu/nav.html
src/views/partials/menu/top/desktop.html
```

Include the partials in the `src/views/page/home.html` template with the `include()`:
```html
<%~ include('teaser.html') %>
<%~ include('menu/nav.html') %>
<%~ include('menu/top/desktop.html') %>
<%~ include('footer.html') %>
```

If partials have `.eta` extensions, then the extension can be omitted in the include argument.

<a id="loader-option-preprocessorOptions-ejs" name="loader-option-preprocessorOptions-ejs" href="#loader-option-preprocessorOptions-ejs"></a>
#### Options for `preprocessor: 'ejs'`
```js
loaderOptions: {
  preprocessor: 'ejs',
  preprocessorOptions: {
    async: false, // defaults 'false'
    // defaults process.cwd(), root path for includes with an absolute path (e.g., /file.html)
    root: path.join(__dirname, 'src/views/'), // defaults process.cwd()
    // defaults [], an array of paths to use when resolving includes with relative paths
    views: [
      'src/views/includes', // relative path
      path.join(__dirname, 'src/views/partials'), // absolute path
    ],
  },
},
```

For the complete list of options see [here](https://ejs.co/#docs).

For example, there are template page and partials:
```
src/views/page/home.html
src/views/includes/gallery.html
src/views/includes/teaser.html
src/views/partials/footer.html
src/views/partials/menu/nav.html
src/views/partials/menu/top/desktop.html
```

Include the partials in the `src/views/page/home.html` template with the `include()`:
```html
<!-- root path -->
<%- include('/includes/gallery.html') %>

<!-- views paths -->
<%- include('teaser.html') %>
<%- include('menu/nav.html') %>
<%- include('menu/top/desktop.html') %>
<%- include('footer.html') %>
```
If you have partials with `.ejs` extensions, then the extension can be omitted.

<a id="loader-option-preprocessorOptions-handlebars" name="loader-option-preprocessorOptions-handlebars" href="#loader-option-preprocessorOptions-handlebars"></a>
#### Options for `preprocessor: 'handlebars'`

The `preprocessor` has built-in `include` helper, to load a partial file directly in a template without registration of partials.

The `include` helper has the following _de facto_ standard options:

```js
loaderOptions: {
  preprocessor: 'handlebars',
  preprocessorOptions: {
    // defaults process.cwd(), root path for includes with an absolute path (e.g., /file.html)
    root: path.join(__dirname, 'src/views/'), // defaults process.cwd()
    // defaults [], an array of paths to use when resolving includes with relative paths
    views: [
      'src/views/includes', // relative path
      path.join(__dirname, 'src/views/partials'), // absolute path
    ],
  },
},
```

For example, there are template page and partials:
```
src/views/page/home.html
src/views/includes/gallery.html
src/views/includes/teaser.html
src/views/partials/footer.html
src/views/partials/menu/nav.html
src/views/partials/menu/top/desktop.html
```

Include the partials in the `src/views/page/home.html` template with the `include` helper:
```html
<!-- root path -->
{{ include '/includes/gallery' }}

<!-- views paths -->
{{ include 'teaser' }}
{{ include 'menu/nav' }}
{{ include 'menu/top/desktop' }}
{{ include 'footer' }}
```

The `include` helper automatically resolves `.hthm` and `.hbs` extensions, it can be omitted.

**The `partials` option**

Type: `Array<string>|Object` Default: `[]`

If you use the partials syntax `{{> footer }}` to include a file, then use the `partials` option.
Partials will be auto-detected in paths recursively and registered under their relative paths, without an extension.

```js
loaderOptions: {
  preprocessor: 'handlebars',
  preprocessorOptions: {
    // an array of relative or absolute paths to partials
    partials: [
      'src/views/includes', // relative path
      path.join(__dirname, 'src/views/partials'), // absolute path
    ],
  },
},
```
For example, if the partial path is the `src/views/partials` then the file `src/views/partials/menu/top/desktop.html` will have the partial name `menu/top/desktop`.

You can define all partials manually using the option as an object:

```js
loaderOptions: {
  preprocessor: 'handlebars',
    preprocessorOptions: {
    // define partials manually
    partials: {
      gallery: path.join(__dirname, 'src/views/includes/gallery.html'),
      teaser: path.join(__dirname, 'src/views/includes/teaser.html'),
      footer: path.join(__dirname, 'src/views/partials/footer.html'),
      'menu/nav': path.join(__dirname, 'src/views/partials/menu/nav.html'),
      'menu/top/desktop': path.join(__dirname, 'src/views/partials/menu/top/desktop.html'),
    },
  },
},
```

Include the partials in the `src/views/page/home.html` template:
```html
{{> gallery }}
{{> teaser }}
{{> menu/nav }}
{{> menu/top/desktop }}
{{> footer }}
```

**The `helpers` option**

Type: `Array<string>|Object` Default: `[]`

When the `helpers` is an array of relative or absolute paths to helpers, 
then the name of a helper is the relative path to the helper file without an extension.

For example, there are helper files:

```
src/views/helpers/bold.js
src/views/helpers2/italic.js
src/views/helpers2/wrapper/span.js
```

The preprocessor options:

```js
loaderOptions: {
  preprocessor: 'handlebars',
  preprocessorOptions: {
    // an array of relative or absolute paths to helpers
    helpers: [
      'src/views/helpers',
      'src/views/helpers2',
    ],
  },
},
```

Usage of helpers:

```html
{{#bold}}The bold text.{{/bold}}
{{#italic}}The italic text.{{/italic}}

<!-- the helper with namespace `wrapper/span` -->
{{#[wrapper/span]}}The text wrapped with span tag.{{/[wrapper/span]}}

```

> **Note**
> 
> - The helper located in a subdirectory, e.g. `wrapper/span.js` will be available in template as `[wrapper/span]`.
> - When helper name contain the `/` slash, then the helper name must be wrapped with the `[]`.

You can define helpers manually using `name: function` object:

```js
loaderOptions: {
  preprocessor: 'handlebars',
  preprocessorOptions: {
    // define helpers manually
    helpers: {
      bold: (options) => new Handlebars.SafeString(`<strong>${options.fn(this)}</strong>`),
    },
  },
},
```

For the complete list of Handlebars `compile` options see [here](https://handlebarsjs.com/api-reference/compilation.html).


<a id="loader-option-preprocessorOptions-nunjucks" name="loader-option-preprocessorOptions-nunjucks" href="#loader-option-preprocessorOptions-nunjucks"></a>
#### Options for `preprocessor: 'nunjucks'`

```js
loaderOptions: {
  preprocessor: 'nunjucks',
  preprocessorOptions: {
    // here are preprocessor options
    // an array of relative or absolute templates paths, defaults the current working directory
    views: [
      'src/views/includes',
      'src/views/partials',
    ],
    async: false, // defaults 'false'
    jinjaCompatibility: false, // installs support for Jinja compatibility, defaults 'false'
    
    // here are original Nunjucks options
    autoescape: true, // escape dangerous characters, defaults 'true'
    // ...
  },
},
```

For the complete list of Nunjucks options see [here](https://mozilla.github.io/nunjucks/api.html#configure).

---


#### [↑ back to contents](#contents)
<a id="loader-option-data" name="loader-option-data" href="#loader-option-data"></a>
### `data`
Type: `Object|string` Default: `{}`

#### Data as an object
Type: `Object`

The data defined as an object are loaded once with Webpack start.

#### Data as file path
Type: `string`

The string value is an absolute or relative filename of a JSON or JS file. The JS file must export an object.
The data file will be reloaded after changes. So you can use it to dynamically update variables in a template.


The properties defined in the `data` loader option are available as variables in all templates defined in the `entry` option.
Use this option to pass global variables into all templates.

To pass page variables to a specific template, use the `data` property of the [entry](#webpack-option-entry) option.

> **Note**
> 
> The `entry` data property overrides the same property of loader `data`.

For example, there are variables defined in both the `entry` property and the loader option:

```js
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: {
          import: 'src/views/home.html',
          data: {
            // page specifically variables
            title: 'Home', // overrides the `title` defined in the loader data
            headline: 'Homepage',
          },
          // - OR -
          data: 'src/data/home.json',
        },
        about: 'src/views/about.html',
      },
      loaderOptions: {
        data: {
          // global variables for all pages
          title: 'Default Title',
          globalData: 'Global Data',
        },
        // - OR -
        data: 'src/data/global.js',
      },
    }),
  ],
};
```

JSON data file _src/data/home.json_
```json
{
  "title": "Home",
  "headline": "Homepage"
}
```

JS data file _src/data/global.js_
```js
module.exports = {
  title: 'Default Title',
  globalData: 'Global Data',
}
```


In the `./src/views/home.html` template are available following variables:
```js
{
  title: 'Home',
  headline: 'Homepage',
  globalData: 'Global Data',
}
```

In the `./src/views/about.html` template are available following variables:
```js
{
  title: 'Default Title',
  globalData: 'Global Data',
}
```

---


#### [↑ back to contents](#contents)
<a id="recipe-template-engine" name="recipe-template-engine" href="#recipe-template-engine"></a>
## Template engines

Using the [preprocessor](#loader-option-preprocessor), you can compile any template with a template engine such as:
- [Eta](https://eta.js.org)
- [EJS](https://ejs.co)
- [Handlebars](https://handlebarsjs.com)
- [Mustache](https://github.com/janl/mustache.js)
- [Nunjucks](https://mozilla.github.io/nunjucks/)
- [LiquidJS](https://github.com/harttle/liquidjs)
- and others

> **Note**
>
> For Pug templates use the [pug-plugin](https://github.com/webdiscus/pug-plugin).
> This plugin works on the same codebase but has additional Pug-specific options and features.


<a id="using-template-eta" name="using-template-eta" href="#using-template-eta"></a>
### Using the Eta
_Supported "out of the box"_

`Eta` is [compatible*](#eta-compatibilty-with-ejs) with `EJS` syntax, is smaller and faster than `EJS`.

For example, there is the template _src/views/page/index.eta_
```html
<html>
<body>
  <h1><%= headline %></h1>
  <ul class="people">
    <% for (let i = 0; i < people.length; i++) {%>
    <li><%= people[i] %>></li>
    <% } %>
  </ul>
  <%~ include('/src/views/partials/footer') %>
</body>
</html>
```

The minimal Webpack config:

```js
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: { // output dist/imdex.html
          import: './src/views/page/index.eta',
          data: {
            headline: 'Breaking Bad',
            people: ['Walter White', 'Jesse Pinkman'],
          },
        },
      },
    }),
  ],
};
```

The default preprocessor is `eta`, you can omit it:
```js
new HtmlBundlerPlugin({
  loaderOptions: {
    preprocessor: 'eta',
    // preprocessorOptions: {...},
  },
})
```

For the `eta` preprocessor options see [here](#loader-option-preprocessorOptions-eta).

<a id="eta-compatibilty-with-ejs" name="eta-compatibilty-with-ejs" href="#eta-compatibilty-with-ejs"></a>
> **Warning**
>
> For compatibility the Eta compiler with the EJS templates, the default preprocessor use the `useWith: true` Eta option
> to use variables in template without the Eta-specific `it.` scope.

#### [↑ back to contents](#contents)
<a id="using-template-ejs" name="using-template-ejs" href="#using-template-ejs"></a>
### Using the EJS

You need to install the `ejs` package:
```
npm i -D ejs
```

For example, there is the template _src/views/page/index.ejs_
```html
<html>
<body>
  <h1><%= headline %></h1>
  <ul class="people">
    <% for (let i = 0; i < people.length; i++) {%>
    <li><%= people[i] %>></li>
    <% } %>
  </ul>
  <%- include('/src/views/partials/footer.html'); %>
</body>
</html>
```

Define the `preprocessor` as `ejs`:

```js
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: { // output dist/imdex.html
          import: './src/views/page/index.ejs',
          data: {
            headline: 'Breaking Bad',
            people: ['Walter White', 'Jesse Pinkman'],
          },
        },
      },
      loaderOptions: {
        preprocessor: 'ejs', // enable EJS compiler
        // preprocessorOptions: {...},
      },
    }),
  ],
};
```

For the `ejs` preprocessor options see [here](#loader-option-preprocessorOptions-ejs).

#### [↑ back to contents](#contents)
<a id="using-template-handlebars" name="using-template-handlebars" href="#using-template-handlebars"></a>
### Using the Handlebars

You need to install the `handlebars` package:
```
npm i -D handlebars
```

For example, there is the template _src/views/page/index.hbs_
```html
<html>
<body>
  <h1>{{ headline }}!</h1>
  <ul class="people">
    {{#each people}}
    <li>{{this}}</li>
    {{/each}}
  </ul>
  {{ include '/src/views/partials/footer.html' }}
</body>
</html>
```

Define the `preprocessor` as `handlebars`:

```js
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: { // output dist/imdex.html
          import: './src/views/page/index.hbs',
          data: {
            headline: 'Breaking Bad',
            people: ['Walter White', 'Jesse Pinkman'],
          },
        },
      },
      loaderOptions: {
        preprocessor: 'handlebars', // enable Handlebars compiler
        // preprocessorOptions: {...},
      },
    }),
  ],
};
```

For the `handlebars` preprocessor options see [here](#loader-option-preprocessorOptions-handlebars).


#### [↑ back to contents](#contents)
<a id="using-template-mustache" name="using-template-mustache" href="#using-template-mustache"></a>
### Using the Mustache

You need to install the `mustache` package:
```
npm i -D mustache
```

For example, there is the template _src/views/page/index.mustache_
```html
<html>
<body>
  <h1>{{ headline }}</h1>
  <ul class="people">
    {{#people}}
    <li>{{.}}</li>
    {{/people}}
  </ul>
</body>
</html>
```

Add the template compiler to `preprocessor`:

```js
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
const Mustache = require('mustache');

module.exports = {
  plugins: [
    new HtmlBundlerPlugin({
      test: /\.(html|mustache)$/, // add the test option to match *.mustache files in entry
      index: {
        import: './src/views/page/index.mustache',
        data: {
          headline: 'Breaking Bad',
          people: ['Walter White', 'Jesse Pinkman'],
        },
      },
      loaderOptions: {
        // define preprocessor as the function that shoud return a string or promise
        preprocessor: (template, { data }) => Mustache.render(template, data),
      },
    }),
  ],
};
```


#### [↑ back to contents](#contents)
<a id="using-template-nunjucks" name="using-template-nunjucks" href="#using-template-nunjucks"></a>
### Using the Nunjucks

You need to install the `nunjucks` package:
```
npm i -D nunjucks
```

For example, there is the template _src/views/page/index.njk_
```html
<html>
<body>
  <h1>{{ headline }}!</h1>
  <ul class="people">
    {% for name in people %}
    <li class="name">{{ name }}</li>
    {% endfor %}
  </ul>
</body>
</html>
```

Define the `preprocessor` as `nunjucks`:

```js
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  plugins: [
    new HtmlBundlerPlugin({
      test: /\.(html|njk)$/, // add the test option to match *.njk files in entry
      entry: {
        index: {
          import: './src/views/page/index.njk',
          data: {
            headline: 'Breaking Bad',
            people: ['Walter White', 'Jesse Pinkman'],
          },
        },
      },
      loaderOptions: {
        preprocessor: 'nunjucks', // enable Nunjucks compiler
        // preprocessorOptions: {...},
      },
    }),
  ],
};
```

For the `nunjucks` preprocessor options see [here](#loader-option-preprocessorOptions-nunjucks).

#### [↑ back to contents](#contents)
<a id="using-template-liquidjs" name="using-template-liquidjs" href="#using-template-liquidjs"></a>
### Using the LiquidJS

You need to install the `liquidjs` package:
```
npm i -D liquidjs
```

For example, there is the template _src/views/page/index.liquid_
```html
<html>
<body>
  <h1>{{ headline }}!</h1>
  <ul class="people">
    {% for name in people %}
    <li class="name">{{ name }}</li>
    {% endfor %}
  </ul>
</body>
</html>
```

Add the template compiler to `preprocessor`:

```js
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
const { Liquid } = require('liquidjs');

const LiquidEngine = new Liquid();

module.exports = {
  plugins: [
    new HtmlBundlerPlugin({
      test: /\.(html|liquid)$/, // add the test option to match *.liquid files in entry
      entry: {
        index: {
          import: './src/views/page/index.liquid',
          data: {
            headline: 'Breaking Bad',
            people: ['Walter White', 'Jesse Pinkman'],
          },
        },
      },
      loaderOptions: {
        // async parseAndRender method return the promise
        preprocessor: (template, { data }) => LiquidEngine.parseAndRender(template, data),
      },
    }),
  ],
};
```

---


#### [↑ back to contents](#contents)
<a id="setup-hmr" name="setup-hmr" href="#setup-hmr"></a>
## Setup HMR (Live Reload)

To enable live reload after changes add in the Webpack config the `devServer` option:
```js
module.exports = {
  // enable HMR with live reload
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    watchFiles: {
      paths: ['src/**/*.*'],
      options: {
        usePolling: true,
      },
    },
  },
};
```

---


#### [↑ back to contents](#contents)
<a id="recipe-entry-keep-folder-structure" name="recipe-entry-keep-folder-structure" href="#recipe-entry-keep-folder-structure"></a>
## How to keep source folder structure in output directory


Define the `entry` option as a path to templates. For details see the [entry path](#option-entry-path).


#### [↑ back to contents](#contents)
<a id="recipe-use-images-in-html" name="recipe-use-images-in-html" href="#recipe-use-images-in-html"></a>
## How to use source image files in HTML

Add to Webpack config the rule:
```js
module: {
  rules: [
    {
      test: /\.(png|jpe?g|ico|svg)$/,
      type: 'asset/resource',
      generator: {
        filename: 'assets/img/[name].[hash:8][ext]',
      },
    },
  ],
}
```

Add a source file using a relative path or Webpack alias in HTML:
```html
<html>
<head>
  <link href="./favicon.ico" rel="icon" />
</head>
<body>
  <img src="./apple.png" srcset="./apple1.png 320w, ./apple2.png 640w" alt="apple">
  <picture>
    <source srcset="./fig1.jpg, ./fig2.jpg 320w, ./fig3.jpg 640w">
  </picture>
</body>
</html>
```

The generated HTML contains hashed output images filenames:
```html
<html>
<head>
  <link href="/assets/img/favicon.05e4dd86.ico" rel="icon" />
</head>
<body>
  <img src="/assets/img/apple.f4b855d8.png" srcset="/assets/img/apple1.855f4bd8.png 320w, /assets/img/apple2.d8f4b855.png 640w" alt="apple">
  <picture>
    <source srcset="/assets/img/fig1.605e4dd8.jpg, /assets/img/fig2.8605e4dd.jpg 320w, /assets/img/fig3.e4605dd8.jpg 640w">
  </picture>
</body>
</html>
```

---

#### [↑ back to contents](#contents)
<a id="recipe-responsive-images" name="recipe-responsive-images" href="#recipe-responsive-images"></a>
## How to resize and generate responsive images

To resize or generate responsive images is recommended to use the [responsive-loader](https://github.com/dazuaz/responsive-loader).

Install additional packages:
```
npm i -D responsive-loader sharp
```

To resize an image use the query parameter `size`:

```html
<!-- resize source image to max. 640px -->
<img src="./image.png?size=640">
```

To generate responsible images use in `srcset` attribute the query parameter `sizes` als `JSON5` to avoid parsing error, 
because many images must be separated by commas `,` but we use the comma to separate sizes for one image:
```html
<!-- responsible images with different sizes: 320px, 480px, 640px -->
<img src="./image.png?size=480"
     srcset="./image.png?{sizes:[320,480,640]}">
```

You can convert source image to other output format. 
For example, we have original image 2000px width as PNG and want to resize to 640px and save as WEBP:

```html
<img src="./image.png?size=640&format=webp">
```

You can create a small inline image placeholder. To do this, use the following query parameters:
- `placeholder=true` - enable to generate the placeholder
- `placeholderSize=35` - the size of the generating placeholder
- `prop=placeholder` - the plugin-specific `prop` parameter retrieves the property from the object generated by `responsive-loader`

```html
<img src="./image.png?placeholder=true&placeholderSize=35&prop=placeholder"
     srcset="./image.png?{sizes:[320,480,640]}">
```

The generated HTML:
```html
<img src="data:image/png;base64,iVBORw0K ..."
     srcset="/img/image-320w.png 320w,/img/image-480w.png 480w,/img/image-640w.png 640w">
```

Add to Webpack config the rule for responsive images:
```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|webp)$/,
        type: 'asset/resource',
        use: {
          loader: 'responsive-loader',
          options: {
            // output filename of images, e.g. dist/assets/img/image-640w.png
            name: 'assets/img/[name]-[width]w.[ext]',
            sizes: [640], // max. image size, if 'size' query is not used
          },
        },
      },
      // ... other loaders
    ],
  },
};

```

---

#### [↑ back to contents](#contents)
<a id="recipe-preload-fonts" name="recipe-preload-fonts" href="#recipe-preload-fonts"></a>
## How to preload fonts

To preload resources such as fonts, use the [preload](#option-preload) plugin option.

For example, there is the style used a font that should be preloaded:

_style.scss_

```scss
@font-face {
  font-family: "MyFont";
  // load source fonts using the `@fonts` Webpack alias to the font directory
  src: local(MyFont Regular),
  url('@fonts/myfont.woff2') format('woff2'),
  url('@fonts/myfont.woff') format('woff');
}

body {
  font-family: "MyFont", serif;
}

```

The template _index.html_ where is loaded the source style:
```html
<html>
<head>
  <title>Demo</title>
  <!-- load source style -->
  <link href="./style.scss" rel="stylesheet" />
</head>
<body>
  <h1>Hello World!</h1>
</body>
</html>
```

Use the minimal Webpack config:

```js
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  resolve: {
    alias: {
      '@fonts': path.join(__dirname, 'src/assets/fonts/'), // => add alias to the font directory
    },
  },
  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: 'src/views/index.html', // => template where is loaded the style with fonts
      },
      css: {
        filename: 'css/[name].[contenthash:8].css', // => filename of extracted CSS
      },
      // => add the preload option with the config for fonts
      preload: [
        {
          test: /\.(woff2|woff)$/,
          attributes: { as: 'font', crossorigin: true },
        },
      ],
    }),
  ],
  module: {
    rules: [
      // => add the style rule
      {
        test: /\.(css|sass|scss)$/,
        use: ['css-loader', 'sass-loader'],
      },
      // => add the font rule
      {
        test: /\.(woff2|woff)$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext]',
        },
      },
    ],
  },
};
```

> **Note**
>
> Font preloading requires the `crossorigin` attribute to be set.
> See [font preload](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/preload#what_types_of_content_can_be_preloaded).

The generated HTML contains the preload tag with the font:

```html
<html>
<head>
  <title>Demo</title>
  <!-- preload fonts detected in style -->
  <link rel="preload" href="fonts/myfont.woff2" as="font" type="font/woff2" crossorigin="true">
  <link rel="preload" href="fonts/myfont.woff" as="font" type="font/woff" crossorigin="true">
  <!-- compiled style -->
  <link href="css/style.1f4faaff.css" rel="stylesheet" />
</head>
<body>
  <h1>Hello World!</h1>
</body>
</html>
```

> **Note**
>
> You don't need a plugin to copy files from source directory to public.
> All source fonts will be coped to output directory automatically.

---

#### [↑ back to contents](#contents)
<a id="recipe-inline-css" name="recipe-inline-css" href="#recipe-inline-css"></a>
## How to inline CSS in HTML

There are two ways to inline CSS in HTML:
- inline all CSS globally with `css.inline` [option](#option-css)
- inline single CSS with `?inline` query added to a filename


The `inline` option can take the following values: `false`, `true` and `'auto'`.
For details see the [inline option](#option-css).

> **Note**
> 
> The individual `?inline` query parameter takes precedence over the globally `css.inline` option.\
> For example, if `css.inline = true` and in HTML a single file has the `?inline=false` query, 
> this file will be extracted in an output file, while all other styles will be inlined.


For example, there are two SCSS files:

_main.scss_
```scss
$bgColor: steelblue;
body {
  background-color: $bgColor;
}
```

_style.scss_:
```scss
$color: red;
h1 {
  color: $color;
}
```

There is the _./src/views/index.html_ with both style files:

```html
<html>
<head>
  <link href="./main.scss" rel="stylesheet" />
  <link href="./style.scss" rel="stylesheet" />
</head>
<body>
  <h1>Hello World!</h1>
</body>
</html>
```

To inline all CSS globally add the `css.inline` option:

```js
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
module.exports = {
  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: 'src/views/index.html',
      },
      css: {
        inline: true, // <= all style files will be inlined into HTML
        filename: 'css/[name].[contenthash:8].css',
      },
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(css|sass|scss)$/,
        use: ['css-loader', 'sass-loader'],
      },
    ],
  },
};
```

The generated HTML contains inlined CSS:
```html
<html>
<head>
  <style>
    body{ background-color: steelblue; }
  </style>
  <style>
    h1{ color: red; }
  </style>
</head>
<body>
  <h1>Hello World!</h1>
</body>
</html>
```

To inline a single CSS, add the `?inline` query to a style file which you want to inline:

```html
<html>
<head>
  <!-- file CSS -->
  <link href="./main.scss" rel="stylesheet" />
  <!-- inline CSS -->
  <link href="./style.scss?inline" rel="stylesheet" />
</head>
<body>
  <h1>Hello World!</h1>
</body>
</html>
```

The generated HTML contains inline CSS already processed via Webpack:

```html
<html>
<head>
  <!-- file CSS -->
  <link href="/assets/css/main.05e4dd86.css" rel="stylesheet">
  <!-- inline CSS -->
  <style>
    h1{color: red;}
  </style>
</head>
<body>
  <h1>Hello World!</h1>
</body>
</html>
```

> **Note**
>
> To enable source map in inline CSS set the Webpack option [`devtool`](https://webpack.js.org/configuration/devtool/#devtool).

---

#### [↑ back to contents](#contents)
<a id="recipe-inline-js" name="recipe-inline-js" href="#recipe-inline-js"></a>
## How to inline JS in HTML

There are two ways to inline CSS in HTML:
- inline all JS globally with `js.inline` [option](#option-js)
- inline single JS with `?inline` query added to a filename

The `inline` option can take the following values: `false`, `true` and `'auto'`.
For details see the [inline option](#option-js).

> **Note**
>
> The individual `?inline` query parameter takes precedence over the globally `js.inline` option.\
> For example, if `js.inline = true` and in HTML a single file has the `?inline=false` query,
> this file will be extracted in an output file, while all other scripts will be inlined.

For example, there are two JS files:

_main.js_

```js
console.log('>> main.js');
```

_script.js_
```js
console.log('>> script.js');
```

There is the _./src/views/index.html_ with both script files:

```html
<html>
<head>
  <script src="./main.js" defer="defer"></script>
</head>
<body>
  <h1>Hello World!</h1>
  <script src="./script.js"></script>
</body>
</html>
```


To inline all JS globally add the `js.inline` option:

```js
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
module.exports = {
  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: 'src/views/index.html',
      },
      js: {
        inline: true, // <= all script files will be inlined into HTML
        filename: 'js/[name].[contenthash:8].js',
      },
    }),
  ],
};
```

The generated HTML contains inlined JS scripts:
```html
<html>
<head>
  <script>
    (()=>{"use strict";console.log(">> main.js")})();
  </script>
</head>
<body>
  <h1>Hello World!</h1>
  <script>
    (()=>{"use strict";console.log(">> script.js")})();
  </script>
</body>
</html>
```

To inline a single JS file, add the `?inline` query to a script file which you want to inline:

```html
<html>
<head>
  <!-- file JS -->
  <script src="./main.js" defer="defer"></script>
  <!-- inline JS -->
  <script src="./script.js?inline"></script>
</head>
<body>
  <h1>Hello World!</h1>
</body>
</html>
```

The generated HTML contains inline JS already compiled via Webpack:

```html
<html>
<head>
  <!-- file JS -->
  <script src="assets/js/main.992ba657.js" defer="defer"></script>
  <!-- inline JS -->
  <script>
    (()=>{"use strict";console.log(">> script.js")})();
  </script>
</head>
<body>
  <h1>Hello World!</h1>
</body>
</html>
```

> **Note**
>
> If Webpack is started as `serve` or `watch`,
> the inlined JS code will contain additional HMR code.
> Don't worry it is ok, so works Webpack `live reload`.
>
> To enable source map in inline JS set the Webpack option `devtool`.

---

#### [↑ back to contents](#contents)
<a id="recipe-inline-image" name="recipe-inline-image" href="#recipe-inline-image"></a>
## How to inline SVG, PNG images in HTML

You can inline the images in two ways:
- force inline image using `?inline` query
- auto inline by image size

Add to Webpack config the rule:
```js
module: {
  rules: [
    {
      test: /\.(png|jpe?g|svg|webp|ico)$/i,
      oneOf: [
        // inline image using `?inline` query
        {
          resourceQuery: /inline/,
          type: 'asset/inline',
        },
        // auto inline by image size
        {
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 1024,
            },
          },
          generator: {
            filename: 'assets/img/[name].[hash:8][ext]',
          },
        },
      ],
    },
  ],
}
```

---


#### [↑ back to contents](#contents)
<a id="recipe-preprocessor-php" name="recipe-preprocessor-php" href="#recipe-preprocessor-php"></a>
## How to process a PHP template

The plugin can replace the source filenames of scripts, styles, images, etc. with output filenames in a PHP template.

For example, there is the PHP template _src/views/index.phtml_:

```php
<?php
  $title = 'Home';
?>
<html>
<head>
  <title><?= $title ?></title>
  <link href="./style.css" rel="stylesheet">
  <script src="./main.js" defer="defer"></script>
</head>
<body>
  <h1>Hello World!</h1>
</body>
</html>
```

The PHP template should not be compiled into pure HTML, but only should be processed the source assets.
In this case, the `preprocessor` must be disabled.

```js
module.exports = {
  output: {
    path: path.join(__dirname, 'dist/'), // output directory
  },
  plugins: [
    new HtmlBundlerPlugin({
      test: /\.(php|phtml)$/i, // define template extensions to be processed
      filename: '[name].phtml', // define output filename for templates defined in entry 
      entry: {
        index: './src/views/index.phtml',
      },
      js: {
        filename: 'assets/js/[name].[contenthash:8].js',
      },
      css: {
        filename: 'assets/css/[name].[contenthash:8].css',
      },
      loaderOptions: {
        preprocessor: false, // disable template compilation to HTML
      },
    }),
  ],
};
```

The processed PHP template:
```php
<?php
  $title = 'Home';
?>
<html>
<head>
  <title><?= $title ?></title>
  <link href="assets/css/style.026fd625.css" rel="stylesheet">
  <script src="assets/js/main.3347618e.js" defer="defer"></script>
</head>
<body>
  <h1>Hello World!</h1>
</body>
</html>
```

---


#### [↑ back to contents](#contents)
<a id="recipe-pass-data-to-templates" name="recipe-pass-data-to-templates" href="#recipe-pass-data-to-templates"></a>
## How to pass data into multiple templates

You can pass variables into template using a template engine, e.g. [Handlebars](https://handlebarsjs.com).
For multiple page configuration, better to use the [Nunjucks](https://mozilla.github.io/nunjucks) template engine maintained by Mozilla.

For example, you have several pages with variables.\
Both pages have the same layout _src/views/layouts/default.html_
```html
<!DOCTYPE html>
<html>
<head>
  <title>{{ title }}</title>
  <!-- block for specific page styles -->
  {% block styles %}{% endblock %}
  <!-- block for specific page scripts -->
  {% block scripts %}{% endblock %}
</head>
<body>
  <main class="main-content">
    <!-- block for specific page content -->
    {% block content %}{% endblock %}
  </main>
</body>
</html>
```

_src/views/pages/home/index.html_
```html
{% extends "src/views/layouts/default.html" %}

{% block styles %}
<!-- load source style -->
<link href="./home.scss" rel="stylesheet">
{% endblock %}

{% block scripts %}
<!-- load source script -->
<script src="./home.js" defer="defer"></script>
{% endblock %}

{% block content %}
<h1>{{ filmTitle }}</h1>
<p>Location: {{ location }}</p>
<!-- @images is the Webpack alias for the source images directory -->
<img src="@images/{{ imageFile }}">
{% endblock %}
```

_src/views/pages/about/index.html_
```html
{% extends "src/views/layouts/default.html" %}

{% block styles %}
<link href="./about.scss" rel="stylesheet">
{% endblock %}

{% block scripts %}
<script src="./about.js" defer="defer"></script>
{% endblock %}

{% block content %}
<h1>Main characters</h1>
<ul>
  {% for item in actors %}
  <li class="name">{{ item.firstname }} {{ item.lastname }}</li>
  {% endfor %}
</ul>
{% endblock %}
```

_Webpack config_
```js
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
const Nunjucks = require('nunjucks');

// Note: 
// If your pages have a lot of variables, it's a good idea to define them separately 
// to keep the configuration clean and clear.
const entryData = {
  // variables for home page
  home: {
    title: 'Home',
    filmTitle: 'Breaking Bad',
    location: 'Albuquerque, New Mexico',
    imageFile: 'map.png',
  },
  // variables for about page
  about: {
    title: 'About',
    actors: [
      {
        firstname: 'Walter',
        lastname: 'White, "Heisenberg"',
      },
      {
        firstname: 'Jesse',
        lastname: 'Pinkman',
      },
    ],
  },
};

module.exports = {
  resolve: {
    alias: {
      '@images': path.join(__dirname, 'src/assets/images'),
    },
  },
  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        // define your templates here
        index: { // => dist/index.html
          import: 'src/views/pages/home/index.html',
          data: entryData.home,
        },
        about: { // => dist/about.html
          import: 'src/views/pages/about/index.html',
          data: entryData.about,
        },
      },
      js: {
        filename: 'assets/js/[name].[contenthash:8].js',
      },
      css: {
        filename: 'assets/css/[name].[contenthash:8].css',
      },
      loaderOptions: {
        // preconfigured compiler for Nunjucks template engine
        preprocessor: 'nunjucks',
        // -OR- use as the function for full controll
        // preprocessor: (template, { data }) => Nunjucks.renderString(template, data),
        
      },
    }),
  ],
  module: {
    rules: [
      // styles
      {
        test: /\.(css|sass|scss)$/,
        use: ['css-loader', 'sass-loader'],
      },
      // images
      {
        test: /\.(png|svg|jpe?g|webp)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};

```

The generated _dist/index.html_
```html
<!DOCTYPE html>
<html>
<head>
  <title>Home</title>
  <link href="assets/css/home.2180238c.css" rel="stylesheet">
  <script src="assets/js/home.790d746b.js" defer="defer"></script>
</head>
<body>
  <main class="main-content">
    <h1>Breaking Bad</h1>
    <p>Breaking Bad is an American crime drama</p>
    <p>Location: Albuquerque, New Mexico</p>
    <img src="assets/img/map.697ef306.png" alt="location" />
  </main>
</body>
</html>
```

The generated _dist/about.html_
```html
<!DOCTYPE html>
<html>
<head>
  <title>About</title>
  <link href="assets/css/about.2777c101.css" rel="stylesheet">
  <script src="assets/js/about.1.c5e03c0e.js" defer="defer"></script>
</head>
<body>
  <main class="main-content">
    <h1>Main characters</h1>
    <ul>
      <li class="name">Walter White, &quot;Heisenberg&quot;</li>
      <li class="name">Jesse Pinkman</li>
    </ul>
  </main>
</body>
</html>
```

---


#### [↑ back to contents](#contents)
<a id="recipe-diff-templates" name="recipe-diff-templates" href="#recipe-diff-templates"></a>
## How to use some different template engines

When you have many templates with different syntax, you can use a separate module rules for each template engine.
For example, in your project are mixed templates with EJS and Handlebars syntax.
```
- src/views/ejs/home.ejs
- src/views/hbs/about.hbs
```

To handle different templates, define the `test` plugin option that must match those templates and
add a preprocessor for each template type in the module rules.


```js
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
const ejs = require('ejs');
const Handlebars = require('handlebars');

module.exports = {
  plugins: [
    new HtmlBundlerPlugin({
      test: /\.(ejs|hbs)$/, // <= specify extensions for all template types here
      entry: {
        index: 'src/views/ejs/home.ejs', // EJS template
        about: 'src/views/hbs/about.hbs', // Handlebars template
      },
    }),
  ],
  module: {
    rules: [
      // the rule for EJS
      {
        test: /\.ejs$/,
        loader: HtmlBundlerPlugin.loader, // universal template loader
        options: {
          preprocessor: 'ejs',
          preprocessorOptions: {
            views: [
              path.join(__dirname, 'src/views/ejs/partials'),
            ],
          },
        },
      },
      // the rule for Handlebars
      {
        test: /\.hbs$/,
        loader: HtmlBundlerPlugin.loader, // universal template loader
        options: {
          preprocessor: 'handlebars',
          preprocessorOptions: {
            views: [
              path.join(__dirname, 'src/views/hbs/partials')
            ],
          },
        },
      },
    ],
  },
};
```

---


#### [↑ back to contents](#contents)
<a id="recipe-split-chunks" name="recipe-split-chunks" href="#recipe-split-chunks"></a>
### How to config `splitChunks`

Webpack tries to split every entry file, include template files, which completely breaks the compilation process in the plugin.

To avoid this issue, you must specify which scripts should be split, using `optimization.splitChunks.cacheGroups`:

```js
module.exports = {
  optimization: {
    splitChunks: {
      cacheGroups: {
        scripts: {
          test: /\.(js|ts)$/,
          chunks: 'all',
        },
      },
    },
  },
};
```

> **Note**
>
> In the `test` option must be specified all extensions of scripts which should be split.

See details by [splitChunks.cacheGroups](https://webpack.js.org/plugins/split-chunks-plugin/#splitchunkscachegroups).

For example, in a template are used the scripts and styles from `node_modules`:
```html
<html>
<head>
  <title>Home</title>
  <link href="bootstrap/dist/css/bootstrap.min.css" rel="stylesheet">
  <script src="bootstrap/dist/js/bootstrap.min.js" defer="defer"></script>
</head>
<body>
  <h1>Hello World!</h1>
  <script src="./main.js"></script>
</body>
</html>
```

> **Note**
>
> In the generated HTML all script tags remain in their original places and split chunks will be added there,
> in the order that Webpack generated.

In this use case the `optimization.cacheGroups.{cacheGroup}.test` option must match exactly only JS files from `node_modules`:
```js
module.exports = {
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/].+\.(js|ts)$/, // use exactly this Regexp
          name: 'vendor',
          chunks: 'all',
        },
      },
    },
  },
};
```

> **Warning**
>
> If you will to use the `test` as `/[\\/]node_modules[\\/]`, without extension specification,
> then Webpack concatenates JS code together with CSS in one file and Webpack compilation will failed or generate files with a wrong content.
> Webpack can't differentiate CSS module from JS module, therefore you MUST match only JS files.

#### [↑ back to contents](#contents)
<a id="recipe-split-css" name="recipe-split-css" href="#recipe-split-css"></a>
### How to split CSS files


> **Warning**
> 
> Splitting CSS to many chunks is principal impossible. Splitting works only for JS files.

Using the bundler plugin all your styles MUST be specified directly in template, not in Webpack entry.
Unlike using the mini-css-extract-plugin and html-webpack-plugin, using the bundler plugin you cannot import a style in JavaScript.
Importing a style in JavaScript is a dirty hack, BAD practice.

So far as the style files must be manually defined in the template, you can separate the styles into multiple bundles yourself.

For example, there are style files used in your app:
```
- components/banner/styles.scss 150 KB
- components/button/styles.scss  50 KB
- components/menu/styles.scss    50 KB
- components/modal/styles.scss  100 KB
- components/panel/styles.scss  100 KB
- styles/main.scss  250 KB
```
We want to have a bundle file ~250 KB, then create the bundles manually:

_styles/bundle01.scss_ 200 KB
```scss
@use '../components/banner/styles.scss';
@use '../components/button/styles.scss';
```

_styles/bundle02.scss_ 250 KB
```scss
@use '../components/menu/styles.scss';
@use '../components/modal/styles.scss';
@use '../components/panel/styles.scss';
```

Add the bundles in the template:

```html
<html>
<head>
  <title>Home</title>
  <link href="./styles/bundle01.scss" rel="stylesheet">
  <link href="./styles/bundle02.scss" rel="stylesheet">
  <link href="./styles/main.scss" rel="stylesheet">
</head>
<body>
  <h1>Hello World!</h1>
</body>
</html>
```

If you use vendor styles in your style file, then vendor styles will not be saved to a separate file, because `sass-loader` generates one CSS bundle code.

_style.scss_
```scss
@use "bootstrap/scss/bootstrap";
body {
  color: bootstrap.$primary;
}
// ...
```


If you want save module styles separate from your styles, then load them in a template separately:
```html
<html>
<head>
  <title>Home</title>
  <!-- load module styles separately -->
  <link href="bootstrap/dist/css/bootstrap.min.css" rel="stylesheet">
  <!-- load your styles separately -->
  <link href="./style.scss" rel="stylesheet">
</head>
<body>
  <h1>Hello World!</h1>
  <script src="./main.js"></script>
</body>
</html>
```


---

#### [↑ back to contents](#contents)
<a id="recipe-split-chunks-keep-module-name" name="recipe-split-chunks-keep-module-name" href="#recipe-split-chunks-keep-module-name"></a>
### How to keep package name for split chunks from node_modules

To save split chunks under a custom name use `optimization.cacheGroups.{cacheGroup}.name` as function.

For example, many node modules are imported in the `main.js`:
```js
import { Button } from 'bootstrap';
import _, { map } from 'underscore';
// ...
```

There is a template used the `main.js` _./src/views/index.html_:
```html
<html>
<head>
  <!-- load source script -->
  <script src="./main.js" defer="defer"></script>
</head>
<body>
  <h1>Hello World!</h1>
</body>
</html>
```

Then, use the `optimization.splitChunks.cacheGroups.{cacheGroup}.name` as following function:
```js
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: 'src/views/index.html',
      },
      js: {
        filename: 'js/[name].[contenthash:8].js',
        chunkFilename: 'js/[id].[contenthash:8].js',
      },
    }),
  ],
  optimization: {
    runtimeChunk: true,
    splitChunks: {
      // chunks: 'all', // DO NOT use it here, otherwise the compiled pages will be corrupted
      maxSize: 1000000, // split chunks bigger than 100KB, defaults is 20KB
      cacheGroups: {
        app: {
          test: /\.(js|ts)$/, // split only JS files
          chunks: 'all', // <- use it only in cache groups
          name({ context }, chunks, groupName) {
            // save split chunks of the node module under package name
            if (/[\\/]node_modules[\\/]/.test(context)) {
              const moduleName = context.match(/[\\/]node_modules[\\/](.*?)(?:[\\/]|$)/)[1].replace('@', '');
              return `npm.${moduleName}`;
            }
            // save split chunks of the application
            return groupName;
          },
        },
      },
    },
  },
};
```

> **Warning**
> 
> The group name MUST be different from the script names used in the template.
> Otherwise, a chunk name conflict occurs.
> 
> For example,
> if you are already using `main.js` in the template, the group name should not be `main`.
> Take another name, e.g. `app`.

The split files will be saved like this:
```
dist/js/runtime.9cd0e0f9.js
dist/js/npm.popperjs/core.f96a1152.js <- split chunks of node modules
dist/js/npm.bootstrap.f69a4e44.js
dist/js/npm.underscore.4e44f69a.js
dist/js/main.3010da09.js <- base code of main script
dist/js/app-5fa74877.7044e96a.js <- split chinks of main script
dist/js/app-d6ae2b10.92215a4e.js
dist/js/app-5fa74877.1aceb2db.js

```

---

#### [↑ back to contents](#contents)
## Also See

- [ansis][ansis] - The Node.js lib for ANSI color styling of text in terminal
- [pug-loader][pug-loader] The Pug loader for Webpack
- [pug-plugin][pug-plugin] The Pug plugin for Webpack

## License

[ISC](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/LICENSE)

[ansis]: https://github.com/webdiscus/ansis
[pug-loader]: https://github.com/webdiscus/pug-loader
[pug-plugin]: https://github.com/webdiscus/pug-plugin
