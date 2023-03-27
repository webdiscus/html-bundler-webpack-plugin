<div align="center">
    <h1>
        <img height="200" src="https://raw.githubusercontent.com/webdiscus/html-bundler-webpack-plugin/master/images/plugin-logo.png">
        <br>
        <a href="https://github.com/webdiscus/html-bundler-webpack-plugin">HTML Bundler Plugin for Webpack</a>
    </h1>
    <div>The plugin make easily to bundle HTML pages from templates, source styles and scripts</div>
</div>

---
[![npm](https://img.shields.io/npm/v/html-bundler-webpack-plugin?logo=npm&color=brightgreen "npm package")](https://www.npmjs.com/package/html-bundler-webpack-plugin "download npm package")
[![node](https://img.shields.io/node/v/html-bundler-webpack-plugin)](https://nodejs.org)
[![node](https://img.shields.io/github/package-json/dependency-version/webdiscus/html-bundler-webpack-plugin/peer/webpack)](https://webpack.js.org/)
[![Test](https://github.com/webdiscus/html-bundler-webpack-plugin/actions/workflows/test.yml/badge.svg)](https://github.com/webdiscus/html-bundler-webpack-plugin/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/webdiscus/html-bundler-webpack-plugin/branch/master/graph/badge.svg?token=Q6YMEN536M)](https://codecov.io/gh/webdiscus/html-bundler-webpack-plugin)
[![node](https://img.shields.io/npm/dm/html-bundler-webpack-plugin)](https://www.npmjs.com/package/html-bundler-webpack-plugin)

🚀 The best modern alternative to _html-webpack-plugin_.

This plugin allows to use an HTML template as a starting point for all dependencies used in your web application.
All source files of scripts, styles, images specified in HTML are processed automatically.
All processed files are extracted and saved to the output directory.
The plugin automatically substitutes the output filenames of the processed resources in the generated HTML file.

💡 **Highlights**

- An **entry point** is an HTML template.
- Source **scripts** and **styles** can be specified directly in HTML using `<script>` and `<link>` tags.
- Resolving source **assets** specified in standard attributes `href` `src` `srcset` etc.
- Inline JS, CSS, SVG, PNG **without additional plugins and loaders**.
- Using template engines [Eta](https://eta.js.org), [EJS](https://ejs.co), [Handlebars](https://handlebarsjs.com), [Nunjucks](https://mozilla.github.io/nunjucks/), [LiquidJS](https://github.com/harttle/liquidjs) and others **without template loaders**.
- Support for both `async` and `sync` preprocessor

✅ **Profit**

You specify all the source scripts and styles in **one right place** (in HTML),
instead of defining them in **many non-logic places**:
defining JS files in Webpack Entry, importing SCSS into a JS file.

❓If you have discovered a bug or have a feature suggestion, feel free to create an [issue](https://github.com/webdiscus/html-bundler-webpack-plugin/issues) on GitHub.


### Simple usage example

Add source scripts and styles directly to HTML:

```html
<html>
<head>
  <!-- load source styles here -->
  <link href="./style.scss" rel="stylesheet">
  <!-- load source scripts here and/or in body -->
  <script src="./main.js" defer="defer"></script>
</head>
<body>
  <h1>Hello World!</h1>
  <img src="./logo.png">
</body>
</html>
```

The generated HTML contains the output filenames of the processed source files,
while the `script` and `link` tags remain in place:

```html
<html>
<head>
  <link href="/assets/css/style.05e4dd86.css" rel="stylesheet">
  <script src="/assets/js/main.f4b855d8.js" defer="defer"></script>
</head>
<body>
  <h1>Hello World!</h1>
  <img src="/assets/img/logo.58b43bd8.png">
</body>
</html>
```

Add the HTML templates in the `entry` option (syntax is identical to [Webpack entry](https://webpack.js.org/configuration/entry-context/#entry)):

```js
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        // define templates here
        index: 'src/views/home/index.html', // output dist/index.html
        'pages/about': 'src/views/about/index.html', // output dist/pages/about.html
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
   - [test](#option-test) (process only templates matching RegExp)
   - [entry](#option-entry) (define templates or path to templates)
   - [outputPath](#option-outputPath) (output path of HTML file)
   - [filename](#option-filename) (output filename of HTML file)
   - [js](#option-js) (options to extract JS)
   - [css](#option-css) (options to extract CSS)
   - [postprocess](#option-postprocess)
   - [minify](#option-minify) (minification of generated HTML)
   - [extractComments](#option-extractComments)
   - [verbose](#option-verbose)
   - [watchFiles](#option-watchFiles)
   - [loaderOptions](#option-loaderOptions) (simplify access to loader options)
1. [Loader options](#loader-options)
   - [sources](#loader-option-sources) (processing of custom tag attributes)
   - [preprocessor](#loader-option-preprocessor) (templating)
   - [preprocessorOptions](#loader-option-preprocessorOptions) (templating options)
   - [data](#loader-option-data) (pass data into templates)
1. [Template engines](#recipe-template-engine)
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
   - [How to preload source fonts in HTML](#recipe-preload-fonts)
   - [How to inline CSS in HTML](#recipe-inline-css)
   - [How to inline JS in HTML](#recipe-inline-js)
   - [How to inline SVG, PNG images in HTML](#recipe-inline-image)
   - [How to process a PHP template](#recipe-preprocessor-php)
   - [How to pass data into multiple templates](#recipe-pass-data-to-templates)
   - [How to use some different template engines](#recipe-diff-templates)
   - [How to config `splitChunks`](#recipe-split-chunks)
   - [How to split multiple node modules and save under own names](#recipe-split-many-modules)
1. Demo examples
   - Multiple page e-shop template (`Handlebars`) [demo](https://alpine-html-bootstrap.vercel.app/) | [source](https://github.com/webdiscus/demo-shop-template-bundler-plugin)
   - Design system NIHR: Components, Elements, Layouts (`Handlebars`) [demo](https://design-system.nihr.ac.uk) | [source](https://github.com/webdiscus/design-system)
   - Asia restaurant (`Nunjucks`) [demo](https://webdiscus.github.io/demo-asia-restaurant-bundler-plugin) | [source](https://github.com/webdiscus/demo-asia-restaurant-bundler-plugin)
   - 10up / Animation Best Practices [demo](https://animation.10up.com/) | [source](https://github.com/10up/animation-best-practices)

<a id="features" name="features" href="#features"></a>
## Features

- HTML template is the entry point for all resources
- extracts CSS from source style specified in HTML via a `<link>` tag
- extracts JS from source script specified in HTML via a `<script>` tag
- resolves source files in the CSS `url()` and in HTML attributes
- extracts resolved resources to output directory
- generated HTML contains output filenames
- support the module types `asset/resource` `asset/inline` `asset` `asset/source` ([*](#note-asset-source))
- `inline CSS` in HTML
- `inline JavaScript` in HTML
- `inline image` as `base64 encoded` data-URL for PNG, JPG, etc. in HTML and CSS
- `inline SVG` as SVG tag in HTML
- `inline SVG` as `utf-8` data-URL in CSS
- support the `auto` publicPath
- enable/disable extraction of comments to `*.LICENSE.txt` file
- supports all JS template engines such as [Eta](https://eta.js.org), [EJS](https://ejs.co), [Handlebars](https://handlebarsjs.com), [Nunjucks](https://mozilla.github.io/nunjucks/), [LiquidJS](https://github.com/harttle/liquidjs) and others
- minification of generated HTML

<a id="note-asset-source" name="note-asset-source" href="#note-asset-source"></a>
(*) - `asset/source` works currently for SVG only, in a next version will work for other files too

Just one HTML bundler plugin replaces the most used functionality of the plugins and loaders:

| Package                                                                                                 | Features                                                            | 
|---------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------|
| [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin)                                  | creates HTML and inject `script` tag for compiled JS file into HTML |
| [mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin)                   | injects `link` tag for processed CSS file into HTML                 |
| [webpack-remove-empty-scripts](https://github.com/webdiscus/webpack-remove-empty-scripts)               | removes generated empty JS files                                    |
| [html-loader](https://github.com/webpack-contrib/html-loader)                                           | exports HTML                                                        |
| [html-webpack-inline-source-plugin](https://github.com/dustinjackson/html-webpack-inline-source-plugin) | inline JS and CSS into HTML from sources                            |
| [style-loader](https://github.com/webpack-contrib/style-loader)                                         | injects an inline CSS into HTML                                     |
| [posthtml-inline-svg](https://github.com/andrey-hohlov/posthtml-inline-svg)                             | injects an inline SVG icon into HTML                                |
| [resolve-url-loader](https://github.com/bholloway/resolve-url-loader)                                   | resolves a relative URL in CSS                                      |
| [svg-url-loader](https://github.com/bhovhannes/svg-url-loader)                                          | encodes a SVG data-URL as utf8                                      |


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
  <img src="./logo.png">
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
          import: 'src/views/home/index.html', // template file
          data: { title: 'Homepage', name: 'Heisenberg' } // pass variables into template
        },
      },
      js: {
        // output filename of extracted JS from source script loaded in HTML via `<script>` tag
        filename: 'assets/js/[name].[contenthash:8].js',
      },
      css: {
        // output filename of extracted CSS from source style loaded in HTML via `<link>` tag
        filename: 'assets/css/[name].[contenthash:8].css',
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

No additional template loader required. The plugin handels templates with base `EJS`-like syntax automatically.
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
Type: `RegExp` Default: `/\.(html|ejs|eta|hbs|handlebars)$/`

The `test` option allows to handel only those templates as entry points that match the name of the source file.

For example, if you have other templates, e.g. `*.njk`, as entry points, then you can set the option to match used files: `test: /\.(html|njk)$/`.

The `test` value is used by default template loader.

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
    'pages/about/index': 'src/views/about.html', // => dist/pages/about/index.html
  },
}
```

#### Advanced syntax

The entry value might be an object:

```ts
type entryValue = {
  import: string,
  filename: string
  data: object,
}
```

- `import` - a source file, absolute or relative by the Webpack config file
- `filename` - an output file, relative by the 'outputPath' option
- `data` - an object passed into [`preprocessor`](#loader-option-preprocessor) to render a template with variables

To pass global variables in all templates use the [data](#loader-option-data) loader option.

Usage example:

```js
{
  entry: {
    // output ./dist/pages/about/index.html
    'pages/about/index': { // the key is the output file name without '.html'
      import: 'src/views/about.html',
      data: {
        title: 'About',
      }
    },

    // output ./dist/pages/contact/index.html
    contact: {
      import: 'src/views/contact.html',
      filename: 'pages/contact/index.html',
    },
  },
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

When the value of the `entry` is a string, it must be a relative or absolute path to the templates' directory.
Templates matching the [test](#option-test) option are read recursively from the path.
The output files will have the same folder structure as source template directory.

For example, there are files in the template directory `./src/views/pages/`
  ```
  ./src/views/pages/index.html
  ./src/views/pages/about/index.html
  ./src/views/pages/news/sport/index.html
  ./src/views/pages/news/sport/script.js
  ./src/views/pages/news/sport/style.scss
  ...
  ```
Define the entry option as the relative path to pages:
```js
new HtmlBundlerPlugin({
  entry: 'src/views/pages/',
})
```

Internally, the entry is created with the templates matching to the `test` option.
Files that are not templates are ignored.
The output HTML filenames keep their source structure relative to the entry path:

```js
{
  index: 'src/views/pages/index.html', // => dist/index.html
  'about/index': 'src/views/pages/about/index.html', // => dist/about/index.html
  'news/sport/index': 'src/views/pages/news/sport/index.html', // => dist/news/sport/index.html
}
```

If you need to modify the output HTML filename, use the [filename](#option-filename) option as the function.

For example, we want keep a source structure for all pages, 
while `./src/views/pages/home/index.html` should not be saved as `./dist/home/index.htm`, but as `./dist/index.htm`:

```js
new HtmlBundlerPlugin({
  // path to templates
  entry: 'src/views/pages/',

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
- `@param {AssetInfo} assetInfo` Mostly this object is empty.
- `@return {string}` The name or template string of output file.


#### [↑ back to contents](#contents)
<a id="option-js" name="option-js" href="#option-js"></a>
### `js`
Type: `Object`\
Default properties:
```js
{
  filename: '[name].js', 
  outputPath: null,
  inline: false,
  verbose: false,
}
```

- `filename` - an output filename of extracted JS. Details see by [filename option](#option-filename).
- `outputPath` - an output path of extracted CSS. Details see by [outputPath option](#option-outputPath).
- `inline` - globally inline all extracted JS into HTML, available values:
  - `false` - extract processed JS in an output file, defaults
  - `true` - inline processed JS into HTML
  - `'auto'` - in `development` mode - inline JS, in `production` mode - extract in a file
- `verbose` - enable/disable display process information for scripts

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

> **Note**
>
> To display all extracted JS files, enable the [`verbose`](#option-verbose) option.


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
  verbose: false,
}
```

- `test` - an RegEpx to process all source styles that pass test assertion
- `filename` - an output filename of extracted CSS. Details see by [filename option](#option-filename).
- `outputPath` - an output path of extracted CSS. Details see by [outputPath option](#option-outputPath).
- `inline` - globally inline all extracted CSS into HTML, available values:
  - `false` - extract processed CSS in an output file, defaults
  - `true` - inline processed CSS into HTML via `style` tag
  - `'auto'` - in `development` mode - inline CSS, in `production` mode - extract in a file
- `verbose` - enable/disable display process information for styles

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
> Don't use `mini-css-extract-plugin` or `style-loader`, they are not required more.\
> The `html-bundler-webpack-plugin` extracts CSS much faster than other plugins and resolves all asset URLs in CSS, therefore the `resolve-url-loader` is redundant too.

> **Note**
>
> To display all extracted CSS files, enable the [`verbose`](#option-verbose) option.

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
  sourceFile: string,
  outputPath: string,
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

- `verbose: boolean` - whether information should be displayed
- `isEntry: boolean` - if is `true`, the resource is the entry point, otherwise is a resource loaded in the entry point
- `filename: string|function` - a filename of the resource, see [filename](https://webpack.js.org/configuration/output/#outputfilename)
- `sourceFile: string` - a full path of the source file
- `outputPath: string` - a full path of the output directory
- `assetFile: string` - an output asset file relative by outputPath

Return new content as a `string`.
If return `null`, the result processed via Webpack plugin is ignored and will be saved a result processed via the loader.

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
  removeRedundantAttributes: true,
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
- `auto` - in `development` mode disable minification, in `production` mode enable minification
- `{}` - an object to set custom options, this object are merged with `default options`, see [options reference](https://github.com/terser/html-minifier-terser#options-quick-reference)


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

The verbose option allow to display detailed processing information in console.

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
  test: /.(html|ejs|eta)$/,
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

The `filter` is called for all attributes of the tag defined as defaults and in `sources` option.
The argument is an object containing the properties:
- `tag: string` - a name of the HTML tag
- `attribute: string` - a name of the HTML attribute
- `value: string` - a value of the HTML attribute
- `attributes: string` - all attributes of the tag
- `resourcePath: string` - a path of the HTML template

The processing of an attribute can be ignored by returning `false`.

To disable the processing of all attributes, set the `sources` option as `false`.

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
    // otherwise return 'true' or nothing to allow processing
  },
}
```

The default sources can be extended with new tags and attributes.

For example, add the processing of the `data-src` and `data-srcset` attributes to the `img` tag:

```js
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
module.exports = {
  module: {
    rules: [
      {
        test: /\.html$/,
        loader: HtmlBundlerPlugin.loader,
        options: {
          sources: [
            {
              tag: 'img',
              attributes: ['data-src', 'data-srcset'],
            }
          ],
        },
      },
    ],
  },
};
```

You can use the `filter` function to allow the processing only specific attributes.

For example, allow processing only for images in `content` attribute of the `meta` tag:

```html
<html>
<head>
  <!-- ignore the attribute via filter -->
  <meta name="theme-color" content="#ffffff">
  <!-- resolve the 'content' attribute if 'name' containing special values  -->
  <meta name="twitter:image" content="./image.png">
  <meta name="logo" content="./logo.png">
</head>
<body>
  <!-- resolve 'src' attribute containing relative path -->
  <img src="./image.png">
</body>
</html>
```

_webpack.config.js_
```js
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
module.exports = {
  module: {
    rules: [
      {
        test: /\.html$/,
        loader: HtmlBundlerPlugin.loader,
        options: {
          sources: [
            {
              tag: 'meta',
              attributes: ['content'],
              // handles an image in the 'content' attrubute of the 'meta' tag 
              // when the 'name' attribute is one of: twitter:image, logo
              filter: ({ attributes }) => {
                const allowedNames = ['twitter:image', 'logo'];
                if ('name' in attributes && allowedNames.indexOf(attributes.name) < 0) {
                  return false;
                }
              },
            }
          ],
        },
      },
    ],
  },
};
```

The filter can disable an attribute of a tag.

For example, disable the processing of default attribute `srcset` of the `img` tag:

```js
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
module.exports = {
  module: {
    rules: [
      {
        test: /\.html$/,
        loader: HtmlBundlerPlugin.loader,
        options: {
          sources: [
            {
              tag: 'img',
              filter: ({ attribute }) => attribute !== 'srcset',
            }
          ],
        },
      },
    ],
  },
};
```


#### [↑ back to contents](#contents)
<a id="loader-option-preprocessor" name="loader-option-preprocessor" href="#loader-option-preprocessor"></a>
### `preprocessor`
Type:
```ts
type preprocessor = 'eta' | 'ejs' | 'handlebars';
```

The default value is `'eta'`, see [Eta](https://eta.js.org) templating engine. 
The npm package `eta` is already installed with this plugin.

> The `Eta` has the EJS-like syntax, is only 2KB gzipped and is much fasted than EJS.

If the `preprocessor` is a string value one of listed above, will be used the preconfigured templating compiler. 
You can pass a custom options of the template engine using the [preprocessorOptions](#loader-option-preprocessorOptions).

For example, if you have `EJS` templates:

install npm package `ejs`
```
npm i -D ejs
```

set the `preprocessor` as `ejs`
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

Type:
```ts
type preprocessor = (
  template: string,
  loaderContext: LoaderContext
) => string|Promise;
```

To use any templating engine you can define the `preprocessor` as a function.

For example, the default `preprocessor` is defined as following function:
```js
const config = {
  async: false, // defaults is false, wenn is true then must be used `await includeFile()`
  useWith: true, // allow to use variables in template without `it.` scope
  root: process.cwd(), // root path for includes with an absolute path (e.g., /file.html)
};
preprocessor = (template, { data }) => Eta.render(template, data, config);
```


The `template` is the raw content of a template file defined in the [`entry`](#option-entry) option.\
The `loaderContext` is the [Loader Context](https://webpack.js.org/api/loaders/#the-loader-context) object contained useful properties:
- `mode: string` - a Webpack mode: `production`, `development`, `none`
- `rootContext: string` - a path to Webpack context
- `resource: string` - a template file, including query
- `resourcePath: string` - a template file
- `data: object|null` - variables passed form [`entry`](#option-entry)

The preprocessor is called for each entry file, before processing of the content.
This function can be used to compile the template with any template engine,
such as [Eta](https://eta.js.org), [EJS](https://ejs.co), [Handlebars](https://handlebarsjs.com), [Nunjucks](https://mozilla.github.io/nunjucks), etc.

Returns new content as a `string` or `Promise` for async processing.

The usage example for your own `sync` render function:

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

With the `preprocessorOptions` you can pass template engine options when used the [preprocessor](#loader-option-preprocessor) as the string: `eta` `ejs` or `handlebars`.
Each preprocessor has its own options depend on using template engine.

<a id="loader-option-preprocessorOptions-eta" name="loader-option-preprocessorOptions-eta" href="#loader-option-preprocessorOptions-eta"></a>
**Options for `preprocessor: 'eta'`** (default)
```js
loaderOptions: {
  preprocessor: 'eta',
  preprocessorOptions: {
    async: false, // defaults 'false', wenn is 'true' then must be used `await includeFile()`
    useWith: true, // defaults 'true', use variables in template without `it.` scope
    // defaults process.cwd(), root path for includes with an absolute path (e.g., /file.html)
    root: path.join(__dirname, 'src/views/'), // defaults process.cwd()
    // defaults [], an array of paths to use when resolving includes with relative paths
    views: [
      path.join(__dirname, 'src/views/includes'),
      path.join(__dirname, 'src/views/partials'),
    ],
  },
},
```
The complete list of options see [here](https://eta.js.org/docs/api/configuration).

For example, there are template page and partials:
```
src/views/page/home.html
src/views/includes/gallery.html
src/views/includes/teaser.html
src/views/partials/footer.html
src/views/partials/menu/nav.html
src/views/partials/menu/top/desktop.html
```

Include the partials in the `src/views/page/home.html` template with the `includeFile()`:
```html
<!-- root path -->
<%~ includeFile('/includes/gallery.html') %>

<!-- views paths -->
<%~ includeFile('teaser.html') %>
<%~ includeFile('menu/nav.html') %>
<%~ includeFile('menu/top/desktop.html') %>
<%~ includeFile('footer.html') %>
```

If you have partials with `.eta` extensions, then the extension can be omitted.

<a id="loader-option-preprocessorOptions-ejs" name="loader-option-preprocessorOptions-ejs" href="#loader-option-preprocessorOptions-ejs"></a>
**Options for `preprocessor: 'ejs'`**
```js
loaderOptions: {
  preprocessor: 'ejs',
  preprocessorOptions: {
    async: false, // defaults 'false'
    // defaults process.cwd(), root path for includes with an absolute path (e.g., /file.html)
    root: path.join(__dirname, 'src/views/'), // defaults process.cwd()
    // defaults [], an array of paths to use when resolving includes with relative paths
    views: [
      path.join(__dirname, 'src/views/includes'),
      path.join(__dirname, 'src/views/partials'),
    ],
  },
},
```
The complete list of options see [here](https://ejs.co/#docs).

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

<a id="loader-option-preprocessorOptions-hbs" name="loader-option-preprocessorOptions-hbs" href="#loader-option-preprocessorOptions-hbs"></a>
**Options for `preprocessor: 'handlebars'`**

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
      path.join(__dirname, 'src/views/includes'),
      path.join(__dirname, 'src/views/partials'),
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

If you use the partials syntax `{{> footer }}` to include a file, then use the `partials` option.
Partials will be auto-detected in paths recursively and registered under their relative paths, without an extension.

```js
loaderOptions: {
  preprocessor: 'handlebars',
  preprocessorOptions: {
    // an array of paths to partials
    partials: [
      path.join(__dirname, 'src/views/includes'),
      path.join(__dirname, 'src/views/partials'),
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

The `compile` options see [here](https://handlebarsjs.com/api-reference/compilation.html).

---


#### [↑ back to contents](#contents)
<a id="loader-option-data" name="loader-option-data" href="#loader-option-data"></a>
### `data`
Type: `Object` Default: `{}`

The properties defined in the `data` loader option are available as variables in all templates defined in the `entry` option.
Use this option to pass the global variable into all templates.

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
          import: './src/home.html',
          data: {
            // page specifically variables
            title: 'Home', // overrides the `title` defined in the loader data
            headline: 'Homepage',
          },
        },
        about: './src/about.html',
      },
      loaderOptions: {
        data: {
          // global variables for all pages
          title: 'Default Title',
          globalData: 'Global Data',
        },
      },
    }),
  ],
};
```

In the `./src/home.html` template are available following variables:
```js
{
  title: 'Home',
  headline: 'Homepage',
  globalData: 'Global Data',
}
```

In the `./src/about.html` template are available following variables:
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
  <%~ includeFile('/src/views/partials/footer') %>
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
  },
})
```

For `eta` preprocessor options see [here](#loader-option-preprocessorOptions-eta).

<a id="eta-compatibilty-with-ejs" name="eta-compatibilty-with-ejs" href="#eta-compatibilty-with-ejs"></a>
> **Warning**
>
> For compatibility the Eta compiler with the EJS templates, the default preprocessor use the `useWith: true` Eta option
> to use variables in template without the Eta-specific `it.` scope

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
      },
    }),
  ],
};
```

For `ejs` preprocessor options see [here](#loader-option-preprocessorOptions-ejs).

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
      },
    }),
  ],
};
```

For `handlebars` preprocessor options see [here](#loader-option-preprocessorOptions-hbs).


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
        preprocessor: 'nunjucks',
      },
    }),
  ],
};
```

#### [↑ back to contents](#contents)
<a id="using-template-liquidjs" name="using-template-liquidjs" href="#using-template-liquidjs"></a>
### Using the LiquidJS

You need to install the `liquidjs` package:
```
npm i -D liquidjs
```

For example, there is the template _src/views/page/index.liquidjs_
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
      test: /\.(html|liquidjs)$/, // add the test option to match *.liquidjs files in entry
      entry: {
        index: {
          import: './src/views/page/index.liquidjs',
          data: {
            headline: 'Breaking Bad',
            people: ['Walter White', 'Jesse Pinkman'],
          },
        },
      },
      loaderOptions: {
        // async parseAndRender method return a promise
        preprocessor: (content, { data }) => LiquidEngine.parseAndRender(content, data),
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
## How to use source images in HTML

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
## How to preload source fonts in HTML

Add to Webpack config the rule:
```js
module: {
  rules: [
    {
      test: /\.(eot|ttf|woff|woff2)$/,
      type: 'asset/resource',
      generator: {
        filename: 'assets/fonts/[name][ext]',
      },
    },
  ],
}
```

Add a source file using a relative path or Webpack alias in HTML:
```html
<html>
<head>
  <link href="./font1.woff2" rel="preload" as="font" type="font/woff2" />
  <link href="./font2.woff2" rel="preload" as="font" type="font/woff2" />
</head>
<body>
  <h1>Hello World!</h1>
</body>
</html>
```

The generated HTML contains output fonts filenames:
```html
<html>
<head>
  <link href="/assets/fonts/font1.woff2" rel="preload" as="font" type="font/woff2" />
  <link href="/assets/fonts/font2.woff2" rel="preload" as="font" type="font/woff2" />
</head>
<body>
  <h1>Hello World!</h1>
</body>
</html>
```

> **Note**
>
> You don't need a plugin to copy files from source directory to public.

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
        // render template with page-specific variables defined in entry
        preprocessor: (template, { data }) => Nunjucks.renderString(template, data),
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
          preprocessor: (content, { data }) => ejs.render(content, data),
        },
      },
      // the rule for Handlebars
      {
        test: /\.hbs$/,
        loader: HtmlBundlerPlugin.loader, // universal template loader
        options: {
          preprocessor: (content, { data }) => Handlebars.compile(content)(data),
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
> Splitting CSS to many chunk is principal impossible. Splitting works only for JS files.
> If you use vendor styles in your style file, e.g.:
>
> _style.scss_
> ```scss
> @use "bootstrap/scss/bootstrap";
> body {
>   color: bootstrap.$primary;
> }
> ```
>
> Then vendor styles will not be saved to a separate file, because `sass-loader` generates one CSS bundle code.
> Therefore vendor styles should be loaded in a template separately.

> **Warning**
>
> If you will to use the `test` as `/[\\/]node_modules[\\/]`, without extension specification,
> then Webpack concatenates JS code together with CSS in one file,
> because Webpack can't differentiate CSS module from JS module, therefore you MUST match only JS files.
>
> If you want save module styles separate from your styles, then load them in a template separately:
> ```html
> <html>
> <head>
>   <title>Home</title>
>   <!-- load module styles separately -->
>   <link href="bootstrap/dist/css/bootstrap.min.css" rel="stylesheet">
>   <!-- load your styles separately -->
>   <link href="./style.scss" rel="stylesheet">
> </head>
> <body>
>   <h1>Hello World!</h1>
>   <script src="./main.js"></script>
> </body>
> </html>
> ```

---

#### [↑ back to contents](#contents)
<a id="recipe-split-many-modules" name="recipe-split-many-modules" href="#recipe-split-many-modules"></a>
### How to split multiple node modules and save under own names

If you use many node modules and want save each module to separate file then use `optimization.cacheGroups.{cacheGroup}.name` as function.

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
      },
    }),
  ],
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
      minSize: 10000, // extract modules bigger than 10KB, defaults is 30KB
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/].+\.(js|ts)$/, // split JS only, ignore CSS modules
          // save chunk under a name
          name(module, chunks, groupName) {
            const moduleName = module.resourceResolveData.descriptionFileData.name.replace('@', '');
            return `${groupName}.${moduleName}`;
          },
        },
      },
    },
  },
};
```

The split files will be saved like this:
```
dist/js/vendor.popperjs/core.f96a1152.js <- `popperjs/core` is extracted from bootstrap
dist/js/vendor.bootstrap.f69a4e44.js
dist/js/vendor.underscore.4e44f69a.js
dist/js/runtime.9cd0e0f9.js <- common runtime code
dist/js/script.3010da09.js
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
