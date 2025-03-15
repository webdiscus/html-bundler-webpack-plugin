<a id="top" name="top"></a>

<div align="center">
    <img height="200" src="images/plugin-logo.png">
    <h1 align="center">
        <a href="https://github.com/webdiscus/html-bundler-webpack-plugin">HTML Bundler Plugin for Webpack</a><br>
        <sub>All-in-one Web Bundler</sub><br>
    </h1>
</div>

[![npm](https://img.shields.io/npm/v/html-bundler-webpack-plugin?logo=npm&color=brightgreen 'npm package')](https://www.npmjs.com/package/html-bundler-webpack-plugin 'download npm package')
[![node](https://img.shields.io/node/v/html-bundler-webpack-plugin)](https://nodejs.org)
[![node](https://img.shields.io/github/package-json/dependency-version/webdiscus/html-bundler-webpack-plugin/peer/webpack)](https://webpack.js.org)
[![Test](https://github.com/webdiscus/html-bundler-webpack-plugin/actions/workflows/test.yml/badge.svg)](https://github.com/webdiscus/html-bundler-webpack-plugin/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/webdiscus/html-bundler-webpack-plugin/branch/master/graph/badge.svg?token=Q6YMEN536M)](https://codecov.io/gh/webdiscus/html-bundler-webpack-plugin)
[![node](https://img.shields.io/npm/dm/html-bundler-webpack-plugin)](https://www.npmjs.com/package/html-bundler-webpack-plugin)

> This plugin is all you need to generate a complete single- or multi-page website from your source assets.

The plugin automates the processing of source files such as JS/TS, SCSS, images and other assets referenced in an HTML or template file.
This plugin will generate an HTML file containing all the necessary links to JS, CSS, images and other resources.

## Why use the HTML Bundler Plugin?

This plugin is a powerful alternative to [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin) and a replacement for many [plugins and loaders](#list-of-plugins).

The HTML Bundler Plugin works a bit differently than `html-webpack-plugin`.
It doesn't just inject JavaScript and CSS into an HTML.
Instead, it resolves all the source files of the assets referenced directly in the template
and ensures the generated HTML contains the correct output URLs of resources after Webpack processes them.
Additionally, CSS extracted from styles imported in JS can be injected into HTML as a `<link>` tag or as an inlined CSS.

---

<h3 align="center">
📋 <a href="#contents">Table of Contents</a> 🚀 <a href="#install">Install and Quick Start</a> 🖼 <a href="#usage-examples">Usage examples</a> 🔆 <a href="#whats-new">What's New</a>
</h3>

<!--
#### 📋 [Table of Contents](#contents) 🚀 [Install and Quick Start](#install) 🖼 [Usage examples](#usage-examples)
-->

---

## 💡 Highlights

- An [entry point](#option-entry) is any HTML template. **Start from HTML**, not from JS.
- **Automatically** processes templates found in the [entry directory](#option-entry-path).
- Build-in support for [template engines](#template-engine): [Eta](#using-template-eta), [EJS](#using-template-ejs), [Handlebars](#using-template-handlebars), [Nunjucks](#using-template-nunjucks), [Pug](#using-template-pug), [Tempura](#using-template-tempura), [TwigJS](#using-template-twig), [LiquidJS](#using-template-liquidjs).
- Build-in support for **Markdown** `*.md` files in templates, see [Markdown demo](https://stackblitz.com/edit/markdown-to-html-webpack?file=webpack.config.js) in browser.
- **Source files** of [`script`](#option-js) and [`style`](#option-css) can be specified directly in HTML:
  - `<link href="./style.scss" rel="stylesheet">`\
  No longer need to define source style files in Webpack entry or import styles in JavaScript.
  - `<script src="./app.ts" defer="defer"></script>`\
  No longer need to define source JavaScript files in Webpack entry.
- **Resolves** [source files](#loader-option-sources) of assets in [attributes](#loader-option-sources-default) such as `href` `src` `srcset` using **relative path** or **alias**:
  - `<link href="../images/favicon.svg" type="image/svg" rel=icon />`
  - `<img src="@images/pic.png" srcset="@images/pic400.png 1x, @images/pic800.png 2x" />`\
  Source files will be resolved, processed and auto-replaced with correct URLs in the generated HTML.
- **Resolves** [route URLs](#option-router) in `a.href`, useful for navigation in multi-pages.
- **Inlines** [JS](#recipe-inline-js), [CSS](#recipe-inline-css) and [Images](#recipe-inline-image) into HTML. See [how to inline all resources](#recipe-inline-all-assets-to-html) into single HTML file.
- Supports the [HMR for CSS](#option-css-hot) to update CSS in browser without a full reload.
- Watches for changes in the [data file](#option-entry-data) linked to the template in the plugin option.
- Generates the [preload](#option-preload) tags for fonts, images, video, scripts, styles.
- Generates the [integrity](#option-integrity) attribute in the `link` and `script` tags.
- Generates the [favicons](#favicons-bundler-plugin) of different sizes for various platforms.
- You can create custom plugins using the provided [Plugin Hooks](#plugin-hooks-and-callbacks).
- Over 700 [tests](https://github.com/webdiscus/html-bundler-webpack-plugin/tree/master/test) for various use cases.

See [full list of features](#features).

## HTML template as entry point

<center>
  <img width="830" style="max-width: 100%;" src="images/assets-graph.png" alt="assets graph">
</center>

The **HTML Bundler** generates static HTML or [template function](#template-in-js) from [various templates](#template-engine) containing source files of scripts, styles, images, fonts and other resources, similar to how it works in [Vite](https://vitejs.dev/guide/#index-html-and-project-root).
This plugin looks at the template files in [entry option](#option-entry) to start building the bundle.
The [source files](#loader-option-sources) of dependencies (scripts, styles, etc.) can be defined directly in the template.

The plugin **resolves source files** of assets in templates and replaces them with correct output URLs in the generated HTML.
The resolved assets will be processed via Webpack plugins/loaders and placed into the output directory.
You can use a relative path or Webpack alias to a source file.

A template imported in JS will be compiled into [template function](#template-in-js). You can use the **template function** in JS to render the template with variables in runtime on the client-side in the browser.

<!--
This plugin is an advanced replacement of [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin) and many other [plugins and loaders](#list-of-plugins).
-->

For example, using source asset files is HTML template _./src/views/index.html_:

```html
<html>
  <head>
    <!-- relative path to SCSS source file -->
    <link href="../scss/style.scss" rel="stylesheet" />
    <!-- relative path to TypeScript source file -->
    <script src="../app/main.ts" defer="defer"></script>
  </head>
  <body>
    <h1>Hello World!</h1>
    <!-- relative path to image source file -->
    <img src="../assets/images/picture1.png" />
    <!-- Webpack alias as path (src/assets/images/) to image source file -->
    <img src="@images/picture2.png" />
  </body>
</html>
```

The folder structure of the example:
```
./src/views/index.html
./src/app/main.ts
./src/scss/style.scss
./src/assets/images/picture1.png
./src/assets/images/picture2.png
```
<!--
```
src/
   ├── views/
   │   └── index.html
   ├── app/
   │   └── main.ts
   ├── scss/
   │   └── style.scss
   └── assets/
       └── images/
           └── picture1.png
           └── picture2.png
```
-->

Simple and clear Webpack configuration:
```js
const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  output: {
    path: path.resolve(__dirname, 'dist'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      // specify the entry points for HTML pages (or a template)
      entry: {
        index: 'src/views/index.html', // save generated HTML into dist/index.html
      },
      js: {
        filename: 'js/[name].[contenthash:8].js', // JS output filename
      },
      css: {
        filename: 'css/[name].[contenthash:8].css', // CSS output filename
      },
    }),
  ],

  module: {
      rules: [
        {
          test: /\.s?css$/,
          use: ['css-loader', 'sass-loader'],
        },
        {
          test: /\.(ico|png|jpe?g|svg)/,
          type: 'asset/resource',
        },
      ],
    },
};
```
See full list of all [plugin options](#toc-plugin-options).

[Open an example in StackBlitz](https://stackblitz.com/edit/hello-world-webpack?file=webpack.config.js)

> [!TIP]
> To resolve route URLs in `a.href` for navigation across multiple pages, you can enable the [router](#option-router) option.

---
> 🦖 **Mozilla** already uses this plugin to build static HTML files for the [Mozilla AI GUIDE](https://github.com/mozilla/ai-guide) site.
>
> The plugin has been actively developed for more than 2 years, and since 2023 it is open source.\
> Please support this project by giving it a star ⭐.
---


## ❤️ Sponsors & Patrons

Thank you to all our sponsors and patrons!

<a href="https://www.jetbrains.com/"><img src="https://avatars.githubusercontent.com/u/878437?s=50&v=4" title="JetBrains" alt="JetBrains"></a>
<a href="https://github.com/getsentry"><img src="https://avatars.githubusercontent.com/u/1396951?s=50&v=4" title="Sentry" alt="Sentry"></a>
<a href="https://github.com/stackaid"><img src="https://avatars.githubusercontent.com/u/84366591?s=50&v=4" title="StackAid" alt="StackAid"></a>
<a href="https://github.com/pirang"><img src="https://avatars.githubusercontent.com/u/6986749?s=50&v=4" title="Pirang" alt="Pirang"></a>
<a href="https://www.patreon.com/user?u=96645548"><img src="https://c10.patreonusercontent.com/4/patreon-media/p/user/96645548/020234154757463b939824efe62db137/eyJ3IjoyMDB9/1.jpeg?token-time=2145916800&token-hash=GYnR3xvy7qBr2w1CihOfDOq87nOr4AbuW0ytvwg7Kgs%3D" width="50" title="Buckley Robinson"></a>
<a href="https://github.com/MarcelRobitaille"><img src="https://avatars.githubusercontent.com/u/8503756?s=50&v=4" title="Marcel Robitaille" alt="Marcel Robitaille"></a>
<a href="https://github.com/kannwism"><img src="https://avatars.githubusercontent.com/u/18029781?s=50&v=4" width="50" title="Marian Kannwischer (kannwism)"></a>
<a href="https://www.patreon.com/user?u=96645548"><img src="https://c10.patreonusercontent.com/4/patreon-media/p/user/43568167/0ef77126597d460c9505bdd0aea2eea9/eyJ3IjoyMDB9/1.png?token-time=2145916800&token-hash=7izh1FZTToAqf4Qks3Qrk8YcNbGymF-sBi0hkK_aJO8%3D" width="50" title="Raymond Ackloo"></a>
<a href="https://github.com/chkpnt"><img src="https://avatars.githubusercontent.com/u/1956979?s=50&v=4" width="50" title="Gregor Dschung" alt="Gregor Dschung"></a>
<a href="https://github.com/daltonboll"><img src="https://avatars.githubusercontent.com/u/5821829?v=4" width="50" title="Dalton Boll" alt="daltonboll"></a>

---

#### [↑ top](#top) | [↓ contents](#contents)


## ⚙️ How the plugin works

The plugin resolves references in the HTML template and adds them to the Webpack compilation.
Webpack will automatically process the source files, and the plugin replaces the references with their output filenames in the generated HTML.
See [how the plugin works under the hood](#plugin-hooks-and-callbacks).

<img width="830" style="max-width: 100%;" src="images/workflow.png">

## ❓Question / Feature Request / Bug

If you have discovered a bug or have a feature suggestion, feel free to create an [issue](https://github.com/webdiscus/html-bundler-webpack-plugin/issues) on GitHub.

## 📚 Read it

- [Using HTML Bundler Plugin for Webpack to generate HTML files](https://dev.to/webdiscus/using-html-bundler-plugin-for-webpack-to-generate-html-files-30gd)
- [Keep output directory structure in Webpack](https://dev.to/webdiscus/how-to-keep-the-folder-structure-of-source-templates-in-webpack-for-output-html-files-39bj)
- [Auto generate an integrity hash for `link` and `script` tags](https://dev.to/webdiscus/webpack-auto-generate-an-integrity-hash-for-link-and-script-tags-in-an-html-template-48p5)
- [Use a HTML file as an entry point?](https://github.com/webpack/webpack/issues/536) (Webpack issue, #536)
- [Comparison and Benchmarks of Node.js libraries to colorize text in terminal](https://dev.to/webdiscus/comparison-of-nodejs-libraries-to-colorize-text-in-terminal-4j3a) (_offtopic_)

<a id="whats-new" name="whats-new"></a>

## 🔆 What's New in v4

- **NEW** added [router](#option-router) to resolve routes in `a.href`, useful for multi-pages (since `v4.18.0`).
- **NEW** you can include Markdown `*.md` files in your HTML template (since `v4.6.0`).
- **NEW** added supports the [HMR for CSS](#option-css-hot) (since `v4.5.0`).
- **NEW** added supports the [multiple configurations](https://webpack.js.org/configuration/configuration-types/#exporting-multiple-configurations).
- **SUPPORTS** Webpack version `5.96+` (since `v4.2.0`).
- **SUPPORTS** Webpack version `5.81+` (since `v4.0.0`).
- **SUPPORTS** Node.js version `18+`.
- **BREAKING CHANGES** see in the [changelog](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/CHANGELOG.md#v4-0-0).

## 🔆 What's New in v3

- **NEW** added supports the [template function](#template-in-js) in JS runtime on the client-side.
- **NEW** added [Pug](#using-template-pug) preprocessor.
- **NEW** added [Twig](#using-template-twig) preprocessor.
- **NEW** added supports the dynamic import of styles.
- **NEW** added supports the [CSS Modules](#recipe-css-modules) for styles imported in JS.
- **NEW** added CSS extraction from **styles** used in `*.vue` files.
- **NEW** added [Hooks & Callbacks](#plugin-hooks-and-callbacks). Now you can create own plugin to extend this plugin.
- **NEW** added the build-in [FaviconsBundlerPlugin](#favicons-bundler-plugin) to generate and inject favicon tags.

## 🔆 What's New in v2

- **NEW** added importing style files in JavaScript.
- **NEW** added support the [integrity](#option-integrity).
- **NEW** you can add/delete/rename a template file in the [entry path](#option-entry-path) without restarting Webpack.

For full release notes see the [changelog](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/CHANGELOG.md).

## ⚠️ Limitations

### Cache type

The current version works stably with `cache.type` as `'memory'` (Webpack's default setting).

Support for the `'filesystem'` cache type is in beta.
It works stably in standard use cases, but it cannot be guaranteed to work in all use cases.
If you have any problems, feel free to create an [issue](https://github.com/webdiscus/html-bundler-webpack-plugin/issues).

---

#### [↑ top](#top) | [↓ contents](#contents)


<a id="install" name="install"></a>

## Install and Quick start

Install the `html-bundler-webpack-plugin`:

```bash
npm install html-bundler-webpack-plugin --save-dev
```

It's recommended to combine `html-bundler-webpack-plugin` with the [css-loader](https://github.com/webpack-contrib/css-loader) and the [sass-loader](https://github.com/webpack-contrib/sass-loader).\
Install additional packages for styles:

```bash
npm install css-loader sass-loader sass --save-dev
```

Start with an HTML template. Add the `<link>` and `<script>` tags.
You can include asset source files such as SCSS, JS, images, and other media files directly in an HTML template.

The plugin resolves `<script src="...">` `<link href="...">` and `<img src="..." srcset="...">` that references your script, style and image source files.

For example, there is the template _./src/views/home.html_:

```html
<html>
  <head>
    <!-- variable from Webpack config -->
    <title><%= title %></title>
    <!-- relative path to favicon source file -->
    <link href="./favicon.ico" rel="icon" />
    <!-- relative path to SCSS source file -->
    <link href="./style.scss" rel="stylesheet" />
    <!-- relative path to JS source file -->
    <script src="./main.js" defer="defer"></script>
  </head>
  <body>
    <h1>Hello World!</h1>
    <!-- relative path to image source file -->
    <img src="./picture.png" />
  </body>
</html>
```

All source filenames should be relative to the entrypoint template, or you can use [Webpack alias](https://webpack.js.org/configuration/resolve/#resolvealias).
The references are rewritten in the generated HTML so that they point to the correct output files.

The generated HTML contains URLs of the output filenames:

```html
<html>
  <head>
    <title>Homepage</title>
    <link href="img/favicon.3bd858b4.ico" rel="icon" />
    <link href="css/style.05e4dd86.css" rel="stylesheet" />
    <script src="js/main.f4b855d8.js" defer="defer"></script>
  </head>
  <body>
    <h1>Hello World!</h1>
    <img src="img/picture.58b43bd8.png" />
  </body>
</html>
```

<a id="simple-webpack-config" name="simple-webpack-config"></a>

**Pages** can be defined in the [`entry`](#option-entry) option.
**JS** and **CSS** can be configured using the [`js`](#option-js) and [`css`](#option-css) options.

If the `entry` option is a path, the plugin finds all templates automatically
and keep the same directory structure in the output directory.

If the `entry` option is an object, the key is an output filename without `.html` extension and the value is a template file.


```js
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  plugins: [
    new HtmlBundlerPlugin({
      // automatically processing all templates in the path
      entry: 'src/views/',

      // - OR - define pages manually (key is output filename w/o `.html`)
      entry: {
        index: 'src/views/home.html', // => dist/index.html
        'news/sport': 'src/views/news/sport/index.html', // => dist/news/sport.html
      },

      // - OR - define pages with variables
      entry: [
        {
          import: 'src/views/home.html', // template file
          filename: 'index.html', // => dist/index.html
          data: { title: 'Homepage' }, // pass variables into template
        },
        {
          import: 'src/views/news/sport/index.html', // template file
          filename: 'news/sport.html', // => dist/news/sport.html
          data: { title: 'Sport news' }, // pass variables into template
        },
      ],

      // - OR - combine both the pages with and w/o variables in one entry
      entry: {
        // simple page config w/o variables
        index: 'src/views/home.html', // => dist/index.html
        // advanced page config with variables
        'news/sport': { // => dist/news/sport.html
          import: 'src/views/home.html', // template file
          data: { title: 'Sport news' }, // pass variables into template
        },
      },

      js: {
        // JS output filename, used if `inline` option is false (defaults)
        filename: 'js/[name].[contenthash:8].js',
        //inline: true, // inlines JS into HTML
      },
      css: {
        // CSS output filename, used if `inline` option is false (defaults)
        filename: 'css/[name].[contenthash:8].css',
        //inline: true, // inlines CSS into HTML
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
        test: /\.(ico|png|jpe?g|webp|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext][query]',
        },
      },
    ],
  },
};
```

> ℹ️ **Note**
>
> To define the JS output filename, use the `js.filename` option of the plugin.\
> Don't use Webpack's `output.filename`, hold all relevant settings in one place - in plugin options.\
> Both places have the same effect, but `js.filename` has priority over `output.filename`.

For `splitChunks` see [How to configure splitChunks](#recipe-split-chunks).

No additional template loader is required. The plugin handles templates with base `EJS`-like syntax automatically.
The default templating engine is [Eta](https://eta.js.org).

For using the native `EJS` syntax see [Templating with EJS](#using-template-ejs).\
For using the `Handlebars` see [Templating with Handlebars](#using-template-handlebars).\
For other templates see [Template engines](#template-engine).

For custom templates, you can use the [preprocessor](#loader-option-preprocessor) option to handle any template engine.

<table>
<tr>
<td>Simple example SPA</td>
<td>

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/edit/hello-world-webpack?file=webpack.config.js)

</td>
</tr>
<tr>
<td>Automatically processing many HTML templates</td>
<td>

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/edit/webpack-webpack-js-org-diop8g?file=webpack.config.js)

</td>
</tr>
<tr>
<td>Create multiple HTML pages</td>
<td>

See [boilerplate](https://github.com/webdiscus/webpack-html-scss-boilerplate)

</td>
</tr>
</table>

---

#### [↑ top](#top)

<a id="contents" name="contents"></a>

## Table of Contents

1. [Features](#features)
1. [Install and Quick start](#install)
1. [Webpack options](#webpack-options)
   - [output](#webpack-option-output)
     - [path](#webpack-option-output-path)
     - [publicPath](#webpack-option-output-publicpath)
     - [filename](#webpack-option-output-filename)
   - [entry](#webpack-option-entry)
1. [Build-in Plugins](#build-in-plugins)
   - [FaviconsBundlerPlugin](#favicons-bundler-plugin) (generates favicon tags)
1. [Third-party Plugins](#third-party-plugins)
1. [Hooks & Callbacks](#plugin-hooks-and-callbacks)
   - [beforePreprocessor](#hook-beforePreprocessor)
   - [preprocessor](#hook-preprocessor)
   - [resolveSource](#hook-resolveSource)
   - [postprocess](#hook-postprocess)
   - [beforeEmit](#hook-beforeEmit)
   - [afterEmit](#hook-afterEmit)
   - [integrityHashes](#hook-integrity-hashes)
<a id="toc-plugin-options" name="toc-plugin-options"></a>
1. [Plugin options](#plugin-options)
   - [test](#option-test) (RegEx to handle matching templates)
   - [entry](#option-entry) (template as entry point)
     - [entry as an array](#option-entry-array) (array notation)
     - [entry as an object](#option-entry-object) (object notation)
     - [entry as a path](#option-entry-path) (find templates in a directory recursively)
     - [entry data](#option-entry-data) (pass data in the template)
       - [data as object](#option-entry-data-object) (pass data in the template as an object)
       - [data as `JSON` file](#option-entry-data-json) (load data from JSON file)
       - [data as `JS` file](#option-entry-data-js) (dynamically load data from JS where can be used DB)
   - [entry dynamic](#option-entry-path) (entry as a path to template files)
   - [entryFilter](#option-entry-filter) (filter for entry dynamic)
   - [outputPath](#option-outputpath) (output path of HTML file)
   - [filename](#option-filename) (output filename of HTML file)
   - [js](#option-js) (options for JS)
   - [css](#option-css) (options for CSS)
   - [data](#option-data) (🔗reference to [loaderOptions.data](#loader-option-data))
   - [sources](#option-sources) (🔗reference to [loaderOptions.sources](#loader-option-sources))
   - [router](#option-router) (enable resolving of route URLs in `a.href`)
   - [beforePreprocessor](#option-before-preprocessor) (callback, 🔗reference to [loaderOptions.beforePreprocessor](#loader-option-before-preprocessor))
   - [preprocessor](#option-preprocessor) (callback or string, 🔗reference to [loaderOptions.preprocessor](#loader-option-preprocessor))
   - [preprocessorOptions](#option-preprocessor) (🔗reference to [loaderOptions.preprocessorOptions](#loader-option-preprocessorOptions))
   - [postprocess](#option-postprocess) (callback)
   - [beforeEmit](#option-beforeEmit) (callback)
   - [afterEmit](#option-afterEmit) (callback)
   - [renderStage](#option-renderStage)
   - [preload](#option-preload) (inject preload link tags)
   - [integrity](#option-integrity) (inject [subresource integrity hash](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) into script and style tags)
   - [minify](#option-minify) and [minifyOptions](#option-minify-options) (minification of generated HTML)
   - [extractComments](#option-extract-comments)
   - [watchFiles](#option-watch-files)
   - [hotUpdate](#option-hot-update)
   - [verbose](#option-verbose)
   - [loaderOptions](#option-loader-options) (reference to loader options)
<a id="toc-loader-options" name="toc-loader-options"></a>
1. [Loader options](#loader-options)
   - [sources](#loader-option-sources) (resolving asset references in a specific tag attribute)
     - [filter](#loader-option-sources-filter) (allow fine-tuning to resolve specific cases)
   - [root](#loader-option-root) (allow to resolve a path with leading `/`)
   - [context](#loader-option-context) (allow to resolve a path w/o leading `/`)
   - [beforePreprocessor](#loader-option-before-preprocessor) (callback)
   - [preprocessor](#loader-option-preprocessor) (callback or string) and [preprocessorOptions](#loader-option-preprocessorOptions) (templating)
     - [eta](#loader-option-preprocessor-options-eta)
     - [ejs](#loader-option-preprocessor-options-ejs)
     - [handlebars](#loader-option-preprocessor-options-handlebars)
     - [tempura](#loader-option-preprocessor-options-tempura)
     - [nunjucks](#loader-option-preprocessor-options-nunjucks)
     - [pug](#loader-option-preprocessor-options-pug)
     - [twig](#loader-option-preprocessor-options-twig)
     - [custom](#loader-option-preprocessor-custom) (using any template engine)
   - [data](#loader-option-data) (pass global data into all templates as an object or a file)
1. [Using template engines](#template-engine)
   - [Eta](#using-template-eta)
   - [EJS](#using-template-ejs)
   - [Handlebars](#using-template-handlebars)
   - [LiquidJS](#using-template-liquidjs)
   - [Mustache](#using-template-mustache)
   - [Nunjucks](#using-template-nunjucks)
   - [Pug](#using-template-pug)
   - [Tempura](#using-template-tempura)
   - [TwigJS](#using-template-twig)
1. [Using template in JavaScript](#template-in-js)
1. [Setup Live Reload](#setup-live-reload)
1. [Recipes](#recipes)
   - [How to keep source directory structure for HTML](#recipe-keep-folder-structure-html)
   - [How to keep source directory structure for assets (fonts, images, etc.)](#recipe-keep-folder-structure-assets)
   - [How to use source images in HTML](#recipe-use-images-in-html)
   - [How to resize and generate responsive images](#recipe-responsive-images)
   - [How to preload fonts](#recipe-preload-fonts)
   - [How to inline CSS in HTML](#recipe-inline-css)
   - [How to inline JS in HTML](#recipe-inline-js)
   - [How to inline SVG, PNG images in HTML](#recipe-inline-image)
   - [How to import SVG in JS w/o `svg-url-loader`](#recipe-import-svg) (as filename or as data URL)
   - [How to inline all resources into single HTML file](#recipe-inline-all-assets-to-html)
   - [How to resolve source assets in an attribute containing JSON value](#recipe-resolve-attr-json)
   - [How to resolve source image in the `style` attribute](#recipe-resolve-attr-style-url)
   - [How to resolve source image in the `href` attribute](#recipe-resolve-attr-href-a-image) (`<a href="image.jpg">`)
   - [How to load CSS file dynamically](#recipe-dynamic-load-css) (lazy loading CSS)
   - [How to import CSS class names in JS](#recipe-css-modules) (CSS modules)
   - [How to import CSS stylesheet in JS](#recipe-css-style-sheet) ([CSSStyleSheet](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet))
   - [How to load JS and CSS from `node_modules` in template](#recipe-load-js-css-from-node-modules)
   - [How to import CSS or SCSS from `node_modules` in SCSS](#recipe-import-style-from-node-modules)
   - [How to process a PHP template](#recipe-preprocessor-php)
   - [How to pass data into multiple templates](#recipe-pass-data-to-templates)
   - [How to use some different template engines](#recipe-diff-templates)
   - [How to configure `splitChunks`](#recipe-split-chunks)
   - [How to keep package name for **split chunks** from **node_modules**](#recipe-split-chunks-keep-module-name)
   - [How to split CSS files](#recipe-split-css)
2. [Problems & Solutions](#solutions)
   - [Automatic resolving of file extensions](#solutions-resolve-extensions)
   - [How to use `@import url()` in CSS](#solutions-import-url-in-css)
   - [How to disable resolving in commented out tag](#solutions-disable-resolving-in-commented-out-tag)
3. <a id="demo-sites" name="demo-sites"></a>
   Demo sites
   - Multiple page e-shop template (`Handlebars`) [demo](https://alpine-html-bootstrap.vercel.app/) | [source](https://github.com/webdiscus/demo-shop-template-bundler-plugin)
   - Asia restaurant (`Nunjucks`) [demo](https://webdiscus.github.io/demo-asia-restaurant-bundler-plugin) | [source](https://github.com/webdiscus/demo-asia-restaurant-bundler-plugin)
   - 10up / Animation Best Practices [demo](https://animation.10up.com/) | [source](https://github.com/10up/animation-best-practices)
1. <a id="usage-examples" name="usage-examples"></a>
   Usage examples
   - Simple example "Hello World!" [View in browser](https://stackblitz.com/edit/hello-world-webpack?file=webpack.config.js) | [source](https://github.com/webdiscus/html-bundler-webpack-plugin/tree/master/examples/hello-world)
   - Simple example "Hello World!" using `Pug` [View in browser](https://stackblitz.com/edit/hello-world-webpack-pug?file=webpack.config.js) | [source](https://github.com/webdiscus/html-bundler-webpack-plugin/tree/master/examples/hello-world-pug)
   - Automatically processing **multiple HTML** templates [View in browser](https://stackblitz.com/edit/webpack-webpack-js-org-diop8g?file=webpack.config.js) | [source](https://github.com/webdiscus/html-bundler-webpack-plugin/tree/master/examples/simple-site/)
   - **Bootstrap** with Webpack [View in browser](https://stackblitz.com/edit/webpack-webpack-js-org-kjnlvk?file=webpack.config.js) | [source](https://github.com/webdiscus/html-bundler-webpack-plugin/tree/master/examples/bootstrap)
   - **Tailwind CSS** with Webpack [View in browser](https://stackblitz.com/edit/webpack-webpack-js-org-auem8r?file=webpack.config.js) | [source](https://github.com/webdiscus/html-bundler-webpack-plugin/tree/master/examples/tailwindcss/)
   - **Twig** with Webpack [View in browser](https://stackblitz.com/edit/twig-webpack?file=webpack.config.js)
   - **Handlebars** with Webpack [View in browser](https://stackblitz.com/edit/webpack-webpack-js-org-mxbx4t?file=webpack.config.js) | [source](https://github.com/webdiscus/html-bundler-webpack-plugin/tree/master/examples/handlebars/)
   - Extend **Handlebars layout** with blocks [View in browser](https://stackblitz.com/edit/webpack-webpack-js-org-bjtjvc?file=webpack.config.js) | [source](https://github.com/webdiscus/html-bundler-webpack-plugin/tree/master/examples/handlebars-layout/)
   - Auto generate **integrity hash** for `link` and `script` tags [View in browser](https://stackblitz.com/edit/webpack-integrity-hvnfmg?file=webpack.config.js) | [source](https://github.com/webdiscus/html-bundler-webpack-plugin/tree/master/examples/integrity/)
   - Inline multiple **SVG** files w/o ID collision [View in browser](https://stackblitz.com/edit/inline-svg-wo-ids-collision?file=webpack.config.js) | [source](https://github.com/webdiscus/html-bundler-webpack-plugin/tree/master/examples/inline-svg-unique-id/)
   - Bundle **Vue** app into single HTML file with **embedded** JS, CSS, images [View in browser](https://stackblitz.com/edit/vue-bundle-inlined-assets?file=webpack.config.js) | [source](https://github.com/webdiscus/html-bundler-webpack-plugin/tree/master/examples/vue-bundle-inlined-assets/)
   - Using **Markdown** `*.md` files in templates [View in browser](https://stackblitz.com/edit/markdown-to-html-webpack?file=webpack.config.js) | [source](https://github.com/webdiscus/html-bundler-webpack-plugin/tree/master/examples/markdown-to-html)

---

#### [↑ back to contents](#contents)

<a id="features" name="features"></a>

## Features

- HTML [template](#template-engine) is the [entry point](#option-entry) for all resources
- [extracts JS](#option-js) from the source script filename specified in HTML via a `<script>` tag
- [extracts CSS](#option-css) from the source style filename specified in HTML via a `<link>` tag
- importing style files in JavaScript
- resolves source asset files in HTML attributes and in the CSS `url()`, without using [resolve-url-loader](https://github.com/bholloway/resolve-url-loader)
- supports styles used in `*.vue` files
- generated HTML contains output filenames
- supports the module types `asset/resource` `asset/inline` `asset` `asset/source` ([\*](#note-asset-source))
- [inline CSS](#recipe-inline-css) in HTML
- [inline JavaScript](#recipe-inline-js) in HTML
- [inline image](#recipe-inline-image) as `base64 encoded` data-URL for PNG, JPG, etc. in HTML and CSS
- [inline SVG](#recipe-inline-image) as SVG tag in HTML, e.g.: `<svg>...</svg>`
- [inline SVG](#recipe-inline-image) as `utf-8` data-URL in CSS, e.g.: `url("data:image/svg+xml,<svg>...</svg>")`
- auto generation of `<link rel="preload">` to [preload assets](#option-preload)
- supports the `auto` [publicPath](#webpack-option-output-publicpath)
- enable/disable [extraction of comments](#option-extract-comments) to `*.LICENSE.txt` file
- supports template engines such as [Eta](https://eta.js.org), [EJS](https://ejs.co), [Handlebars](https://handlebarsjs.com), [Nunjucks](https://mozilla.github.io/nunjucks/), [Pug](https://pugjs.org/), [TwigJS](https://github.com/twigjs/twig.js), [LiquidJS](https://github.com/harttle/liquidjs) and others
- supports a [template function](#template-in-js) for usage in JS on the client-side
- supports Markdown `*.md` files in templates
- supports both `async` and `sync` [preprocessor](#loader-option-preprocessor-custom)
- auto processing multiple HTML templates using the [entry path](#option-entry-path)
- [pass data](#option-entry-advanced) into template from the plugin config
- dynamically loading template variables using the [data](#loader-option-data) option, change data w/o restarting
- generates the `integrity hashes` and adds the [integrity](#option-integrity) attribute to the `link` and `script` tags
- [minification](#option-minify) of generated HTML
- allows extending base functionality using [hooks & callbacks](#plugin-hooks-and-callbacks)
- [generates favicons](#favicons-bundler-plugin) of different sizes for various platforms and injects them into HTML

<a id="note-asset-source" name="note-asset-source"></a>
(\*) - `asset/source` works currently for SVG only, in a next version will work for other files too

<a id="list-of-plugins" name="list-of-plugins"></a>

#### Why do many developers switch from Webpack to other bundlers?
One of the reasons they cite is the complex configuration many different plugins and loaders for one simple thing - rendering an HTML page with assets.

The HTML bundler plugin "changes the rule of the game", making configuration very simple and clear.
Just one plugin replaces the functionality of the plugins and loaders:

| Package                                                                                                 | Features                                                            |
|---------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------|
| [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin)                                  | creates HTML and inject `script` tag for compiled JS file into HTML |
| [mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin)                   | injects `link` tag for processed CSS file into HTML                 |
| [webpack-remove-empty-scripts](https://github.com/webdiscus/webpack-remove-empty-scripts)               | removes generated empty JS files                                    |
| [html-loader](https://github.com/webpack-contrib/html-loader)                                           | exports HTML, resolving attributes                                  |
| [style-loader](https://github.com/webpack-contrib/style-loader)                                         | injects an inline CSS into HTML                                     |
| [html-webpack-inject-preload](https://github.com/principalstudio/html-webpack-inject-preload)           | inject preload link tags                                            |
| [preload-webpack-plugin](https://github.com/vuejs/preload-webpack-plugin)                               | inject preload link tags                                            |
| [html-webpack-inline-source-plugin](https://github.com/dustinjackson/html-webpack-inline-source-plugin) | inline JS and CSS into HTML                                         |
| [html-inline-css-webpack-plugin](https://github.com/runjuu/html-inline-css-webpack-plugin)              | inline CSS into HTML                                                |
| [posthtml-inline-svg](https://github.com/andrey-hohlov/posthtml-inline-svg)                             | injects an inline SVG icon into HTML                                |
| [resolve-url-loader](https://github.com/bholloway/resolve-url-loader)                                   | resolves a relative URL in CSS                                      |
| [svg-url-loader](https://github.com/bhovhannes/svg-url-loader)                                          | encodes a SVG data-URL as utf8                                      |
| [webpack-subresource-integrity ](https://www.npmjs.com/package/webpack-subresource-integrity)           | enables Subresource Integrity                                       |
| [favicons-webpack-plugin ](https://github.com/jantimon/favicons-webpack-plugin)                         | generates favicons and icons                                        |
| [handlebars-webpack-plugin](https://github.com/sagold/handlebars-webpack-plugin)                        | renders Handlebars templates                                        |
| [handlebars-loader](https://github.com/pcardune/handlebars-loader)                                      | compiles Handlebars templates                    |
| [pug-loader](https://www.npmjs.com/package/pug-loader)          | compiles Pug templates                    |
| [nunjucks-loader](https://github.com/at0g/nunjucks-loader)          | compiles Nunjucks templates                    |


#### [↑ back to contents](#contents)

<a id="webpack-options" name="webpack-options"></a>

## Webpack options

Important Webpack options used to properly configure this plugin.

<a id="webpack-option-output" name="webpack-options-output"></a>
<a id="webpack-option-output-path" name="webpack-options-output-path"></a>

### `output.path`

Type: `string` Default: `path.join(process.cwd(), 'dist')`

The root output directory for all processed files, as an absolute path.\
You can omit this option, then all generated files will be saved under `dist/` in your project directory.

<a id="webpack-option-output-publicpath" name="webpack-options-output-publicpath"></a>

### `output.publicPath`

Type: `string|function` Default: `auto`

The value of the option is prefixed to every URL created by this plugin.
If the value is not the empty string or `auto`, then the option must end with `/`.

The possible values:

- `publicPath: 'auto'` - automatically determines a path of an asset relative of their issuer.
  The generated HTML page can be opened directly form the local directory and all js, css and images will be loaded in a browser.
- `publicPath: ''` - a path relative to an HTML page, in the same directory. The resulting path is different from a path generated with `auto`.
- `publicPath: '/'` - a path relative to `document root` directory on a server
- `publicPath: '/assets/'` - a sub path relative to `document root` directory on a server
- `publicPath: '//cdn.example.com/'` - an external URL with the same protocol (`http://` or `https://`)
- `publicPath: 'https://cdn.example.com/'` - an external URL with the `https://` protocol only

> [!WARNING]
>
> If an incorrect value is specified you'll receive 404 errors while loading these resources.

<a id="webpack-option-output-filename" name="webpack-options-output-filename"></a>

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
        filename: 'js/[name].[contenthash:8].js',
      },
      css: {
        // define the output name of a generated CSS file here
        filename: 'css/[name].[contenthash:8].css',
      },
    }),
  ],
};
```

#### [↑ back to contents](#contents)


<a id="webpack-option-entry" name="webpack-options-entry"></a>

### `entry`

The starting point to build the bundle.

> ℹ️ **Note**
>
> Using this plugin an `entry point` is an HTML template.
> All script and style source files must be specified in the HTML template.

You can use the Webpack `entry` option to define HTML templates,
but it is highly recommended to define all templates in plugin option [`entry`](#option-entry),
because it has an additional `data` property (not available in the Webpack entry)
to pass custom variables into the HTML template.

For details see the [plugin option `entry`](#option-entry).

#### [↑ back to contents](#contents)


<a id="build-in-plugins" name="build-in-plugins"></a>

## Build-in Plugins

There are the most useful plugins available "out of the box".
The build-in plugins maintained by the HtmlBundlerPlugin.

All build-in plugins are in the `/plugins` subdirectory of the HtmlBundlerPlugin.


### FaviconsBundlerPlugin

<a id="favicons-bundler-plugin" name="favicons-bundler-plugin"></a>

The [FaviconsBundlerPlugin](https://github.com/webdiscus/html-bundler-webpack-plugin/tree/master/plugins/favicons-bundler-plugin) generates favicons for different devices and injects favicon tags into HTML head.

#### Install

This plugin requires the additional [favicons](https://github.com/itgalaxy/favicons) package.

```
npm install favicons -D
```

#### Config

```js
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
const { FaviconsBundlerPlugin } = require('html-bundler-webpack-plugin/plugins');

module.exports = {
  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        // source favicon file must be specified directly in HTML using link tag
        index: './src/views/index.html',
      },
    }),
    // add the favicons plugin
    new FaviconsBundlerPlugin({
      enabled: 'auto', // true, false, auto - generate favicons in production mode only
      // favicons configuration options, see https://github.com/itgalaxy/favicons#usage
      faviconOptions: {
        path: '/img/favicons', // favicons output path relative to webpack output.path
        icons: {
          android: true, // Create Android homescreen icon.
          appleIcon: true, // Create Apple touch icons.
          appleStartup: false, // Create Apple startup images.
          favicons: true, // Create regular favicons.
          windows: false, // Create Windows 8 tile icons.
          yandex: false, // Create Yandex browser icon.
        },
      },
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|ico|svg)$/,
        type: 'asset/resource',
      },
    ],
  },
};
```

#### FaviconsBundlerPlugin options

- `enabled: boolean | 'auto'`\
  if is `'auto'` then generate favicons in production mode only,
  in development mode will be used original favicon processed via webpack asset module.
- `faviconOptions: FaviconOptions` - options of the [favicons](https://github.com/itgalaxy/favicons) module. See [configuration options](https://github.com/itgalaxy/favicons#usage).

#### Usage

The source file of your favicon must be specified directly in HTML as the `link` tag with `rel="icon"` attribute.

If the FaviconsBundlerPlugin is disabled or as `auto` in development mode,
then the source favicon file will be processed via `webpack`.

If the FaviconsBundlerPlugin is enabled or as `auto` in production mode,
then the source favicon file will be processed via `favicons` module and
the original `link` tag with favicon will be replaced with generated favicon tags.

For example, there is the _src/views/index.html_

```html
<!DOCTYPE html>
<html>
<head>
  <!-- source favicon file relative to this HTML file, or use a webpack alias -->
  <link href="./myFavicon.png" rel="icon" />
</head>
<body>
  <h1>Hello World!</h1>
</body>
</html>
```


The generated HTML when FaviconsBundlerPlugin is `disabled`:
```html
<!DOCTYPE html>
<html>
<head>
  <!-- output favicon file -->
  <link href="assets/img/myFavicon.1234abcd.png" rel="icon" />
</head>
<body>
  <h1>Hello World!</h1>
</body>
</html>
```


The generated HTML when FaviconsBundlerPlugin is `enabled`:
```html
<!DOCTYPE html>
<html>
<head>
  <!-- original tag is replaced with tags generated by favicons module -->
  <link rel="apple-touch-icon" sizes="1024x1024" href="/img/favicons/apple-touch-icon-1024x1024.png">
  <link rel="apple-touch-icon" sizes="114x114" href="/img/favicons/apple-touch-icon-114x114.png">
  <link rel="apple-touch-icon" sizes="120x120" href="/img/favicons/apple-touch-icon-120x120.png">
  <link rel="apple-touch-icon" sizes="144x144" href="/img/favicons/apple-touch-icon-144x144.png">
  <link rel="apple-touch-icon" sizes="152x152" href="/img/favicons/apple-touch-icon-152x152.png">
  <link rel="apple-touch-icon" sizes="167x167" href="/img/favicons/apple-touch-icon-167x167.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/img/favicons/apple-touch-icon-180x180.png">
  <link rel="apple-touch-icon" sizes="57x57" href="/img/favicons/apple-touch-icon-57x57.png">
  <link rel="apple-touch-icon" sizes="60x60" href="/img/favicons/apple-touch-icon-60x60.png">
  <link rel="apple-touch-icon" sizes="72x72" href="/img/favicons/apple-touch-icon-72x72.png">
  <link rel="apple-touch-icon" sizes="76x76" href="/img/favicons/apple-touch-icon-76x76.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/img/favicons/favicon-16x16.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/img/favicons/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="48x48" href="/img/favicons/favicon-48x48.png">
  <link rel="icon" type="image/x-icon" href="/img/favicons/favicon.ico">
  <link rel="manifest" href="/img/favicons/manifest.webmanifest">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="My App">
  <meta name="application-name" content="My App">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="theme-color" content="#fff">
</head>
<body>
  <h1>Hello World!</h1>
</body>
</html>
```


#### [↑ back to contents](#contents)

<a id="third-party-plugins" name="third-party-plugins"></a>

## Third-party Plugins

The third-party plugins not maintained by the HtmlBundlerPlugin.
It potentially does not have the same support, security policy or license as [Build-in Plugins](#build-in-plugins).

You can create own plugin using the [plugin hooks](#plugin-hooks-and-callbacks).
As a reference plugin,
you can use the [FaviconsBundlerPlugin](https://github.com/webdiscus/html-bundler-webpack-plugin/tree/master/plugins/favicons-bundler-plugin).

If you have a useful plugin, create a PR with the link to you plugin.

The plugin name must end with `-bundler-plugin`, e.g. `hello-world-bundler-plugin`.

_Currently there are no plugins yet. Be the first to create one._

#### [↑ back to contents](#contents)



<a id="plugin-hooks-and-callbacks" name="plugin-hooks-and-callbacks"></a>

## Hooks & Callbacks

Using hooks and callbacks, you can extend the functionality of this plugin.

The `hook` can be defined in an external plugin.
The `callback` is defined as an option in the HTMLBundlerPlugin.

Most hooks have a callback with the same name.
Each callback is called after hook with the same name.
So with a callback, you can change the result of the hook.

#### When using `callbacks`

If you have small code just for your project or are doing debugging, you can use callbacks.

#### When using `hooks`

Using hooks you can create your own plugin.

_How the plugin works under the hood._
<center>
  <img width="765" style="max-width: 100%;" src="images/hooks.png" alt="HTMLBundlerPlugin hooks & callbacks">
</center>

### How to use hooks

The simplest way, add the `{ apply() { ... } }` object to the array of the Webpack plugins:


```js
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },
    }),
    // your plugin
    {
      apply(compiler) {
        const pluginName = 'MyPlugin';

        compiler.hooks.compilation.tap(pluginName, (compilation) => {
          const hooks = HtmlBundlerPlugin.getHooks(compilation);

          // modify generated HTML of the index.html template
          hooks.beforeEmit.tap(pluginName, (content, { name, sourceFile, assetFile }) => {
            return content.replace('something...', 'other...')
          });
        });
      },
    },
  ],
};
```


You can use this template as the basis for your own plugin:

```js
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

class MyPlugin {
  pluginName = 'my-plugin';
  options = {};

  /**
   * @param {{ enabled: boolean | 'auto'}} options The options of your plugin.
   */
  constructor(options = {}) {
    this.options = options;
  }

  apply(compiler) {
    // you can use the API of the HtmlBundlerPlugin.option
    const enabled = HtmlBundlerPlugin.option.toBool(this.options?.enabled, true, 'auto');
    const outputPath = HtmlBundlerPlugin.option.getWebpackOutputPath();

    if (!enabled) {
      return;
    }

    const { pluginName } = this;
    const { webpack } = compiler; // instance of the Webpack
    const fs = compiler.inputFileSystem.fileSystem; // instance of the Webpack FileSystem

    // start your plugin from the webpack compilation hook
    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      const hooks = HtmlBundlerPlugin.getHooks(compilation);

      // usage of the sync, async and promise hooks

      // sync hook
      hooks.<hookName>.tap(pluginName, (...arguments) => {
        // do somthing here ...
        const result = 'your result';
        // return the result
        return result;
      });

      // async hook
      hooks.<hookName>.tapAsync(pluginName, (...arguments, callback) => {
        // do somthing here ...
        const result = 'your result';
        // call the callback function to resolve the async hook
        callback(result);
      });

      // promise hook
      hooks.<hookName>.tapPromise(pluginName, (...arguments) => {
        // do somthing here ...
        const result = 'your result';
        // return the promise with the result
        return Promise.resolve(result);
      });
    });
  }
}

module.exports = MyPlugin;
```

Then add your plugin in the webpack config:

```js
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
const MyBundlerPlugin = require('my-bundler-plugin');

module.exports = {
  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },
    }),
    // your plugin
    new MyBundlerPlugin({ enabled: true });
  ],
};
```

For an example implementation see [FaviconsBundlerPlugin](https://github.com/webdiscus/html-bundler-webpack-plugin/tree/master/plugins/favicons-bundler-plugin).

#### [↑ back to contents](#contents)

<a id="hook-beforePreprocessor" name="hook-beforePreprocessor"></a>

### `beforePreprocessor`

```ts
AsyncSeriesWaterfallHook<[
  content: string,
  loaderContext: LoaderContext<Object> & { data: { [key: string]: any } | string }
]>;
```

For details on `AsyncSeriesWaterfallHook` see the [hook interface](https://github.com/webpack/tapable#hookhookmap-interface).

For details on hook parameters, see in the [beforePreprocessor](#loader-option-before-preprocessor) callback option.

#### [↑ back to contents](#contents)


<a id="hook-preprocessor" name="hook-preprocessor"></a>

### `preprocessor`

```ts
AsyncSeriesWaterfallHook<[
  content: string,
  loaderContext: LoaderContext<Object> & { data: { [key: string]: any } | string }
]>;
```

For details on `AsyncSeriesWaterfallHook` see the [hook interface](https://github.com/webpack/tapable#hookhookmap-interface).

For details on hook parameters, see in the [preprocessor](#loader-option-preprocessor-custom) callback option.

#### [↑ back to contents](#contents)


<a id="hook-resolveSource" name="hook-resolveSource"></a>

### `resolveSource`

```ts
SyncWaterfallHook<[
  source: string,
  info: {
    type: 'style' | 'script' | 'asset';
    tag: string;
    attribute: string;
    value: string;
    resolvedFile: string;
    issuer: string
  },
]>;
```

_no calback_


Called after resolving of a source attribute defined by [source](#loader-option-sources) loader option.

For details on `SyncWaterfallHook` see the [hook interface](https://github.com/webpack/tapable#hookhookmap-interface).

Hook parameters:

- `source` - a source of the tag where are parsed attributes, e.g. `<link href="./favicon.png" rel="icon">`
- `info` - an object with parsed information:
  - `type` - the type of the tag
  - `tag` - the tag name, e.g. `'link'`, `'script'`, `'img'`, etc.
  - `attribute` - the attribute name, e.g. `'src'`, `'href'`, etc.
  - `value` - the attribute value
  - `resolvedFile` - the resolved file from the value
  - `issuer` - the template file

Return a string to override the resolved value of the attribute or `undefined` to keep the resolved value.

#### [↑ back to contents](#contents)


<a id="hook-postprocess" name="hook-postprocess"></a>

### `postprocess`

```ts
AsyncSeriesWaterfallHook<[content: string, info: TemplateInfo]>;
```

For details on `AsyncSeriesWaterfallHook` see the [hook interface](https://github.com/webpack/tapable#hookhookmap-interface).

For details on hook parameters, see in the [postprocess](#option-postprocess) callback option.

#### [↑ back to contents](#contents)


<a id="hook-beforeEmit" name="hook-beforeEmit"></a>

### `beforeEmit`

```ts
AsyncSeriesWaterfallHook<[content: string, entry: CompileEntry]>;
```

For details on `AsyncSeriesWaterfallHook` see the [hook interface](https://github.com/webpack/tapable#hookhookmap-interface).

For details on hook parameters, see in the [beforeEmit](#option-beforeEmit) callback option.

#### [↑ back to contents](#contents)


<a id="hook-afterEmit" name="hook-afterEmit"></a>

### `afterEmit`

```ts
AsyncSeriesHook<[entries: CompileEntries]>;
```

For details on `AsyncSeriesHook` see the [hook interface](https://github.com/webpack/tapable#hookhookmap-interface).

For details on hook parameters, see in the [afterEmit](#option-afterEmit) callback option.

#### [↑ back to contents](#contents)


<a id="hook-integrity-hashes" name="hook-integrity-hashes"></a>

### `integrityHashes`


```ts
AsyncSeriesHook<{
  // the map of the output asset filename to its integrity hash
  hashes: Map<string, string>;
}>;
```

Called after all assets have been processed and hashes have finite values and cannot be changed, at the `afterEmit` stage.
This can be used to retrieve the integrity values for the asset files.

For details on `AsyncSeriesHook` see the [hook interface](https://github.com/webpack/tapable#hookhookmap-interface).

Callback Parameter: `hashes` is the map of the output asset filename to its integrity hash.
The map only contains JS and CSS assets that have a hash.

You can write your own plugin, for example, to extract integrity values into the separate file:

```js
const fs = require('fs');
const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
module.exports = {
  output: {
    crossOriginLoading: 'anonymous', // required for Subresource Integrity
  },
  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },
      js: {
        filename: '[name].[contenthash:8].js',
        chunkFilename: '[name].[contenthash:8].chunk.js',
      },
      css: {
        filename: '[name].[contenthash:8].css',
        chunkFilename: '[name].[contenthash:8].chunk.css',
      },
      integrity: 'auto',
    }),
    // your plugin to extract the integrity values
    {
      apply(compiler) {
        compiler.hooks.compilation.tap('MyPlugin', (compilation) => {
          const hooks = HtmlBundlerPlugin.getHooks(compilation);
          hooks.integrityHashes.tapAsync(
            'MyPlugin',
            (hashes) => Promise.resolve().then(() => {
                if (hashes.size > 0) {
                  const saveAs = path.join(__dirname, 'dist/integrity.json');
                  const json = Object.fromEntries(hashes);
                  fs.writeFileSync(saveAs, JSON.stringify(json, null, '  ')); // => save to file
                  console.log(hashes); // => output to console
                }
              })
            );
          }
        );
      },
    },
  ],
};
```

The content of the `dist/integrity.json` file looks like:
```
{
  "815.49b3d882.chunk.js": "sha384-dBK6nNrKKk2KjQLYmHZu6tuWwp7kBzzEvdX+4Ni11UzxO2VHvP4A22E/+mmeduul",
  "main.9c043cce.js": "sha384-AbfLh7mk6gCp0nhkXlAnOIzaHeJSB8fcV1/wT/FWBHIDV7Blg9A0sukZ4nS3xjtR"
  "main.dc4ea4af.chunk.css": "sha384-W/pO0vwqqWBj4lq8nfe+kjrP8Z78smCBttkCvx1SYKrVI4WEdJa6W6i0I2hoc1t7",
  "style.47f4da55.css": "sha384-gaDmgJjLpipN1Jmuc98geFnDjVqWn1fixlG0Ab90qFyUIJ4ARXlKBsMGumxTSu7E",
}
```

#### [↑ back to contents](#contents)


<a id="plugin-options" name="plugin-options"></a>

## Plugin options

<a id="option-test" name="option-test"></a>

### `test`

Type: `RegExp` Default: `/\.(html|eta)$/`

The `test` option allows to handel only those templates as entry points that match the name of the source file.

For example, if you have other templates, e.g. `*.liquid`, as entry points, then you can set the option to match custom template files: `test: /\.(html|liquid)$/`.

The `test` value is used in the [default loader](#loader-options).

> ℹ️ **Note**
>
> Using the [preprocessor](#loader-option-preprocessor) options will be added the templating engine extensions in the `test` automatically.
> Defaults `preprocessor` is [Eta](#loader-option-preprocessor-options-eta) therefore is used the `/\.(html|eta)$/` RegExp.
>
> For example, if you define the preprocessor option as the [handlebars](#loader-option-preprocessor-options-handlebars), then will be used the `/\.(html|hbs|handlebars)$/` RegExp automatically.

**Why is it necessary to define it? Can't it be automatically processed?**

This plugin is very powerful and has many experimental features not yet documented.
One of the next features will be the processing scripts and styles as entry points for library bundles without templates.
To do this, the plugin must differentiate between a template entry point and a script/style entry point.
This plugin can completely replace the functionality of `mini-css-extract-plugin` and `webpack-remove-empty-scripts` in future.

<a id="option-entry" name="option-entry"></a>

### `entry`

Type: `EntryObject | Array<EntryDescription> | string`.

The `EntryObject` is identical to [Webpack entry](https://webpack.js.org/configuration/entry-context/#entry)
plus additional `data` property to pass custom variables into the HTML template.

Defines the entry points for HTML files.
You can specify a path to a template directory to automatically process all templates, or specify multiple entries if you want to manually manage templates files.

> ℹ️ **Note**
>
> You can define templates both in Webpack `entry` and in the `entry` option of the plugin. The syntax is identical.
> But the `data` property can only be used in the `entry` option of the plugin.


> 💡 **Tip**
>
> Specify template files as entry points in the `entry` plugin option.

An HTML template is a starting point for collecting all the dependencies used in your web application.
Specify source scripts (JS, TS) and styles (CSS, SCSS, LESS, etc.) directly in HTML.
The plugin automatically extracts JS and CSS whose source files are specified in an HTML template.

```ts
type EntryObject = {
  [name: string]: EntryDescription | string;
};
```

The key of the `EntryObject` is the `output filename` without an extension, relative to the [`outputPath`](#option-outputpath) option.

#### Simple syntax

When the entry point value is a `string`, it must be an absolute or relative template file.
For example:

```js
{
  entry: {
    index: path.join(__dirname, 'src/views/home/index.html'), // => dist/index.html
    'news/sport': 'src/views/news/sport/index.html', // => dist/news/sport.html
  },
}
```

<a id="option-entry-advanced" name="option-entry-advanced"></a>

#### Advanced syntax

If you need to pass data to a template or want to dynamically generate an output filename regardless of the entry key,
you can define the value of an entry as an `EntryDescription` object.

```ts
type EntryDescription = {
  /**
   * Template file, relative of context or absolute.
   */
  import: string;
  /**
   * Specifies the filename of the output file.
   */
  filename?: FilenameTemplate;
  /**
   * The template data.
   */
  data?: { [key: string]: any } | string;
};

type FilenameTemplate =
  | string
  | ((pathData: import('webpack/Compilation').PathData, assetInfo?: import('webpack/Compilation').AssetInfo) => string);
```

##### `import`

The `import` is a path to a template file, absolute or relative to the Webpack `context` option.

##### `filename`

When the `filename` is defined as a `string`, it will be used as the output html filename.
In this case, the entry key can be any unique string.

For example:

```js
{
  entry: {
    page01: {
      import: 'src/views/news/sport/index.html', // <= source template
      filename: 'news/sport.html', // => output ./dist/news/sport.html
    },
  },
}
```

When the `filename` is defined as a [template string](https://webpack.js.org/configuration/output/#template-strings),
then the entry key will be used as the `[name]` in the `template string`. Defaults, the [filename](#option-filename) is the `[name].html` template string.

For example:

```js
{
  entry: {
    'news/sport': {
      import: 'src/views/news/sport/index.html', // <= source template
      filename: '[name].html', // => output ./dist/news/sport.html
    },
  },
}
```

The example above is equivalent to the simple syntax:

```js
{
  entry: {
    'news/sport': 'src/views/news/sport/index.html',
  },
}
```

<a id="option-entry-data" name="option-entry-data"></a>

##### `data`

The `data` is passed into [`preprocessor`](#loader-option-preprocessor) to render the template with variables.

<a id="option-entry-data-object" name="option-entry-data-object"></a>
**data as `object`**

When the `data` is an `object`, it will be loaded once with Webpack start.
After changing the data, you **need to restart Webpack**.

For example:

```js
{
  entry: {
    index: {
      import: 'src/views/index.html',
      // pass data as an object
      data: {
        title: 'Home',
      }
    },
}
```

<a id="option-entry-data-json" name="option-entry-data-json"></a>
**data as `JSON` file**

When the `data` is a `string`, it must be an absolute or relative path to a file.
The file can be a `JSON` file or a `JS` file that exports the data as an object.
Use the `data` as a file if you want to get dynamic data in a template.
The data file will be reloaded after changes, **without restarting Webpack**.

For example, using `*.json` data file:

```js
{
  entry: {
    index: {
      import: 'src/views/index.html',
      // load data from JSON file
      data: 'src/data/home.json',
    },
  },
}
```

The data file _src/data/home.json_:

```json
{
  "title": "Home"
}
```

<a id="option-entry-data-js" name="option-entry-data-js"></a>
**data as `JS` file**

To load data into a template dynamically you can use `JS` file.
In JS file you can load data from a database.

For example, using `*.js` data file:

```js
{
  entry: {
    index: {
      import: 'src/views/index.html',
      // load data from JS file
      data: 'src/data/home.js',
    },
  },
}
```

The data file _src/data/home.js_:

```js
// here you can load data from a database
const data = {
  title: 'Home',
};

module.exports = data;
```

> 💡 **Tip**
>
> To pass global variables in all templates use the [data](#loader-option-data) plugin option.


<a id="option-entry-array" name="option-entry-array"></a>
#### Entry as an array

If the `entry` is the array of the `EntryDescription` then the `filename` property is required.

```js
{
  entry: [
    {
      filename: 'index.html', // => output filename dist/index.html
      import: 'src/views/index.html', // template file
      data: { title: 'Homepage' }, // page specifically variables
    },
    {
      filename: 'about.html',
      import: 'src/views/about.html',
      data: { title: 'About' },
    },
    {
      filename: 'news/sport.html',
      import: 'src/views/news/sport.html',
      data: { title: 'Sport' },
    },
  ],
}
```

<a id="option-entry-object" name="option-entry-object"></a>
#### Entry as an object

The absolute equivalent to the example above using an object is:

```js
{
  entry: {
    index: { // => output filename dist/index.html
      import: 'src/views/index.html', // template file
      data: { title: 'Homepage' }, // page specifically variables
    },
    about: {
      import: 'src/views/about.html',
      data: { title: 'About' },
    },
    'news/sport': {
      import: 'src/views/news/sport.html',
      data: { title: 'Sport' },
    },
  },
}
```

The difference between **object** and **array** notation:
- Using the **object** notation the output **filename** is the key of the entry item without the `.html` file extension.
- Using the **array** notation the output **filename** is the `filename` property of the array item contained the file with `.html` file extension.

<a id="option-entry-path" name="option-entry-path"></a>

#### Entry as a path to templates

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
});
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
});
```

> ℹ️ **Note**
>
> In serve/watch mode, you can add/delete/rename a template file in the entry path without restarting Webpack.

#### [↑ back to contents](#contents)

<a id="option-entry-filter" name="option-entry-filter"></a>

### `entryFilter`

The filter to process only matching template files.
This option works only if the [entry](#option-entry-path) option is a path.

Type:
```ts
type AdvancedFilter =
  | RegExp
  | Array<RegExp>
  | { includes?: Array<RegExp>; excludes?: Array<RegExp> }
  | ((file: string) => void | true | false);
```

Default value:

```ts
{
  includes: [
    /\.(html|eta)$/,
  ],
  excludes: []
}
```

The default `includes` property depends on the used [preprocessor](#loader-option-preprocessor) option.
Each preprocessor has its own filter to include from the entry path only relevant template files.

#### `entryFilter` as `RegExp`

The filter works as `include` only files that match the regular expressions.
For example:
```js
new HtmlBundlerPlugin({
  entry: 'src/views/pages/',
  entryFilter: /index\.html$/, // render only `index.html` files in all sub dirs
})
```

#### `entryFilter` as `Array<RegExp>`

The filter works as `include` only files that match one of the regular expressions.
For example:
```js
new HtmlBundlerPlugin({
  entry: 'src/views/pages/',
  entryFilter: [
    // render only page specifically files, e.g.: `index.html`, `contact.html`, `about.html`
    /index\.html$/,
    /contact\.html$/,
    /about\.html$/,
  ],
})
```

#### `entryFilter` as `{ includes: Array<RegExp>, excludes: Array<RegExp> }`

The filter includes only files that match one of the regular expressions, except excluded files.
For example:
```js
new HtmlBundlerPlugin({
  entry: 'src/views/pages/',
  entryFilter: {
    includes: [/\.(html|eta)$/,], // render all `.html` and `.eta` template files
    excludes: [/partial/],  // except partial files
  },
})
```

#### `entryFilter` as `callback`

In addition to the default `includes` filter, this filter works as `exclude` a file if it returns `false`.
If the callback returns `true` or nothing, then the file will be processed.

For example:
```js
new HtmlBundlerPlugin({
  entry: 'src/views/pages/',
  entryFilter: (file) => {
    if (/partial/.test(file)) return false; // ignore files containing the `partial` in the path
  },
})
```
The `file` argument is the absolute path of a template file.

#### [↑ back to contents](#contents)

<a id="option-outputpath" name="option-outputpath"></a>

### `outputPath`

Type: `string` Default: webpack `output.path`

The output directory for generated HTML files only.
This directory can be absolute or relative to webpack `output.path`.

For example, here are html and js files:

```
src/index.html
src/main.js
```

_src/index.html_

```html
<!doctype html>
<html>
  <head>
    <script src="./main.js"></script>
  </head>
  <body>
    <h1>Hello World!</h1>
  </body>
</html>
```

There is webpack config:

```js
const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
module.exports = {
  output: {
    path: path.join(__dirname, 'dist/'), // the root output directory for all assets
  },
  plugins: [
    new HtmlBundlerPlugin({
      // absolute html output directory
      outputPath: path.join(__dirname, 'dist/example/'),
      // OR relative to output.path
      // outputPath: 'example/',
      entry: {
        index: './src/index.html', // => dist/example/index.html
      },
      js: {
        filename: '[name].bundle.js',
        outputPath: 'assets/js/', // output path for js files, relative to output.path
      },
    }),
  ],
};
```

The processed files in the output directory:

```
dist/example/index.html
dist/assets/js/main.bundle.js
```

The generated _dist/example/index.html_:

```html
<!doctype html>
<html>
  <head>
    <script src="../assets/js/main.bundle.js"></script>
  </head>
  <body>
    <h1>Hello World!</h1>
  </body>
</html>
```

> ⚠️ **Warning**
>
> The `outputPath` is NOT used for output assets (js, css, images, etc.).

<a id="option-filename" name="option-filename"></a>

### `filename`

Type: `string | Function` Default: `[name].html`

The HTML output filename relative to the [`outputPath`](#option-outputpath) option.

If type is `string` then following substitutions (see [output.filename](https://webpack.js.org/configuration/output/#template-strings) for chunk-level) are available in template string:

- `[id]` The ID of the chunk.
- `[name]` The filename without extension or path.
- `[contenthash]` The hash of the content.
- `[contenthash:nn]` The `nn` is the length of hashes (defaults to 20).

If type is `Function` then following arguments are available in the function:

- `@param {PathData} pathData` has the useful properties (see the [type PathData](https://webpack.js.org/configuration/output/#outputfilename)):
  - `pathData.filename` the absolute path to source file
  - `pathData.chunk.name` the name of entry key
- `@return {string}` The name or template string of output file.

#### [↑ back to contents](#contents)

<a id="option-js" name="option-js"></a>

### `js`

Type:

```ts
type JsOptions = {
  filename?: FilenameTemplate;
  chunkFilename?: FilenameTemplate;
  outputPath?: string;
  inline?: 'auto' | boolean | JsInlineOptions;
};

type JsInlineOptions = {
  enabled?: 'auto' | boolean;
  chunk?: RegExp | Array<RegExp>;
  source?: RegExp | Array<RegExp>;
  attributeFilter?: (props: {
    attribute: string;
    value: string;
    attributes: { [attributeName: string]: string };
  }) => boolean | void;
};
```

Default properties:

```js
{
  filename: '[name].js',
  chunkFilename: '[id].js',
  outputPath: null,
  inline: false,
}
```

- `filename` - an output filename of JavaScript. Details see by [filename option](#option-filename).
- `chunkFilename` - an output filename of non-initial chunk files. Details see by [chunkFilename](https://webpack.js.org/configuration/output/#outputchunkfilename).
- `outputPath` - an output path of JavaScript. Details see by [outputPath option](#option-outputpath).

The `inline` property allows to inline compiled JavaScript chunks into HTML.

If `inline` is `'auto'` or `boolean`, available values:

- `false` - stores JavaScript in an output file (**defaults**)
- `true` - adds JavaScript to the DOM by injecting a `<script>` tag
- `'auto'` - in `development` mode - adds to DOM, in `production` mode - stores as a file

If `inline` is an `object`:

- `enabled` - has the values: `true` (**defaults**), `false` or `'auto'`, description see above,\
   if the `enabled` is undefined, then using the `inline` as the `object`, the value is `true`
- `chunk` - inlines the single chunk when output chunk filename matches a regular expression(s)
- `source` - inlines all chunks when source filename matches a regular expression(s)
- `attributeFilter` - filter function to keep/remove attributes for inlined script tag. If undefined, all attributes will be removed.\
  Destructed arguments:
  - `attribute` - attribute name
  - `value` - attribute value
  - `attributes` - all attributes of the script tag

  Return:
  - `true` - keep the attribute in the inlined script tag
  - `false` or `undefined` - remove the attribute

You can use both the `chunk` and the `source` options,
then there will be inlined chunks matching regular expressions with `OR` logic.

For example, there is used the `optimization.splitChunks` and we want to inline only the small webpack runtime chunk
but other JS chunks of the same split `app.js` file should be saved to chunk files, then use the following inline option:

```js
js: {
  filename: 'js/[name].[contenthash:8].js',
  inline: {
    chunk: [/runtime.+[.]js/],
  },
},
```

Then the `app.js` file will be split to many output chunks in the `dist/` directory, e.g.:

```
js/325.xxxxxxxx.js  -> save as file
js/545.xxxxxxxx.js  -> save as file
js/app.xxxxxxxx.js  -> save as file
runtime.xxxxxxxx.js        -> inline the chunk into HTML and NOT save as file
```

The single `runtime.xxxxxxxx.js` chunk will be injected into HTML, other chunks will be saved to output directory.

> ℹ️ **Note**
>
> The `filename` and `chunkFilename` options are the same as in Webpack `output` options, just defined in one place along with other relevant plugin options.
> You don't need to define them in the in Webpack `output` options anymore. Keep the config clean & clear.

To keep some original script tag attributes in the inlined script tag, use the `attributeFilter`.
For example, there is a script tag with attributes:
```html
<script id="js-main" src="./main.js" defer></script>
```

Use the `attributeFilter`:

```js
new HtmlBundlerPlugin({
  // ...
  js: {
    inline: {
      attributeFilter: ({ attributes, attribute, value }) => {
        if (attribute === 'id') return true;
      },
    },
  },
}
```

The inlined tag contains the `id` attribute, but the `src` and `defer` are removed:
```html
<script id="js-main">
  // inlined JavaScript code
</script>
```

All source script files specified in `<script src="...">` are automatically resolved,
and JS will be extracted to output file. The source filename will be replaced with the output filename.

For example:

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
        filename: 'js/[name].[contenthash:8].js',
      },
    }),
  ],
};
```

The `[name]` is the base filename script.
For example, if source file is `main.js`, then output filename will be `js/main.1234abcd.js`.\
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
        filename: 'js/[name].[contenthash:8].js',
        chunkFilename: 'js/[id].[contenthash:8].js',
      },
    }),
  ],
  optimization: {
    splitChunks: {
      cacheGroups: {
        scripts: {
          test: /\.(js|ts)$/, // <= IMPORTANT: split only script files
          chunks: 'all',
        },
      },
    },
  },
};
```

> ⚠️ **Warning**
>
> Webpack tries to split and concatenate chunks of all files (templates, styles, scripts) into jumbles.
> Therefore, the `test` option `MUST` be specified to match only source JS files, otherwise Webpack will generate **invalid output files**.

Also see [How to keep package name for split chunks from **node_modules**](#recipe-split-chunks-keep-module-name).

#### [↑ back to contents](#contents)

<a id="option-css" name="option-css"></a>

### `css`

Type:

```ts
type CssOptions = {
  test?: RegExp;
  filename?: FilenameTemplate;
  chunkFilename?: FilenameTemplate;
  outputPath?: string;
  inline?: 'auto' | boolean;
  hot?: boolean;
};
```

Default properties:

```js
{
  test: /\.(css|scss|sass|less|styl)$/,
  filename: '[name].css',
  chunkFilename: '[name].css',
  outputPath: null,
  inline: false,
  hot: false,
}
```

- `test` - an RegEpx to process all source styles that pass test assertion
- `filename` - an output filename of extracted CSS. Details see by [filename option](#option-filename).
- `chunkFilename` - an output filename of non-initial chunk files, e.g., a style file imported in JavaScript.
- `outputPath` - an output path of extracted CSS. Details see by [outputPath option](#option-outputpath).
- `inline` - inject CSS into into HTML at render time, available values:
  - `false` - stores CSS in an output file (**defaults**)
  - `true` - adds CSS to the DOM by injecting a `<style>` tag
  - `'auto'` - in `development` mode - adds to DOM, in `production` mode - stores as a file
- `hot` - inject CSS into the DOM at runtime and enable HMR (hot update CSS without a full reload),\
  similar to how it works in [style-loader](https://github.com/webpack-contrib/style-loader).

All source style files specified in `<link href="..." rel="stylesheet">` are automatically resolved,
and CSS will be extracted to output file. The source filename will be replaced with the output filename.

For example:

```html
<link href="./style.scss" rel="stylesheet" />
```

> ⚠️ **Warning**
>
> Don't import source styles in JavaScript. Styles should be specified directly in HTML.\
> Don't define source JS files in Webpack entry. Scripts must be specified directly in HTML.

The default CSS output filename is `[name].css`.
You can specify your own filename using [webpack filename substitutions](https://webpack.js.org/configuration/output/#outputfilename):

```js
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
module.exports = {
  plugins: [
    new HtmlBundlerPlugin({
      css: {
        filename: 'css/[name].[contenthash:8].css',
      },
    }),
  ],
};
```

The `[name]` is the base filename of a loaded style.
For example, if source file is `style.scss`, then output filename will be `css/style.1234abcd.css`.\
If you want to have a different output filename, you can use the `filename` options as the [function](https://webpack.js.org/configuration/output/#outputfilename).

<a id="option-css-hot" name="option-css-hot"></a>

#### `css.hot` option

> ⚠️ Limitation
>
> - HMR works only for styles imported in JavaScript files. Doesn't works for styles defined directly in HTML via `link` tag.
> - Hot update without a full reload works only for styles imported in a last JavaScript file.\
>   If you have many JS files defined in HTML, where are imported styles, and change a style file imported in the first JS file,
>   then changes will not be detected in HMR module. You should reload the browser manually.
>   This behavior is a BUG in Webpack. The [style-loader](https://github.com/webpack-contrib/style-loader) has exactly same limitation.
>

If you use the [Live Reload](#setup-live-reload) configuration, then be sure to exclude the style files (CSS/SCSS) from watching,
otherwise after changes a style file, a page will be full reloaded.

> ℹ️ Note
>
> If `devServer` is configured for HRM with styles, then after changing the styles defined in HTML, `Live Reload` will not work for them.
> You should then reload the browser self.

Configuration of `devServer` to enable HMR:

```js
devServer: {
  static: {
    directory: path.join(__dirname, 'dist'),
  },
  watchFiles: {
    paths: ['src/**/*.(html|eta)'], // <= exclude *.s?css from watching
    options: {
      usePolling: true,
    },
  },
},
```

**💡 Tip**: to enable HMR for all style files without a full reload, import all those styles in one JS file.


> ⚠️ **Warning**
>
> Don't use `mini-css-extract-plugin` because the bundler plugin extracts CSS much faster than other plugins.
>
> Don't use `resolve-url-loader` because the bundler plugin resolves all URLs in CSS, including assets from node modules.
>
> Don't use `style-loader` because the bundler plugin can auto inline CSS and HMR.

#### [↑ back to contents](#contents)

<a id="option-data" name="option-data"></a>

### `data`

Since the `v2.5.0`, the `data` plugin option is the reference to [loaderOptions.data](#loader-option-data).

Now it is possible to define the `data` option directly in the plugin options to simplify the config.

The NEW syntactic "sugar":

```js
new HtmlBundlerPlugin({
  entry: {
    index: './src/views/home.ejs',
  },
  // new reference to the loaderOptions.data
  data: {...},
}),
```

The old syntax is still valid and will never be deprecated:

```js
new HtmlBundlerPlugin({
  entry: {
    index: './src/views/home.ejs',
  },
  loaderOptions: {
    // original option is under loaderOptions
    data: {...},
  },
}),
```

Please see the details below under the [data](#loader-option-data) loader options.

#### [↑ back to contents](#contents)

<a id="option-sources" name="option-sources"></a>

### `sources`

Since the `v4.18.0`, the `sources` plugin option is the reference to [loaderOptions.sources](#loader-option-sources).

Now it is possible to define the `sources` option directly in the plugin options to simplify the config.


The NEW syntactic "sugar":

```js
new HtmlBundlerPlugin({
  entry: {
    index: './src/views/home.ejs',
  },
  // new reference to the loaderOptions.sources
  sources: [...],
}),
```

The old syntax is still valid and will never be deprecated:

```js
new HtmlBundlerPlugin({
  entry: {
    index: './src/views/home.ejs',
  },
  loaderOptions: {
    // original option is under loaderOptions
    sources: [...],
  },
}),
```

#### [↑ back to contents](#contents)

<a id="option-router" name="option-router"></a>

### `router`

```ts
type Router =
  | boolean
  | {
      enabled?: boolean;
      test?: RegExp | Array<RegExp>;
      rewriteIndex?: false | string;
      resolve?: (props: {
        sourceRoute: string;
        outputRoute: string;
        sourceFile: string;
        outputFile: string;
      }) => void | string;
    };
```

- `enabled` - Enable / disable the route resolving. Defaults `true`.
- `test` - The router resolves values matching to the RegExp only.\
   Defaults, defined the same as [plugin.test](#option-test) option to match templates of used [preprocessor](#option-preprocessor).
- `rewriteIndex` - Rewrite the `index.html`.
   - If [publicPath](#webpack-option-output-publicpath) is `auto`, replaces `index.html` with the specified string, should be on of: `'.'`, `''` (empty).
   - If [publicPath](#webpack-option-output-publicpath) is not empty, replaces `index.html` with `''` (empty) regardless of specified value.
   - If the route URL contains a query or a segment (e.g. `index.html#contact`), the `rewriteIndex` is ignored.
- `resolve()` - Allow modify the resolved route URL.\
   The argument is the object:
   - `sourceRoute` - The resolved attribute value (absolute path).
   - `outputRoute` - The output URL regards [publicPath](#webpack-option-output-publicpath), e.g. by `auto` publicPath is relative to `outputFile`.
   - `sourceFile` - The absolute path to the template file where is resolved the `sourceRoute`.
   - `outputFile` - The output HTML filename of `sourceFile`, relative to the `dist/` directory.\
   Return:
     - void - Do nothing.
     - string - The returned string replaces the value.

The `router` option enable resolving of `a.href` (by defaults) values as a route URL to inner pages.
This is useful for multi-page sites.

Using the [sources](#loader-option-sources) option you can specify any tag attribute which should be resolved.

> [!NOTE]
> The router resolves routes specified in the `entry` plugin option only. An external URL will be ignored.


```js
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
module.exports = {
  resolve: {
    alias: {
      // recommended to use the alias for the route in templates
      '@views': path.join(__dirname, 'src/views/pages'),
    },
  },
  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        // multi-pages
        index: './src/views/pages/home/index.html',
        'news/sport/index': './src/views/pages/news/sport/index.html',
      },
      router: true, // enable resolving of route URLs in a.href
    }),
  ],
};
```

In templates, specify the `source path` to the linked template.
The linked template must be specified in the `entry` plugin option too.

The source _./src/views/pages/index.html_
```html
<html>
<body>
  <h1>Home</h1>
  <a href="@views/home/index.html">Home</a> | <a href="@views/news/sport/index.html">Sport</a>
</body>
</html>
```

The source _./src/views/pages/news/sport/index.html_
```html
<html>
<body>
  <h1>Sports News</h1>
  <a href="@views/home/index.html">Home</a> | <a href="@views/news/sport/index.html">Sport</a>
</body>
</html>
```

> [!TIP]
> If you use a template, you can include navigation as a partial on all pages,
> since the route URLs will be automatically resolved from their source files.

The generated _dist/index.html_

```html
<html>
<body>
  <h1>Home</h1>
  <a href="index.html">Home</a> | <a href="news/sport/index.html">Sport</a>
</body>
</html>
```

The generated _dist/news/sport/index.html_

```html
<html>
<body>
  <h1>Sports News</h1>
  <a href="../../index.html">Home</a> | <a href="index.html">Sport</a>
</body>
</html>
```

> [!TIP]
> You can use the `router.rewriteIndex` option to rewrite the `index.html`.

#### [↑ back to contents](#contents)

<a id="option-before-preprocessor" name="option-before-preprocessor"></a>

### `beforePreprocessor`

Reference to `loaderOption.beforePreprocessor`

The plugin option is the reference to [loaderOptions.beforePreprocessor](#loader-option-before-preprocessor).

Type:

```ts
type BeforePreprocessor =
  | false
  | ((
      content: string,
      loaderContext: LoaderContext<Object> & { data: { [key: string]: any } | string }
    ) => string | undefined);
```

Default: `false`

The `content` is the raw content of a template.

The description of all `loaderContext` attributes see in the [Webpack documentation](https://webpack.js.org/api/loaders/#thisresourcepath).

Returns the modified template. If you are not changing the template, you should return `undefined` or not use `return` at all.

The callback function called right before the [preprocessor](#loader-option-preprocessor).
This can be useful when using one of the predefined preprocessors and modifying the raw template or the data passed to the template.

For example:

```js
new HtmlBundlerPlugin({
  entry: {
    index: 'src/views/pages/',
  },
  data: {
    title: 'Welcome to [sitename] website',
  },
  beforePreprocessor: (content, { resourcePath, data }) => {
    let sitename = 'Homepage';
    if (resourcePath.includes('/about.html')) sitename = 'About';
    data.title = data.title.replace('[sitename]', sitename); // modify template data
    return content.replaceAll('{{old_var}}', '{{new_var}}'); // modify template content
  },
  preprocessor: 'handlebars', // use the templating engine
});
```

#### [↑ back to contents](#contents)


<a id="option-preprocessor" name="option-preprocessor"></a>

### `preprocessor` (callback or string) and `preprocessorOptions`

The plugin options are the references to [loaderOptions.preprocessor](#loader-option-preprocessor) and [loaderOptions.preprocessorOptions](#loader-option-preprocessorOptions).

Now it is possible to define these options directly in the plugin options to simplify the config.

The NEW syntactic "sugar":

```js
new HtmlBundlerPlugin({
  entry: {
    index: './src/views/home.ejs',
  },
  // new references to options in the loaderOptions
  preprocessor: 'ejs',
  preprocessorOptions: {...},
}),
```

The old syntax is still valid and will never be deprecated:

```js
new HtmlBundlerPlugin({
  entry: {
    index: './src/views/home.ejs',
  },
  loaderOptions: {
    // original options are under loaderOptions
    preprocessor: 'ejs',
    preprocessorOptions: {...},
  },
}),
```

Please see the details below under the [preprocessor](#loader-option-preprocessor) and the [preprocessorOptions](#loader-option-preprocessorOptions) options.

#### [↑ back to contents](#contents)

<a id="option-postprocess" name="option-postprocess"></a>

### `postprocess` callback

Type:

```ts
type postprocess = (
  content: string,
  info: TemplateInfo,
  compilation: Compilation
) => string | undefined;

type TemplateInfo = {
  name: string;
  assetFile: string;
  sourceFile: string;
  resource: string;
  outputPath: string;
};
```

Default: `null`

Called after the template has been compiled, but not yet finalized, before injection of the split chunks and inline assets.

The `postprocess` have the following arguments:

- `content: string` - a content of processed file
- `info: TemplateInfo` - info about current file
- `compilation: Compilation` - the Webpack [compilation object](https://webpack.js.org/api/compilation-object/)

The `TemplateInfo` have the following properties:

- `name: string` - the entry name
- `assetFile: string` - the output asset filename relative to `outputPath`
- `sourceFile: string` - the absolute path of the source file, without a query
- `resource: string` - the absolute path of the source file, including a query
- `outputPath: string` - the absolute path of the output directory

Return new content as a `string`.
If return `undefined`, the result processed via Webpack plugin is ignored and will be saved a result processed via the loader.

#### [↑ back to contents](#contents)


<a id="option-beforeEmit" name="option-beforeEmit"></a>

### `beforeEmit` callback

Type:

```ts
type BeforeEmit = (
  content: string,
  entry: CompileEntry,
  compilation: Compilation
) => string | undefined;

type CompileEntry = TemplateInfo & {
  // assets used in html
  assets: Array<CompileAsset>;
};
```

Default: `null`

Called at the latest stage of the [processAssets](https://webpack.js.org/api/compilation-hooks/#processassets) hook, before emitting.
This is the latest stage where you can change the html before it will be saved on the disk.

Callback parameters:
- `content: string` - the final version html content
- `entry: CompileEntry` the information about the entry containing all dependent assets,\
  the description of the `TemplateInfo` see by [postprocess](#option-postprocess)
- `compilation: Compilation` - the Webpack [compilation object](https://webpack.js.org/api/compilation-object/)

Return new content as a `string`.
If return `undefined` then content will not be changed.

#### [↑ back to contents](#contents)


<a id="option-afterEmit" name="option-afterEmit"></a>

### `afterEmit` callback

Type:

```ts
type AfterEmit = (
  entries: Array<CompileEntry>,
  compilation: Compilation
) => Promise<void> | void;
```

Default: `null`

Called after emitting assets to output directory.
This callback can be useful to create a manifest file containing source and output filenames.

Callback parameters:
- `entries: Array<CompileEntry>` the collection of entries containing all dependent assets,\
   the description of the `CompileEntry` see by [beforeEmit](#option-beforeEmit)
- `compilation: Compilation` - the Webpack [compilation object](https://webpack.js.org/api/compilation-object/)

#### [↑ back to contents](#contents)


<a id="option-renderStage" name="option-renderStage"></a>

### `renderStage`

Type: `null | number`

Default: `Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER - 1`

The [stage](https://webpack.js.org/api/compilation-hooks/#list-of-asset-processing-stages) to render output HTML in the [processAssets](https://webpack.js.org/api/compilation-hooks/#processassets) Webpack hook.
<!--
The  minimal possible stage for the rendering is `PROCESS_ASSETS_STAGE_SUMMARIZE`.
-->

For example:

```js
const path = require('path');
const Compilation = require('webpack/lib/Compilation');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  mode: 'production',
  output: {
    path: path.join(__dirname, 'dist/'),
  },
  plugins: [
    new CompressionPlugin(),
    new HtmlBundlerPlugin({
      entry: {
        index: 'src/index.html',
      },
      // ensures that the CompressionPlugin save the resulting HTML into the `*.html.gz` file
      // after the rendering process in the HtmlBundlerPlugin
      renderStage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_HASH + 1,
    }),
  ],
};

```

Other example with an optimization plugin:

```js
const path = require('path');
const Compilation = require('webpack/lib/Compilation');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
const HtmlMinimizerPlugin = require('html-minimizer-webpack-plugin');

module.exports = {
  mode: 'production',
  output: {
    path: path.join(__dirname, 'dist/'),
  },
  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: 'src/index.html',
      },
      // ensures that the HTML rendering is called right before the HtmlMinimizerPlugin
      renderStage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE - 1,
    }),
  ],
  optimization: {
    minimizer: [
      // this plugin is called at the PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE stage
      new HtmlMinimizerPlugin({}),
    ],
  },
};

```

> [!TIP]
> To ensures that the rendering process will be run after all optimizations and after all other plugins
> set the `renderStage: Infinity + 1`.

> [!CAUTION]
> Use this option only to order the sequence of asset processing across multiple plugins that use the same [processAssets](https://webpack.js.org/api/compilation-hooks/#processassets) hook.


#### [↑ back to contents](#contents)


<a id="option-preload" name="option-preload"></a>

### `preload`

Type:

```ts
type Preload = Array<{
  test: RegExp;
  filter?: PreloadFilter;
  as?: string;
  rel?: string;
  type?: string;
  attributes?: { [attributeName: string]: string | boolean };
}>;
```

```ts
type PreloadFilter =
  | RegExp
  | Array<RegExp>
  | { includes?: Array<RegExp>; excludes?: Array<RegExp> }
  | ((asset: { sourceFiles: Array<string>; outputFile: string }) => void | boolean);
```

Default: `null`

Generates and injects preload tags `<link rel="preload">` in the head before all `link` or `script` tags for all matching source assets resolved in templates and styles.

The descriptions of the properties:

- `test` - an RegEpx to match source asset files.
- `filter` - an advanced filter to preload only matched output asset files.
- `as` - a content type, one of `audio` `document` `embed` `font` `image` `object` `script` `style` `track` `video` `worker`
- `rel` - a value indicates how to load a resource, one of `preload` `prefetch` , defaults `preload`
- `type` - a [MIME type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types) of the content.\
  Defaults the type is detected automatically, for example:
  - `picture.png` as `image/png`
  - `picture.jpg` as `image/jpeg`
  - `picture.svg` as `image/svg+xml`
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

> [!NOTE]
>
> The `true` value of a property will be rendered as an attribute w/o a value.
>
> For example, the  `attributes: { crossorigin: true }` will be rendered to:
> ```html
> <link rel="preload" ... crossorigin />
> ```
>
> Setting the [crossorigin](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/crossorigin) attribute to an empty value, like `crossorigin` or `crossorigin=""`, is the same as `anonymous`.

If you define the `attributes` than you can write the `as`, `rel` and `type` properties in the `attributes`.

For example:

```js
{
  test: /\.(ttf|woff2?)$/,
  attributes: { as: 'font', rel: 'prefetch', crossorigin: true },
},
```

<a id="option-preload-filter" name="option-preload-filter"></a>

#### `filter` option

By default, all files matching the `test` option will be preloaded.
You can use the `filter` to preload specific files individually.

The `PreloadFilter` type provides a versatile way to define filtering logic,
from simple patterns to complex inclusion and exclusion criteria.

The filter RegExp matches both the source and output files.
If you need to match source or output files separately use the filter function, see below.

Here's are supported filter formats:

- `RegExp`\
   The filter matches a value if it satisfies this single regular expression.\
   Works the same as `{ includes: [RegExp,] }`.\
   For example:
   ```js
   filter: /vendor/, // preload files containing the `vendor` string only
   ```

- `Array<RegExp>`\
  Matches a value if it satisfies **at least one** of the regular expressions in the array.\
  Works the same as `{ includes: [RegExp1, RegExp2, ...] }`.\
  For example:
  ```js
  filter: [/vendor1/, /vendor2/,], // preload files containing the `vendor1` or `vendor2`
  ```

- `{ includes?: Array<RegExp>; excludes?: Array<RegExp> }`\
  An object with optional `includes` and `excludes` arrays of regular expressions.\
  For more advanced filtering where inclusion and exclusion criteria need to be combined:
  - `includes`: Matches values that satisfy **at least one** of the regular expressions in the array.
  - `excludes`: Rejects values that satisfy **at least one** of the regular expressions in the array.
  - For `includes` and `excludes`, the logic is AND: a value must match the `includes` patterns and **not match** the `excludes` patterns.

  For example:
  ```js
  filter: {
    includes: [/include-this/,],
    excludes: [/exclude-this/,],
  }
  ```
- `(asset: { sourceFiles: Array<string>; outputFile: string }) => void | boolean`\
  Custom logic provides maximum flexibility for filtering that cannot be expressed with regular expressions.\
  A custom filter function takes the source files and the output asset file as input, and decides whether they match based on the return value:
  - Returns `void` (`undefined`) or `true` if the value passes the filter.
  - Returns `false` if the value fails the filter.

> [!NOTE]
> Only `style` type may have many files in the `sourceFiles`.\
> If many styles are imported in one JS file, then all extracted CSS will be squashed into single CSS file with the name of a JS parent file.
> In this case the `sourceFiles` will have many files.
>
> Usage for `style` type:
> ```js
> {
>   test: /\.(s?css|less)$/,
>   filter: ({ sourceFiles, outputFile }) => {
>     return !sourceFiles.some((sourceFile) => /noPreload/.test(sourceFile));
>   },
>   as: 'style',
> },
> ```
>
> All other types have only one file in the `sourceFiles` array.
> You can use the argument destructor to extract only first source file.
>
> Usage for all other types:
> ```js
> {
>   test: /\.(js|ts)$/,
>   filter: ({ sourceFiles: [sourceFile], outputFile }) => !/noPreload/.test(outputFile),
>   as: 'script',
> },
> ```

For example, preload all JS files except dynamically imported (async chunks).

There is the _app.js_:

```js
// specify the name of an individual chunk to exclude from preloading
import(
 /* webpackChunkName: "moduleA.asyncChunk" */
 './moduleA',
);

import('./moduleB'); // other asyncChunk which should be preloaded
import './moduleC'; // normal module
```

Use the `filter` preload option to exclude files:
```js
preload: [
  {
    test: /\.(js|ts)$/,
    filter: {
      // matches source and output files
      excludes: [/asyncChunk/],
    },
    as: 'script',
  },
],
```

The same effect using the `filter` function:
```js
preload: [
  {
    test: /\.(js|ts)$/,
    filter: ({ sourceFiles: [sourceFile], outputFile }) => !/asyncChunk/.test(sourceFile)),
    as: 'script',
  },
],
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

The generated preload tag like the following:

```html
<link rel="preload" href="css/style.1f4faaff.css" as="style" />
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

The generated preload tag like the following:

```html
<link rel="preload" href="js/main.c608b1cd.js" as="script" />
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

The generated preload tags like the following:

```html
<link rel="preload" href="img/apple.697ef306.png" as="image" type="image/png" />
<link rel="preload" href="img/lemon.3666c92d.svg" as="image" type="image/svg+xml" />
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

> ℹ️ **Note**
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

> ℹ️ **Note**
>
> Font preloading [requires](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/preload#cors-enabled_fetches) the `crossorigin` attribute to be set.\
> If the `crossorigin` property is not defined, it will be added for the `font` type automatically.
>
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
    <img src="./apple.png" alt="apple" />
    <script src="./app.js"></script>
    <img src="./lemon.svg" alt="lemon" />
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
    <link rel="preload" href="img/apple.697ef306.png" as="image" type="image/png" />
    <link rel="preload" href="img/lemon.3666c92d.svg" as="image" type="image/svg+xml" />
    <!-- 2. preload styles -->
    <link rel="preload" href="css/style.1f4faaff.css" as="style" />
    <!-- 3. preload scripts -->
    <link rel="preload" href="js/main.c608b1cd.js" as="script" />
    <link rel="preload" href="js/app.2c8d13ac.js" as="script" />

    <script src="js/main.c608b1cd.js" defer></script>
    <link href="css/style.1f4faaff.css" rel="stylesheet" />
  </head>
  <body>
    <img src="img/apple.697ef306.png" alt="apple" />
    <script src="js/app.2c8d13ac.js"></script>
    <img src="img/lemon.3666c92d.svg" alt="lemon" />
  </body>
</html>
```

#### [↑ back to contents](#contents)

<a id="option-minify" name="option-minify"></a>

### `minify`

Type: `'auto'|boolean|Object` Default: `false`

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
- `'auto'` - in `development` mode disable minification, in `production` mode enable minification with default options,
  use [minifyOptions](#option-minify-options) to customize options
- `{}` - enable minification with custom options, this object are merged with `default options`\
  see [options reference](https://github.com/terser/html-minifier-terser#options-quick-reference)

<a id="option-minify-options" name="option-minify-options"></a>

### `minifyOptions`

Type: `Object` Default: `null`

When the [minify](#option-minify) option is set to `'auto'` or `true`, you can configure minification options using the `minifyOptions`.

#### [↑ back to contents](#contents)

<a id="option-extract-comments" name="option-extract-comments"></a>

### `extractComments`

Type: `boolean` Default: `false`

Whether comments shall be extracted to a separate file like the `*.LICENSE.txt`.

By default, the built-in Webpack plugin `TerserWebpackPlugin` extracts the license banner from node modules into a separate `*.LICENSE.txt` file,
although this is usually not necessary.

Therefore, by default, the Bundler Plugin does not allow extracting comments.
This has the same effect as explicitly defining the `extractComments: false` option of the TerserWebpackPlugin.

If you want to allow extraction of `*.LICENSE.txt` files, set this option to `true`.

#### [↑ back to contents](#contents)

<a id="option-integrity" name="option-integrity"></a>

### `integrity`

Type: `'auto'|boolean|IntegrityOptions` Default: `false`

The [subresource integrity hash](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) is a cryptographic value of the integrity attribute that used by a browser to verify that the content of an asset has not been manipulated.
If the asset has been manipulated, the browser will never load it.

The Bundler Plugin generates the integrity hashes and adds the integrity attribute to the `link` and `script` tags when generating HTML.

> No additional plugins required. This plugin computes integrity hashes itself.

```ts
type IntegrityOptions = {
  enabled?: 'auto' | boolean;
  hashFunctions?: HashFunctions | Array<HashFunctions>;
};
type HashFunctions = 'sha256' | 'sha384' | 'sha512';
```

If the `integrity` option is an object, then default options are:

```js
{
  enabled: 'auto',
  hashFunctions: 'sha384',
}
```

> ℹ️ **Note**
>
> The [W3C recommends](https://www.w3.org/TR/2016/REC-SRI-20160623/#hash-collision-attacks) using the `SHA-384` hash algorithm.

The `integrity` or `integrity.enabled` has one of values:

- `auto` - enable the integrity when Webpack mode is `production` and disable it when mode is `development`
- `true` - enable
- `false` - disable

The `hashFunctions` option can be a string to specify a single hash function name,
or an array to specify multiple hash functions for compatibility with many browsers.

> ⚠️ **Warning**
>
> When used the `integrity` option:
>
> - The [`js.filename`](#option-js) and [`css.filename`](#option-css) options must contain the `contenthash`.
> - The [`output.crossOriginLoading`](https://webpack.js.org/configuration/output/#outputcrossoriginloading) Webpack option must be specified as `'use-credentials'` or `'anonymous'`.
>   The bundler plugin adds the `crossorigin` attribute with the value defined in the `crossOriginLoading`.
>   The `crossorigin` attribute  tells the browser to request the script with CORS enabled, which is necessary because the integrity check fails without CORS.
> - The [`optimization.realContentHash`](https://webpack.js.org/configuration/optimization/#optimizationrealcontenthash) Webpack option must be enabled, by default is enabled in production mode only.
>
> This requirement is necessary to avoid the case where the browser tries to load a contents of a file from the local cache since the filename has not changed, but the `integrity` value has changed on the server.
> In this case, the browser will not load the file because the `integrity` of the cached file computed by the browser will not match the `integrity` attribute computed on the server.

Add the `integrity` option in the Webpack config:

```js
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  output: {
    // required for `integrity` to work in the browser
    crossOriginLoading: 'anonymous',
  },
  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: 'src/views/index.html', // template where are included link and script tags
      },
      js: {
        filename: '[name].[contenthash:8].js', // the filename must contains a contenthash
      },
      css: {
        filename: '[name].[contenthash:8].js', // the filename must contains a contenthash
      },
      integrity: 'auto', // enable in `production`, disable in `development` mode
    }),
  ],
};
```

The source HTML template _src/views/index.html_:

```html
<html>
  <head>
    <!-- include source style -->
    <link href="./style.scss" rel="stylesheet" />
    <!-- include source script -->
    <script src="./main.js" defer="defer"></script>
  </head>
  <body>
    <h1>Hello World!</h1>
  </body>
</html>
```

The generated HTML contains the integrity hashes:

```html
<html>
  <head>
    <link
      href="style.1234abcd.css"
      rel="stylesheet"
      integrity="sha384-gaDmgJjLpipN1Jmuc98geFnDjVqWn1fixlG0Ab90qFyUIJ4ARXlKBsMGumxTSu7E"
      crossorigin="anonymous" />

    <script
      src="main.abcd1234.js"
      defer="defer"
      integrity="sha384-E4IoJ3Xutt/6tUVDjvtPwDTTlCfU5oG199UoqWShFCNx6mb4tdpcPLu7sLzNc8Pe"
      crossorigin="anonymous"></script>
  </head>
  <body>
    <h1>Hello World!</h1>
  </body>
</html>
```


#### `integrityHashes` hook

For details see the [integrityHashes hook](#hook-integrity-hashes).


#### [↑ back to contents](#contents)

<a id="option-watch-files" name="option-watch-files"></a>

### `watchFiles`

Type:

```ts
type WatchFiles = {
  paths?: Array<string>;
  includes?: Array<RegExp>;
  excludes?: Array<RegExp>;
};
```

Default:

```js
watchFiles: {
  paths: ['./src'],
  includes: [/\.(html|ejs|eta)$/],
  excludes: [
    /[\\/](node_modules|dist|test)$/, // ignore standard project dirs
    /[\\/]\..+$/, // ignore hidden dirs and files, e.g.: .git, .idea, .gitignore, etc.
    /package(?:-lock)*\.json$/, // ignore npm files
    /webpack\.(.+)\.js$/, // ignore Webpack config files
    /\.(je?pg|png|ico|webp|svg|woff2?|ttf|otf|eot)$/, // exclude binary assets
  ],
}
```

Allows to configure paths and files to watch file changes for rebuild in `watch` or `serv` mode.

> ℹ️ **Note**
>
> To watch changes with a `live reload` in the browser, you must additionally configure the `watchFiles` in `devServer`,
> see [setup live reload](#setup-live-reload).

#### Properties:

- `paths` - A list of relative or absolute paths to directories where should be watched `includes`.\
  The watching path for each template defined in the entry will be autodetect as the first level subdirectory of the template relative to the project's root path.
  E.g., the template `./src/views/index.html` has the watching path of `./src`.

- `includes` - Watch the files specified in `paths`, except `excludes`, that match the regular expressions.
  Defaults, are watched only files that match the [`test`](#option-test) plugin option.

- `excludes` - Exclude the specified paths or files, that match the regular expressions.

This options does not override the default values, but extends them.

For example, all source files are in the `./src` directory,
while some partials included in a template are in `./vendor/` directory, then add it to the `paths`:

```js
watchFiles: {
  paths: ['vendor'],
},
```

If you want watch changes in some special files used in your template that are only loaded through the template engine,
add them to the `includes` property:

```js
watchFiles: {
  paths: ['vendor'],
  includes: [
    /data\.(js|json)$/,
  ],
},
```

To exclude watching of files defined in `paths` and `includes`, you can use the `excludes` option.
This option has the priority over paths and files.

> ℹ️ **Note**
>
> To display all watched files, enable the [`verbose`](#option-verbose) option.

#### [↑ back to contents](#contents)

<a id="option-hot-update" name="option-hot-update"></a>

### `hotUpdate`

Type: `boolean` Default: `false`

If the value is `true`, then in the `serve` or `watch` mode, the `hot-update.js` file is injected into each generated HTML file to enable the live reloading.
Use this options only if you don't have a referenced source file of a script in html.

> ℹ️ **Note**
>
> The `devServer.hot` must be `true`.

If you already have a js file in html, this setting should be `false` as Webpack automatically injects the hot update code into the compiled js file.

Also see [Setup Live Reload](#setup-live-reload).

<a id="option-verbose" name="option-verbose"></a>

### `verbose`

Type: `'auto'|boolean` Default: `false`

The verbose option allows displaying in the console the processing information about extracted resources.
All resources are grouped by their issuers.

Possible values:

- `false` - do not display information
- `true` - display information
- `auto` - in `development` mode enable verbose, in `production` mode disable verbose

> ℹ️ **Note**
>
> If you want to colorize the console output in your app, use the best Node.js lib [ansis][ansis].

#### [↑ back to contents](#contents)

<a id="option-loader-options" name="option-loader-options"></a>

### `loaderOptions`

This is the reference to the [loader options](#loader-options).
You can specify loader options here in the plugin options to avoid explicitly defining the `HtmlBundlerPlugin.loader` in `module.rules`.
The `HtmlBundlerPlugin.loader` will be added automatically.

For example, both configurations are functionally identical:

_1) the variant using the `loaderOptions`_, **recommended** for common use cases:

```js
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
module.exports = {
  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: 'src/views/index.ejs',
      },
      // compile a template into HTML using `ejs` module
      preprocessor: 'ejs',
      loaderOptions: {
        // resolve files specified in non-standard attributes 'data-src', 'data-srcset'
        sources: [{ tag: 'img', attributes: ['data-src', 'data-srcset'] }],
      },
    }),
  ],
};
```

_2) the `low level` variant using the `module.rules`_:

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
          sources: [{ tag: 'img', attributes: ['data-src', 'data-srcset'] }],
          preprocessor: 'ejs',
        },
      },
    ],
  },
};
```

> ⚠️ **Warning**
>
> If you don't know what it's for, don't define a module rule for template files.
> The plugin automatically configures this rule.
>
> Define this rule only for special cases, e.g. when you have templates with different templating engines.\
> An example see by [How to use some different template engines](#recipe-diff-templates).

> ℹ️ **Note**
>
> Options defined in `module.rules` take precedence over the same options defined in `loaderOptions`.

---

#### [↑ back to contents](#contents)

<a id="loader-options" name="loader-options"></a>

## Loader options

<a id="default-loader" name="default-loader"></a>
The `default loader`:

```js
{
  test: /\.(html)$/,
  loader: HtmlBundlerPlugin.loader,
}
```

You can omit the loader in Webpack `modules.rules`.
If the `HtmlBundlerPlugin.loader` is not configured, the plugin add it with default options automatically.

The default loader handles HTML files and `EJS`-like templates.

> ℹ️ **Note**
>
> It is recommended to define all loader options in the [`loaderOptions`](#option-loader-options) by the plugin options
> to keep the webpack config clean and smaller.

> ⚠️ **Warning**
>
> The plugin works only with the own loader `HtmlBundlerPlugin.loader`.
> Do not use another loader.
> This loader replaces the functionality of `html-loader` and many other template loaders.

<a id="loader-option-sources" name="loader-option-sources"></a>

### `sources`

> ℹ️ **Note**
>
> Since the `v4.18.0` is available new syntax, the [sources](#option-sources) option should be defined directly in the plugin option to simplify the config.

Type:

```ts
type Sources =
  | boolean
  | Array<{
      tag?: string;
      attributes?: Array<string>;
      filter?: (props: {
        tag: string;
        attribute: string;
        value: string;
        parsedValue: Array<string>;
        attributes: { [attributeName: string]: string };
        resourcePath: string;
      }) => boolean | void;
    }>;
```

Default: `true`

The `sources` option allow to specify a tag attribute that should be resolved.

<a id="loader-option-sources-default" name="loader-option-sources-default"></a>

#### Default attributes

By default, resolves source files in the following tags and attributes:

| Tag      | Attributes                                                                                                   |
| -------- | ------------------------------------------------------------------------------------------------------------ |
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

> ⚠️ **Warning**
>
> It is not recommended to use the [deprecated](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/xlink:href) `xlink:href` attribute by the `image` and `use` tags.

> ℹ️ **Note**
>
> Automatically are processed only attributes containing a relative path or Webpack alias:
>
> - `src="./image.png"` or `src="image.png"` - an asset in the local directory
> - `src="../../assets/image.png"` - a relative path to parent directory
> - `src="@images/image.png"` - an image directory as Webpack alias
>
> Url values are not processed:
>
> - `src="https://example.com/img/image.png"`
> - `src="//example.com/img/image.png"`
> - `src="/img/image.png"` (not processed only if not defined the [root option](#loader-option-root))
>
> Others not filename values are ignored, e.g.:
>
> - `src="data:image/png; ..."`
> - `src="javascript: ..."`

<a id="loader-option-sources-filter" name="loader-option-sources-filter"></a>

#### `filter` function

Using the `filter` function, you can enable/disable resolving of specific assets by tags and attributes.

The `filter` is called for all attributes of the tag defined as defaults and in `sources` option.
The argument is an object containing the properties:

- `tag: string` - a name of the HTML tag
- `attribute: string` - a name of the HTML attribute
- `value: string` - an original value of the HTML attribute
- `parsedValue: Array<string>` - an array of filenames w/o URL query, parsed in the value\
   it's useful for the `srcset` attribute containing many image files, e.g.:
   ```html
   <img src="image.png?size=800" srcset="image1.png?size=200 200w, image2.png 400w">
   ```
   the `parsedValue` for the `src` is `['image.png']`, the array with one parsed filename\
   the `parsedValue` for the `srcset` is `['image1.png', 'image2.png']`
- `attributes: { [attributeName: string]: string }` - all attributes of the tag
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
    if (resourcePath.includes('example')) return false;
    // otherwise return 'true' or nothing (undefined) to allow the processing
  },
}
```

The default sources can be extended with new tags and attributes.

For example, enable the processing for the non-standard `data-src` and `data-srcset` attributes in the `img` tag:

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
});
```

You can use the `filter` function to allow the processing only specific attributes.

The `filter` function must return `true` or `undefined` to enable the processing of specified tag attributes.
Return `false` to disable the processing.

For example, allow processing only for images in `content` attribute of the `meta` tag:

```html
<html>
  <head>
    <!-- ignore the 'content' attribute via filter -->
    <meta name="theme-color" content="#ffffff" />
    <meta property="og:title" content="Frutis" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:video:type" content="video/mp4" />

    <!-- resolve the 'content' attribute via filter  -->
    <meta property="og:image" content="./frutis.png" />
    <meta property="og:video" content="./video.mp4" />
  </head>
  <body>
    <!-- resolve standard 'src' attribute -->
    <img src="./image.png" />
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
        // allow to handle an image in the 'content' attribute of the 'meta' tag
        // when the 'property' attribute contains one of: 'og:image', 'og:video'
        filter: ({ attributes }) => {
          const attrName = 'property';
          const attrValues = ['og:image', 'og:video']; // allowed values of the property
          if (!attributes[attrName] || attrValues.indexOf(attributes[attrName]) < 0) {
            return false; // return false to disable processing
          }
          // return true or undefined to enable processing
        },
      },
    ],
  },
});
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
      },
    ],
  },
});
```

See also an example of using the `filter` function: [How to resolve source image in `<a href="image.jpg">`](#recipe-resolve-attr-href-a-image).

#### [↑ back to contents](#contents)

<a id="loader-option-root" name="loader-option-root"></a>

### `root`

Type: `string|boolean` Default: `false`

The `root` option allow to resolve an asset file with leading `/` root path.

Defaults is disabled because the file with leading `/` is a valid URL in the public path, e.g. `dist/`.
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
});
```

Now you can use the `/` root path for the source assets:

```html
<html>
  <head>
    <link href="/styles/style.scss" rel="stylesheet" />
    <script src="/scripts/main.js" defer="defer"></script>
  </head>
  <body>
    <h1>Hello World!</h1>
    <img src="/images/apple.png" />
  </body>
</html>
```

#### [↑ back to contents](#contents)

<a id="loader-option-context" name="loader-option-context"></a>

### `context`

Type: `string` Default: `undefined`

The `context` option allow to resolve an asset file without leading `/` path.

For example, there are project files:

```
project/src/views/index.html
project/src/styles/style.scss
project/src/images/logo.png
otherDir/stock-photos/cologne.png // <= file outer your project directory
```

You can use the [root](loader-option-root) option to use assets in your project directory
and define the `context` option to use assets outer your project directory:

```js
new HtmlBundlerPlugin({
  entry: {
    index: 'src/views/index.html',
  },
  loaderOptions: {
    root: path.resolve(__dirname, 'src'),
    context: path.resolve(__dirname, '../otherDir'),
  },
});
```

Now you can use the leading `/` for the assets in your project and w/o `/` for assets from outer directory:

```html
<html>
  <head>
    <link href="/styles/style.scss" rel="stylesheet" />
  </head>
  <body>
    <h1>Hello World!</h1>
    <img src="/images/logo.png" />
    <img src="stock-photos/cologne.png" />
  </body>
</html>
```

#### [↑ back to contents](#contents)

<a id="loader-option-before-preprocessor" name="loader-option-before-preprocessor"></a>

### `beforePreprocessor`

See the description in the [beforePreprocessor](#option-before-preprocessor).

Usage in loaderOptions:

```js
new HtmlBundlerPlugin({
  entry: {
    index: 'src/views/pages/',
  },
  loaderOptions: {
    beforePreprocessor: (content, { resourcePath, data }) => {
      // modify content
      return content;
    },
  },
});
```

#### [↑ back to contents](#contents)

<a id="loader-option-preprocessor" name="loader-option-preprocessor"></a>

### `preprocessor`

Type:

```ts
type Preprocessor =
  | false
  | 'eta'
  | 'ejs'
  | 'handlebars'
  | 'nunjucks'
  | 'pug'
  | 'twig'
  | ((
      content: string,
      loaderContext: LoaderContext<Object> & { data: { [key: string]: any } | string }
    ) => string | Promise<any> | undefined);
```

Default: `'eta'`

You can use the preprocessor as a `string` for supported template engines,
or define your own preprocessor as a function to use any template engine.

#### Supported templating engines "out of the box"

```ts
type Preprocessor = 'eta' | 'ejs' | 'handlebars' | 'nunjucks' | 'pug' | 'twig';
```

The preprocessor is ready to use the most popular templating engines:
[Eta](#using-template-eta), [EJS](#using-template-ejs), [Handlebars](#using-template-handlebars), [Nunjucks](#using-template-nunjucks), [Pug](#using-template-pug), [Twig](#using-template-twig).

Defaults used the [Eta](https://eta.js.org) templating engine,
because `Eta` has the `EJS`-like syntax, is only `2KB` gzipped and is much fasted than EJS.
The npm package `eta` is already installed with this plugin.

You can pass a custom options of the templating engine using the [preprocessorOptions](#loader-option-preprocessorOptions).

For example, if you have `EJS` templates:

install npm package `ejs`

```
npm i -D ejs
```

define the `preprocessor` as the `'ejs'` string

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

> ℹ️ **Note**
>
> Since the `v2.2.0` is available new syntax, the [preprocessor](#option-preprocessor)
> and the [preprocessorOptions](#option-preprocessor) should be defined directly in the plugin option
> to simplify the config:
>
> ```js
> const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
> module.exports = {
>   plugins: [
>     new HtmlBundlerPlugin({
>       entry: {
>         index: 'src/views/pages/home/index.ejs',
>       },
>       preprocessor: 'ejs',
>       preprocessorOptions: {...}
>     }),
>   ],
> };
> ```

<a id="loader-option-preprocessor-custom" name="loader-option-preprocessor-custom"></a>

#### Custom templating engine

To use any templating engine, you can define the `preprocessor` as a function.

```ts
type Preprocessor = (
  content: string,
  loaderContext: LoaderContext<Object> & { data: { [key: string]: any } | string }
) => string | Promise<any> | undefined;
```

The function arguments:

- `content` - a raw content of a template file defined in the [`entry`](#option-entry) option.
- `loaderContext` - the [Loader Context](https://webpack.js.org/api/loaders/#the-loader-context) object contained useful properties:
  - `mode: string` - a Webpack mode: `production`, `development`, `none`
  - `rootContext: string` - a path to Webpack context
  - `resource: string` - a template file, including query
  - `resourcePath: string` - a template file
  - `data: object|null` - variables passed in [`entry.{page}.data`](#option-entry) and [`loader.data`](#loader-option-data)

The preprocessor is called for each entry file, before processing of the content.
The function can be used to compile the template with any template engine,
such as [Eta](https://eta.js.org), [EJS](https://ejs.co), [Handlebars](https://handlebarsjs.com), [Mustache](https://github.com/janl/mustache.js), [Nunjucks](https://mozilla.github.io/nunjucks), [LiquidJS](https://github.com/harttle/liquidjs), etc.

Returns new content as a `string` for sync or `Promise` for async processing.
When the function returns `undefined`, the contents of the template will not change.

The example for your own `sync` render function:

```js
{
  preprocessor: (content, { data }) => render(content, data);
}
```

The example of using `Promise` for your own `async` render function:

```js
{
  preprocessor: (content, { data }) =>
    new Promise((resolve) => {
      const result = render(content, data);
      resolve(result);
    });
}
```

The default `preprocessor` is pre-configured as the following function:

```js
const { Eta } = require('eta');
const eta = new Eta({
  async: false, // defaults is false, wenn is true then must be used `await includeAsync()`
  useWith: true, // allow to use variables in template without `it.` scope
  views: process.cwd(), // directory that contains templates
});
preprocessor = (content, { data }) => eta.renderString(content, data);
```

> ℹ️ **Note**
>
> The plugin supports `EJS`-like templates "out of the box" therefore the `HtmlBundlerPlugin.loader` can be omitted in the Webpack config.

<a id="loader-option-preprocessor-disable" name="loader-option-preprocessor-disable"></a>

#### Disable templating engine

You can use this plugin to resolve all source asset files in any `HTML`-like template used by server-side rendering.
In this case, disable the preprocessor.
The plugin resolves all source files and replaces them with the output filenames.
The original template remains unchanged except for the filenames being replaced.

```js
{
  preprocessor: false,
}
```

See [How to process a PHP template](#recipe-preprocessor-php).

#### [↑ back to contents](#contents)

<a id="loader-option-preprocessorOptions" name="loader-option-preprocessorOptions"></a>

### `preprocessorOptions`

Type: `Object` Default: `{}`

With the `preprocessorOptions` you can pass template engine options when used the [preprocessor](#loader-option-preprocessor) as the string: `eta`, `ejs`, `handlebars`, `nunjucks`, `twig`.
Each preprocessor has its own options, depend on using template engine.

> This loader option is referenced as the [preprocessorOptions](#option-preprocessor) plugin option to simplify the config.

<a id="loader-option-preprocessor-options-eta" name="loader-option-preprocessor-options-eta"></a>

#### Options for `preprocessor: 'eta'` (default)

```js
{
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

---

#### [↑ back to contents](#contents)

<a id="loader-option-preprocessor-options-ejs" name="loader-option-preprocessor-options-ejs"></a>

#### Options for `preprocessor: 'ejs'`

```js
{
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
<%- include('menu/top/desktop.html') %>
<%- include('menu/nav.html') %>
<%- include('teaser.html') %>
<%- include('footer.html') %>
```

If you have partials with `.ejs` extensions, then the extension can be omitted.

---

#### [↑ back to contents](#contents)

<a id="loader-option-preprocessor-options-handlebars" name="loader-option-preprocessor-options-handlebars"></a>

#### Options for `preprocessor: 'handlebars'`

The `preprocessor` has built-in `include` helper, to load a partial file directly in a template without registration of partials.

The `include` helper has the following _de facto_ standard options:

```js
{
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
{{ include 'menu/top/desktop' }}
{{ include 'menu/nav' }}
{{ include 'teaser' }}
{{ include 'footer' }}
```

The `include` helper automatically resolves `.html` and `.hbs` extensions, it can be omitted.

**The `runtime` option**

The path to the handlebars runtime library. The path can be absolute or relative to `node_modules` directory.
Defaults runtime file is `handlebars/runtime`.
This options is used only by import templates in JavaScript, in [compile mode](#compile-mode).

**The `partials` option**

Type: `Array<string>|Object` Default: `[]`

If you use the partials syntax `{{> footer }}` to include a file, then use the `partials` option.
Partials will be auto-detected in paths recursively and registered under their relative paths, without an extension.

```js
{
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
{
  preprocessor: 'handlebars',
    preprocessorOptions: {
    // define partials manually
    partials: {
      teaser: path.join(__dirname, 'src/views/includes/teaser.html'),
      gallery: path.join(__dirname, 'src/views/includes/gallery.html'),
      footer: path.join(__dirname, 'src/views/partials/footer.html'),
      'menu/nav': path.join(__dirname, 'src/views/partials/menu/nav.html'),
      'menu/top/desktop': path.join(__dirname, 'src/views/partials/menu/top/desktop.html'),
    },
  },
},
```

Include the partials in the `src/views/page/home.html` template:

```html
{{> menu/top/desktop }}
{{> menu/nav }}
{{> teaser }}
{{> gallery }}
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
{
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
{{#bold}}The bold text.{{/bold}} {{#italic}}The italic text.{{/italic}}

<!-- the helper with namespace `wrapper/span` -->
{{#[wrapper/span]}}The text wrapped with span tag.{{/[wrapper/span]}}
```

> ℹ️ **Note**
>
> - The helper located in a subdirectory, e.g. `wrapper/span.js` will be available in template as `[wrapper/span]`.
> - When helper name contain the `/` slash, then the helper name must be wrapped with the `[]`.

You can define helpers manually using `name: function` object:

```js
{
  preprocessor: 'handlebars',
  preprocessorOptions: {
    // define helpers manually
    helpers: {
      bold: (options) => new Handlebars.SafeString(`<strong>${options.fn(this)}</strong>`),
    },
  },
},
```

This plugin has own `build-in` helpers:

- `include` - includes a template file relative to paths defined in `views` option, the default path is the project root path
  ```hbs
  {{include 'TEMPLATE_FILE'}}
  ```
- `assign` - creates a new named variable or override old.
  You can define many variables. The variables are available in included partials.

  ```hbs
  {{assign title='Homepage' header='Home'}}
  {{> layout}}
  ```

  _layout.hbs_

  ```hbs
  <title>{{title}}</title>
  <h1>{{header}}</h1>
  ```

- `partial` and `block`:

  `partial` - defines the block content

  ```hbs
  {{#partial 'BLOCK_NAME'}}BLOCK_CONTENT{{/partial}}
  ```

  `block` - outputs the block content, it can be used in another partial file, e.g. in a layout partial

  ```hbs
  {{#block 'BLOCK_NAME'}}default content or empty{{/block}}
  ```

For the complete list of Handlebars `compile` options see [here](https://handlebarsjs.com/api-reference/compilation.html).

---

#### [↑ back to contents](#contents)


<a id="loader-option-preprocessor-options-tempura" name="loader-option-preprocessor-options-tempura"></a>

#### Options for `preprocessor: 'tempura'`

[Tempura](https://github.com/lukeed/tempura) is a light and fast template engine with Handlebars-like syntax.

The preprocessor has built-in `include` helper, to load a partial file.

```js
{
  preprocessor: 'tempura',
  preprocessorOptions: {
    // defaults process.cwd(), root path for includes with an absolute path (e.g., /file.html)
    root: path.join(__dirname, 'src/views/'), // defaults process.cwd()
    // defaults [], an array of paths to use when resolving includes with relative paths
    views: [
      'src/views/includes', // relative path
      path.join(__dirname, 'src/views/partials'), // absolute path
    ],
    blocks: {
      // define here custom helpers
      bar: ({ value }) => `<bar>${value}</bar>`,
    },
  },
},
```

For all available options, see the [Tempura API options](https://github.com/lukeed/tempura/blob/master/docs/api.md#options-2).

**Using build-in `include` helper.**

The `src` attribute contains a path to the partial file.

The path relative to current working directory (defaults webpack config directory):

```hbs
{{#include src='src/views/partials/header.hbs' }}
```

The path relative to directory defined in `root` option, e.g. `root: 'src/view'`:
```hbs
{{#include src='partials/header.hbs' }}
```

The path relative to one of directories defined in `views` option, e.g. `views: ['src/views/partials']`:
```hbs
{{#include src='header.hbs' }}
```

---

#### [↑ back to contents](#contents)

<a id="loader-option-preprocessor-options-nunjucks" name="loader-option-preprocessor-options-nunjucks"></a>

#### Options for `preprocessor: 'nunjucks'`

```js
{
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

For all available options, see the [Nunjucks API configure](https://mozilla.github.io/nunjucks/api.html#configure).

---

#### [↑ back to contents](#contents)

<a id="loader-option-preprocessor-options-pug" name="loader-option-preprocessor-options-pug"></a>

#### Options for `preprocessor: 'pug'`

> ℹ️ **Note**
>
> The `pug` preprocessor based on the [@webdiscus/pug-loader](https://github.com/webdiscus/pug-loader) source code
> and has the same options and features.

```js
{
  preprocessor: 'pug',
  preprocessorOptions: {
    // in 99.9% of common use cases you don't need any pug options

    // available useful embedded filters
    embedFilters: {
      // enable the `:escape` filter
      escape: true,

      // enable the `:code` filter
      code: {
        className: 'language-', // class name of `<code>` tag
      },

      // enable `:highlight` filter
      highlight: {
        use: 'prismjs', // use the `prismjs` module as highlighter, must be installed
        verbose: true,
      },

      // enable `:markdown` filter for markdown only, w/o code blocks
      markdown: true,
      // - OR - you can enable highlighter for code blocks used in markdown
      markdown: {
        highlight: {
          use: 'prismjs', // use the `prismjs` module as highlighter, must be installed
          verbose: true,
        },
      },
    }
  },
},
```

See the [documentation and examples](https://webdiscus.github.io/pug-loader/pug-filters/) for the `embedded filters`.\
See the [pug compiler options](https://pugjs.org/api/reference.html).

---

#### [↑ back to contents](#contents)

<a id="loader-option-preprocessor-options-twig" name="loader-option-preprocessor-options-twig"></a>

#### Options for `preprocessor: 'twig'`

The [TwigJS](https://github.com/twigjs/twig.js) have few useful options:

- `async {boolean}` defaults is `'false'`.
- `autoescape {boolean}` defaults is `'false'`. Escape dangerous characters.
- `namespaces {Object}` defaults is `{}`.\
  The key is a namespace (like Webpack alias) used in the template instead a relative path.\
  The value is an absolute a path relative to the project directory.

```js
{
  preprocessor: 'twig',
  preprocessorOptions: {
    async: false,
    autoescape: false,
    namespaces: {
      layouts: 'src/views/layouts',
      partials: 'src/views/partials',
    },
  },
},
```

The used namespace must begin with the leading `@` symbol:

```html
{% extends "@layouts/default.twig" %}
{% include "@partials/articles/sidebar.twig" %}
```

You can use a relative path:
```html
{% extends "../layouts/default.twig" %}
{% include "../partials/articles/sidebar.twig" %}
```

> ⚠️ **Warning**
>
> The dynamic including is not supported.\
> For example, passing `myTemplate` as a parameter does not work:
> ```html
> {# page.twig #}
> {% extends myTemplate %}
> ```

> ⚠️ **Warning**
>
> The Twig template containing `tabs` will not be compiled into HTML.\
> Use the `spaces` as an indent in templates.
> The `tabs` are not supported by `TwigJS`.


---

#### [↑ back to contents](#contents)

<a id="loader-option-data" name="loader-option-data"></a>

### `data`

Type: `Object|string` Default: `{}`

> Since `v2.5.0` the `data` option is referenced in the [plugin options](#option-data).

The properties of the `data` option are available as global variables in all templates.
To pass variables to a specific template, use the [entry.{name}.data](#option-entry-data) option.

#### Data as an object

Type: `Object`

The data defined as an object are loaded once with Webpack start.

#### Data as file path

Type: `string`

The string value is an absolute or relative filename of a JSON or JS file. The JS file must export an object.
The data file will be reloaded after changes.

> ℹ️ **Note**
>
> Use the `data` as a path to dynamically update variables in a template **without restarting Webpack**.

> ⚠️ **Warning**
>
> The [entry.{name}.data](#option-entry-data) property overrides the same property defined in the loader `data`.

For example, there are variables defined in both the `entry` property and the plugin option:

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
      data: {
        // global variables for all pages
        title: 'Default Title',
        globalData: 'Global Data',
      },
      // - OR -
      data: 'src/data/global.js',
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
};
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

<a id="template-engine" name="template-engine"></a>

## Template engines

Using the [preprocessor](#loader-option-preprocessor), you can compile any template with a template engine such as:

- [Eta](https://eta.js.org)
- [EJS](https://ejs.co)
- [Handlebars](https://handlebarsjs.com)
- [LiquidJS](https://github.com/harttle/liquidjs)
- [Mustache](https://github.com/janl/mustache.js)
- [Nunjucks](https://mozilla.github.io/nunjucks/)
- [Pug](https://pugjs.org)
- [Tempura](https://github.com/lukeed/tempura)
- [TwigJS](https://github.com/twigjs/twig.js)

<!--
> ℹ️ **Note**
>
> For Pug templates use the [pug-plugin](https://github.com/webdiscus/pug-plugin).
> This plugin works on the same codebase but has additional Pug-specific options and features.
-->

<a id="using-template-eta" name="using-template-eta"></a>

### Using the Eta

_Supported "out of the box"_

`Eta` is [compatible\*](#eta-compatibilty-with-ejs) with `EJS` syntax, is smaller and faster than `EJS`.

For example, there is the template _src/views/page/index.eta_

```html
<html>
  <body>
    <h1><%= headline %></h1>
    <ul class="people">
      <% for (let i = 0; i < people.length; i++) {%>
      <li><%= people[i] %></li>
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
        index: {
          // output dist/index.html
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
  entry: {
    index: './src/views/page/index.eta',
  },
  // preprocessor: 'eta', // defaults is used Eta
  // preprocessorOptions: {...},
});
```

See the [`eta` preprocessor options](#loader-option-preprocessor-options-eta).

<a id="eta-compatibilty-with-ejs" name="eta-compatibilty-with-ejs"></a>

> ⚠️ **Warning**
>
> For compatibility the Eta compiler with the EJS templates, the default preprocessor use the `useWith: true` Eta option
> to use variables in template without the Eta-specific `it.` scope.

#### [↑ back to contents](#contents)

<a id="using-template-ejs" name="using-template-ejs"></a>

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
      <li><%= people[i] %></li>
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
        index: {
          // output dist/index.html
          import: './src/views/page/index.ejs',
          data: {
            headline: 'Breaking Bad',
            people: ['Walter White', 'Jesse Pinkman'],
          },
        },
      },
      preprocessor: 'ejs', // use EJS templating engine
      // preprocessorOptions: {...},
    }),
  ],
};
```

See the [`ejs` preprocessor options](#loader-option-preprocessor-options-ejs).

#### [↑ back to contents](#contents)

<a id="using-template-handlebars" name="using-template-handlebars"></a>

### Using the Handlebars

You need to install the `handlebars` package:

```
npm i -D handlebars
```

For example, there is the template _src/views/page/home.hbs_

```hbs
<!DOCTYPE html>
<html>
<head>
  <title>{{ title }}</title>
</head>
<body>
  {{> header }}
  <div class="container">
    <h1>Handlebars</h1>
    <div>{{ arraySize persons }} persons:</div>
    <ul class="person">
      {{#each persons}}
        {{> person person=.}}
      {{/each}}
    </ul>
  </div>
  {{> footer }}
</body>
</html>
```

Where the `{{> header }}`, `{{> person person=.}}` and `{{> footer }}` are partials.

Define the `preprocessor` as `handlebars`:

```js
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        // define templates here
        index: {
          import: 'src/views/pages/home.hbs', // => dist/index.html
          // pass data to template as an object
          // data: { title: 'Handlebars', persons: [...] },
          // OR define the data file
          data: 'src/views/pages/homeData.js',
        },
      },
      // use handlebars templating engine
      preprocessor: 'handlebars',
      // define handlebars options
      preprocessorOptions: {
        partials: ['src/views/partials'],
        helpers: {
          arraySize: (array) => array.length,
        },
      },
    }),
  ],
};
```

See the [`handlebars` preprocessor options](#loader-option-preprocessor-options-handlebars).

[Source code of the example](https://github.com/webdiscus/html-bundler-webpack-plugin/tree/master/examples/handlebars/)

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/edit/webpack-webpack-js-org-mxbx4t?file=webpack.config.js)

#### [↑ back to contents](#contents)

<a id="using-template-tempura" name="using-template-tempura"></a>

### Using the Tempura

You need to install the `tempura` package:

```
npm i -D tempura
```

For example, there is the template _src/views/page/home.hbs_

```hbs
<!DOCTYPE html>
<html>
<head>
  <title>{{ title }}</title>
</head>
<body>
  {{#include src='header.hbs' }}
  <div class="container">
    <h1>Tempura</h1>
    <div>{{ persons.length }} persons:</div>
    <ul class="person">
      {{#each persons as person}}
        <li>{{person.name}} is {{person.age}} years old.</li>
      {{/each}}
    </ul>
  </div>
  {{#include src='footer.hbs' }}
</body>
</html>
```

Define the `preprocessor` as `tempura`:

```js
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        // define templates here
        index: {
          import: 'src/views/pages/home.hbs', // => dist/index.html
          // pass data to template as an object
          data: {
            title: 'Tempura',
             persons: [
                { name: 'Robert', age: 30 },
                ...
             ],
          },
        },
      },
      // use tempura templating engine
      preprocessor: 'tempura',
      // define options
      preprocessorOptions: {
        views: ['src/views/partials'],
      },
    }),
  ],
};
```

See the [`tempura` preprocessor options](#loader-option-preprocessor-options-tempura).

[Source code of the example](https://github.com/webdiscus/html-bundler-webpack-plugin/tree/master/examples/tempura/)

#### [↑ back to contents](#contents)

<a id="using-template-mustache" name="using-template-mustache"></a>

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
      // define preprocessor as the function that should return a string or promise
      preprocessor: (content, { data }) => Mustache.render(content, data),
    }),
  ],
};
```

#### [↑ back to contents](#contents)

<a id="using-template-nunjucks" name="using-template-nunjucks"></a>

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
      entry: {
        index: {
          import: './src/views/page/index.njk',
          data: {
            headline: 'Breaking Bad',
            people: ['Walter White', 'Jesse Pinkman'],
          },
        },
      },
      preprocessor: 'nunjucks', // use Nunjucks templating engine
      // preprocessorOptions: {...},
    }),
  ],
};
```

See the [`nunjucks` preprocessor options](#loader-option-preprocessor-options-nunjucks).

#### [↑ back to contents](#contents)

<a id="using-template-pug" name="using-template-pug"></a>

### Using the Pug

You need to install the `pug` package:

```
npm i -D pug
```

For example, there is the layout template _src/views/layout/default.pug_

```pug
html
  head
    title= title
    script(src="@scripts/main.js" defer="defer")
  body
    h1= headline
    block content
    include @partials/footer
```

The page template _src/views/pages/home.pug_ can be extended from the layout:

```pug
extends @layouts/default

block content
  ul#people
    each item in people
      li= item
```

Define the `preprocessor` as `pug`:

```js
const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  resolve: {
    alias: {
      '@scripts': path.join(__dirname, 'src/scripts/'), // alias to scripts used in template
      '@layouts': path.join(__dirname, 'src/views/layouts/'), // alias to template layouts
      '@partials': path.join(__dirname, 'src/views/partials/'), // alias to template partials
    },
  },
  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: {
          import: 'src/views/page/home.pug',
          data: {
            title: 'Strartpage',
            headline: 'Breaking Bad',
            people: ['Walter White', 'Jesse Pinkman'],
          },
        },
      },
      preprocessor: 'pug', // use Pug templating engine
      preprocessorOptions: {
        // Pug options
      },
    }),
  ],
};
```

See the [`pug` options](#loader-option-preprocessor-options-pug).


#### [↑ back to contents](#contents)

<a id="using-template-twig" name="using-template-twig"></a>

### Using the TwigJS

You need to install the `twig` package:

```
npm i -D twig
```

For example, there is the layout template _src/views/layout/default.twig_

```html
<!DOCTYPE html>
<html>
  <head>
    <title>{{ title }}</title>
    <script src="@scripts/main.js" defer="defer"></script>
  </head>
  <body>
    <h1>{{ headline }}!</h1>
    <div id="content">{% block content %}{% content %}</div>
    {% include "@partials/footer.twig" %}
  </body>
</html>
```

The page template _src/views/pages/home.twig_ can be extended from the layout:

```html
{% extends '@layouts/default.twig' %}

{% block content %}
  <ul id="people">
    {% for item in people %}
        <li>{{ item }}</li>
    {% endfor %}
  </ul>
{% endblock %}
```

Define the `preprocessor` as `twig`:

```js
const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  resolve: {
    alias: {
      '@scripts': path.join(__dirname, 'src/scripts/'), // alias to scripts used in template
    },
  },
  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: {
          import: 'src/views/page/home.twig',
          data: {
            title: 'Strartpage',
            headline: 'Breaking Bad',
            people: ['Walter White', 'Jesse Pinkman'],
          },
        },
      },
      preprocessor: 'twig', // use TwigJS templating engine
      preprocessorOptions: {
        // aliases used for extends/include
        namespaces: {
          layouts: 'src/views/layout/',
          partials: 'src/views/partials/',
        },
      },
    }),
  ],
};
```

See the [`twig` preprocessor options](#loader-option-preprocessor-options-twig).


#### [↑ back to contents](#contents)

<a id="using-template-liquidjs" name="using-template-liquidjs"></a>

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
      // async parseAndRender method return the promise
      preprocessor: (content, { data }) => LiquidEngine.parseAndRender(content, data),
    }),
  ],
};
```
---

#### [↑ back to contents](#contents)

<a id="template-in-js" name="template-in-js"></a>

## Using template in JavaScript

The [preprocessor](#loader-option-preprocessor) works in two modes: `render` and `compile`.

### Render mode

The `render` is the default mode for the template defined in the [entry](#option-entry) option.
The rendered template is an HTML string, which is saved as an HTML file.

You can import the template file as a generated HTML string in JS using the `?render` query.
To pass simple variables into the imported template you can use query parameters, e.g.: `?render&name=Arnold&age=25`.
To pass complex variables such as an array or an object use the global [data](#option-data) option.

> ℹ️ **Note**
>
> At runtime in JavaScript will be used the already rendered HTML from the template.

For example:

```js
import html from './partials/star-button.html?render&buttonText=Star';

document.getElementById('star-button').innerHTML = html;
```

_./partials/star-button.html_
```html
<button class="btn-star">
  <!-- you can use a source image file with webpack alias,
       in the bundle it will be auto replaced with the output asset filename -->
  <img src="@images/star.svg">
  <!-- the `buttonText` variable is passed via query -->
  <span><%= buttonText %></span>
</button>
```

<a id="compile-mode" name="compile-mode"></a>

### Compile mode

The `compile` is the default mode for the template imported in JavaScript file.
The compiled template is a template function,
which can be executed with passed variables in the runtime on the client-side in the browser.

For example:

```js
import tmpl from './partials/people.ejs';

// template variables
const locals = {
  people: [
    'Walter White',
    'Jesse Pinkman',
  ],
};

// render template function with variables in browser
document.getElementById('people').innerHTML = tmpl(locals);
```

_./partials/people.ejs_
```html
<!-- you can use a source image file with webpack alias,
     in the bundle it will be auto replaced with the output asset filename -->
<img src="@images/people.png">
<ul class="people">
  <% for (let i = 0; i < people.length; i++) {%>
  <li><%= people[i] %></li>
  <% } %>
</ul>
```

> ⚠️ **Warning**
>
> Not all template engines can generate a template function that can be executed with local variables at runtime.

#### Template engines that do support the `template function` on client-side

- [eta](#loader-option-preprocessor-options-eta) - generates a template function with runtime (~3KB)\
  `include` is supported
- [ejs](#loader-option-preprocessor-options-ejs) - generates a fast smallest pure template function w/o runtime (**recommended** for use on client-side)\
  `include` is supported
- [handlebars](#loader-option-preprocessor-options-handlebars) - generates a precompiled template with runtime (~18KB)\
  `include` is supported
- [nunjucks](#loader-option-preprocessor-options-nunjucks) - generates a precompiled template with runtime (~41KB)\
  `include` is supported
- [twig](#loader-option-preprocessor-options-nunjucks) - generates a precompiled template with runtime (~110KB)\
  `include` is supported
- [pug](#loader-option-preprocessor-options-pug) - generates a small pure template function

#### Template engines that do NOT support the `template function` on client-side

- LiquidJS

---

#### [↑ back to contents](#contents)

<a id="setup-live-reload" name="setup-live-reload"></a>

## Setup Live Reload

To enable reloading of the browser after changes, add the `devServer` option to the Webpack config:

```js
module.exports = {
  // enable live reload
  devServer: {
    static: path.join(__dirname, 'dist'),
    watchFiles: {
      paths: ['src/**/*.*'],
      options: {
        usePolling: true,
      },
    },
  },
};
```

> ⚠️ **Warning**
>
> If you don't have a referenced source script file in HTML, then set the [hotUpdate](#option-hot-update) option to `true` to enable live reload.
> Besides, the `devServer.hot` must be `true` (defaults).
>


---

#### [↑ back to contents](#contents)

<a id="recipe-keep-folder-structure-html" name="recipe-keep-folder-structure-html"></a>

## How to keep source directory structure for HTML

Define the `entry` option as a path to templates. The output path will have the same directory structure.
For details, see the [entry path](#option-entry-path).

#### [↑ back to contents](#contents)

<a id="recipe-keep-folder-structure-assets" name="recipe-keep-folder-structure-assets"></a>

## How to keep source directory structure for assets

Define the `filename` as a function.

For example, we want to keep original directory structure for fonts, which can be in the source or in the `node_modules` directory:

```
node_modules/material-icons/iconfont/material-icons-sharp.woff2
node_modules/material-symbols/material-symbols-sharp.woff2
src/assets/fonts/Roboto/Roboto-Regular.woff2
```

Use the following function:

```js
{
  test: /[\\/]fonts|node_modules[\\/].+(woff(2)?|ttf|otf|eot|svg)$/i,
    type: 'asset/resource',
    generator: {
    // keep original directory structure
    filename: ({ filename }) => {
      const srcPath = 'src/assets/fonts';
      const regExp = new RegExp(`[\\\\/]?(?:${path.normalize(srcPath)}|node_modules)[\\\\/](.+?)$`);
      const assetPath = path.dirname(regExp.exec(filename)[1].replace('@', '').replace(/\\/g, '/'));

      return `fonts/${assetPath}/[name][ext][query]`;
    },
  },
},
```

The destructed `filename` argument of the function is a source file. It can be absolute or relative.

The output directory `dist/` will have the same structure:

```
dist/fonts/material-icons/iconfont/material-icons-sharp.woff2
dist/fonts/material-symbols/material-symbols-sharp.woff2
dist/fonts/Roboto/Roboto-Regular.woff2
```

The example to keep original directory structure for images:

```js
{
  test: /[\\/]images|node_modules[\\/].+(png|jpe?g|webp|ico|svg)$/i,
    type: 'asset/resource',
    generator: {
    // keep original directory structure
    filename: ({ filename }) => {
      const srcPath = 'src/assets/images';
      const regExp = new RegExp(`[\\\\/]?(?:${path.normalize(srcPath)}|node_modules)[\\\\/](.+?)$`);
      const assetPath = path.dirname(regExp.exec(filename)[1].replace('@', '').replace(/\\/g, '/'));

      return `images/${assetPath}/[name].[hash:8][ext]`;
    },
  },
},
```

> ℹ️ **Note**
>
> For images, it is recommended to use the hashed output filename.

#### [↑ back to contents](#contents)

<a id="recipe-use-images-in-html" name="recipe-use-images-in-html"></a>

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
    <img src="./apple.png" srcset="./apple1.png 320w, ./apple2.png 640w" alt="apple" />
    <picture>
      <source srcset="./fig1.jpg, ./fig2.jpg 320w, ./fig3.jpg 640w" />
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
    <img
      src="/assets/img/apple.f4b855d8.png"
      srcset="/assets/img/apple1.855f4bd8.png 320w, /assets/img/apple2.d8f4b855.png 640w"
      alt="apple" />
    <picture>
      <source
        srcset="
          /assets/img/fig1.605e4dd8.jpg,
          /assets/img/fig2.8605e4dd.jpg 320w,
          /assets/img/fig3.e4605dd8.jpg 640w
        " />
    </picture>
  </body>
</html>
```

---

#### [↑ back to contents](#contents)

<a id="recipe-responsive-images" name="recipe-responsive-images"></a>

## How to resize and generate responsive images

To resize or generate responsive images is recommended to use the [responsive-loader](https://github.com/dazuaz/responsive-loader).

Install additional packages:

```
npm i -D responsive-loader sharp
```

To resize an image use the query parameter `size`:

```html
<!-- resize source image to max. 640px -->
<img src="./image.png?size=640" />
```

To generate responsible images use in `srcset` attribute the query parameter `sizes` als `JSON5` to avoid parsing error,
because many images must be separated by commas `,` but we use the comma to separate sizes for one image:

```html
<!-- responsible images with different sizes: 320px, 480px, 640px -->
<img src="./image.png?size=480" srcset="./image.png?{sizes:[320,480,640]}" />
```

You can convert source image to other output format.
For example, we have original image 2000px width as PNG and want to resize to 640px and save as WEBP:

```html
<img src="./image.png?size=640&format=webp" />
```

You can create a small inline image placeholder. To do this, use the following query parameters:

- `placeholder=true` - enable to generate the placeholder
- `placeholderSize=35` - the size of the generating placeholder
- `prop=placeholder` - the plugin-specific `prop` parameter retrieves the property from the object generated by `responsive-loader`

```html
<img
  src="./image.png?placeholder=true&placeholderSize=35&prop=placeholder"
  srcset="./image.png?{sizes:[320,480,640]}" />
```

The generated HTML:

```html
<img
  src="data:image/png;base64,iVBORw0K ..."
  srcset="/img/image-320w.png 320w, /img/image-480w.png 480w, /img/image-640w.png 640w" />
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

<a id="recipe-preload-fonts" name="recipe-preload-fonts"></a>

## How to preload fonts

To preload resources such as fonts, use the [preload](#option-preload) plugin option.

For example, there is the style used a font that should be preloaded:

_styles.scss_

```scss
@font-face {
  font-family: 'MyFont';
  // load source fonts using the `@fonts` Webpack alias to the font directory
  src:
    local(MyFont Regular),
    url('@fonts/myfont.woff2') format('woff2'),
    url('@fonts/myfont.woff') format('woff');
}

body {
  font-family: 'MyFont', serif;
}
```

The template _index.html_ where is loaded the source style:

```html
<html>
  <head>
    <title>Demo</title>
    <!-- include source style -->
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
          attributes: { as: 'font' },
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

> ℹ️ **Note**
>
> Font preloading requires the `crossorigin` attribute to be set.
> See [font preload](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/preload#what_types_of_content_can_be_preloaded).

The generated HTML contains the preload tag with the font:

```html
<html>
  <head>
    <title>Demo</title>
    <!-- preload fonts detected in style -->
    <link rel="preload" href="fonts/myfont.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="fonts/myfont.woff" as="font" type="font/woff" crossorigin />
    <!-- compiled style -->
    <link href="css/style.1f4faaff.css" rel="stylesheet" />
  </head>
  <body>
    <h1>Hello World!</h1>
  </body>
</html>
```

> ℹ️ **Note**
>
> You don't need a plugin to copy files from source directory to public.
> All source fonts will be coped to output directory automatically.

---

#### [↑ back to contents](#contents)

<a id="recipe-inline-css" name="recipe-inline-css"></a>

## How to inline CSS in HTML

There are two ways to inline CSS in HTML:

- inline all CSS globally with `css.inline` [option](#option-css)
- inline single CSS with `?inline` query added to a filename

The `inline` option can take the following values: `false`, `true` and `'auto'`.
For details see the [inline option](#option-css).

> ℹ️ **Note**
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

_styles.scss_:

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
        // adds CSS to the DOM by injecting a `<style>` tag
        inline: true,
        // output filename of extracted CSS, used if inline is false
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
      body {
        background-color: steelblue;
      }
    </style>
    <style>
      h1 {
        color: red;
      }
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
    <link href="/css/main.05e4dd86.css" rel="stylesheet" />
    <!-- inline CSS -->
    <style>
      h1 {
        color: red;
      }
    </style>
  </head>
  <body>
    <h1>Hello World!</h1>
  </body>
</html>
```

> ℹ️ **Note**
>
> To enable the source map in inline CSS set the Webpack option [`devtool`](https://webpack.js.org/configuration/devtool/#devtool).

---

#### [↑ back to contents](#contents)

<a id="recipe-inline-js" name="recipe-inline-js"></a>

## How to inline JS in HTML

There are two ways to inline CSS in HTML:

- inline all JS globally with `js.inline` [option](#option-js)
- inline single JS with `?inline` query added to a filename

The `inline` option can take the following values: `false`, `true` and `'auto'`.
For details see the [inline option](#option-js).

> ℹ️ **Note**
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
        // adds JavaScript to the DOM by injecting a `<script>` tag
        inline: true,
        // output filename of compiled JavaScript, used if inline is false
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
      (() => {
        'use strict';
        console.log('>> main.js');
      })();
    </script>
  </head>
  <body>
    <h1>Hello World!</h1>
    <script>
      (() => {
        'use strict';
        console.log('>> script.js');
      })();
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
    <script src="js/main.992ba657.js" defer="defer"></script>
    <!-- inline JS -->
    <script>
      (() => {
        'use strict';
        console.log('>> script.js');
      })();
    </script>
  </head>
  <body>
    <h1>Hello World!</h1>
  </body>
</html>
```

> ℹ️ **Note**
>
> If Webpack is started as `serve` or `watch`,
> the inlined JS code will contain additional HMR code.
> Don't worry it is ok, so works Webpack `live reload`.
>
> To enable the source map in inline JS set the Webpack option `devtool`.

---

#### [↑ back to contents](#contents)

<a id="recipe-inline-image" name="recipe-inline-image"></a>

## How to inline SVG, PNG images in HTML

You can inline the images in two ways:

- force inline image using `?inline` query (works in HTML, CSS, [JS](#recipe-import-svg))
- auto inline by image size

Add to Webpack config the rule:

```js
module: {
  rules: [
    {
      test: /\.(png|jpe?g|svg|webp|ico)$/i,
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
    },
  ],
}
```

The plugin automatically inlines images smaller then `maxSize`.

---

#### [↑ back to contents](#contents)

<a id="recipe-import-svg" name="recipe-import-svg"></a>

## How to import SVG in JS

You don't need the [svg-url-loader](https://github.com/bhovhannes/svg-url-loader) anymore.
If you use it yet, remove this legacy loader from your configuration.
Since Webpack 5, you can use the native Webpack [Asset Modules](https://webpack.js.org/guides/asset-modules/),
which are supported by the Bundler Plugin.

#### Replacement of svg-url-loader options

- [encoding](https://github.com/bhovhannes/svg-url-loader#encoding) - Use the `?inline` or `?inline=base64` query.
- [prefix]() - Use the [output filename](https://webpack.js.org/guides/asset-modules/#custom-output-filename) option.
- [limit](https://github.com/bhovhannes/svg-url-loader#limit) - Use the [Rule.parser.dataUrlCondition](https://webpack.js.org/configuration/module/#ruleparserdataurlcondition) option.
- [iesafe](https://github.com/bhovhannes/svg-url-loader#iesafe) - The same as by `limit` using `Rule.parser.dataUrlCondition.maxSize = 4096`.
- [stripdeclarations](https://github.com/bhovhannes/svg-url-loader#stripdeclarations) - we wan't manipulate the SVG content, may be useful to read by [svgo](https://github.com/svg/svgo/issues/836).\
  Anyway [In XML 1.1, the declaration is mandatory](https://stackoverflow.com/a/7007781/1696030), therefore this option is senseless.


To handle SVG files define the module configuration:

```js
module: {
  rules: [
    {
      test: /\.svg/i,
      type: 'asset/resource',
      generator: {
        filename: 'img/[name].[hash:8][ext]',
      },
    },
  ],
}
```

### Import SVG file as output filename.

Using the module configuration as `asset/resource`, the imported SVG file will contain a output filename.


```js
import file from './image.svg';

console.log(file); // img/image.416b7e1d.svg
```

### Import SVG file as data URL.

The Bundler Plugin supports the `?inline` URL query to force load SVG file as a data URL.

> [!NOTE]
> The `inline` query works independent of used module type.

The `inline` query parameter supports values of encoding:
- `utf8` - import SVG as UTF-8 data URL (defaults, can be omitted)
- `base64` - import SVG as base64-encoded data URL

For example, import SVG as UTF-8 data URL:

```js
import file from './image.svg?inline';

console.log(file); // data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2...%3C%2Fsvg%3E
```

To import SVG as base64-encoded data URL, use the `?inline=base64` query.

```js
import file from './image.svg?inline=base64';

console.log(file); // data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDo...vc3ZnPgo=
```

### Manual import SVG in JS with different ways

For example, you need:

- by default, the output filename will be generated
- using the `?dataurl` custom query, the base64-encoded data URL will be generated
- using the `?raw` custom query, the source code of the SVG file will be loaded


Combine all your use cases in the Webpack configuration with `oneOf`:

```js
module: {
  rules: [
    {
      test: /\.svg/i,
      oneOf: [
        // import SVG in JS as data URL using the `?dataurl` custom query
        {
          resourceQuery: /dataurl/,
          type: 'asset/inline',
        },
        // import SVG in JS as raw content using `?raw` custom query
        {
          resourceQuery: /raw/,
          type: 'asset/source',
        },
        // fallback to default behavior:
        // import SVG in JS as output filename
        {
          type: 'asset/resource',
          generator: {
            filename: 'img/[name].[hash:8][ext]',
            dataUrl: {
              // encoding values:
              // 'base64' - generates base64-encoded data URL (Webpack defaults)
              // false    - generates UTF-8 data URL, use it only for SVG
              encoding: false,
            },
          },
        },
      ],
    },
  ],
},
```

Now you can import SVG with different ways in one JS file.

```js
import svgFilename from './image.svg'; // import as output filename
import svgDataUrl from './image.svg?dataurl'; // import as data URL
import svgSource from './image.svg?raw'; // import as source code

console.log(svgFilename); // img/image.416b7e1d.svg
console.log(svgDataUrl);  // data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDo...vc3ZnPgo=
console.log(svgSource);   // <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960">...</svg>
```

See the [test case](https://github.com/webdiscus/html-bundler-webpack-plugin/tree/master/test/cases/js-import-image-svg) as working example.

---

#### [↑ back to contents](#contents)

<a id="recipe-inline-all-assets-to-html" name="recipe-inline-all-assets-to-html"></a>

## How to inline all resources into single HTML file

The bundler plugin can generate a single HTML file included all embedded dependencies
such as JS, CSS, fonts, images (PNG, SVG, etc..).

The fonts and images used in CSS will be inlined into CSS.
The generated CSS including inlined images will be inlined into HTML.

Just use the following config:

```js
const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',
  output: {
    path: path.join(__dirname, 'dist/'),
  },
  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/views/index.html',
      },
      css: {
        inline: true, // inline CSS into HTML
      },
      js: {
        inline: true, // inline JS into HTML
      },
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(css|sass|scss)$/,
        use: ['css-loader', 'sass-loader'],
      },
      // inline all assets: images, svg, fonts
      {
        test: /\.(png|jpe?g|webp|svg|woff2?)$/i,
        type: 'asset/inline',
      },
    ],
  },
  performance: false, // disable warning max size
};
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/edit/inline-all-assets-to-html?file=README.md)

---

#### [↑ back to contents](#contents)

<a id="recipe-resolve-attr-json" name="recipe-resolve-attr-json"></a>

## How to resolve source assets in an attribute containing JSON value

For example, source images should be defined in the custom `data-image` attribute of the `a` tag:

```html
<a data-image='{ "imgSrc": "./pic1.png", "bgImgSrc": "./pic2.png" }' href="#" >
  ...
</a>
```

To resolve such files, just use the `require()` function:

```html
<a data-image='{ "imgSrc": require("./pic1.png"), "bgImgSrc": require("./pic2.png") }' href="#" >
  ...
</a>
```

Add to `sources` loader option the `data-image` attribute for the `a` tag:

```js
new HtmlBundlerPlugin({
  entry: {
    index: './src/index.html',
  },
  loaderOptions: {
    sources: [
      {
        tag: 'a',                   // <= specify the 'a' tag
        attributes: ['data-image'], // <= specify custom attribute for the 'a' tag
      },
    ],
  },
}),
```

The custom attribute will contains in the generated HTML the resolved output assets filenames:

```html
<a data-image='{ "imgSrc": "img/pic1.da3e3cc9.png", "bgImgSrc": "img/pic2.e3cc9da3.png" }' href="#" >
  ...
</a>
```

---

#### [↑ back to contents](#contents)

<a id="recipe-resolve-attr-style-url" name="recipe-resolve-attr-style-url"></a>

## How to resolve source image in the `style` attribute

For example, there is the source image file defined in the `style` attribute as the background of the `div` tag:

```html
<div style="background-image: url(./pic1.png);"></div>
```

The source image file can be a file relative to the template or you can use a webpack alias to the image directory.

> ℹ️ **Note**
>
> This is BAD practice. Use it only in special cases.
> The background image should be defined in CSS.

By default, the `style` attribute is not parsed and therefore needs to be configured:

```js
new HtmlBundlerPlugin({
  entry: {
    index: './src/index.html',
  },
  loaderOptions: {
    sources: [
      {
        tag: 'div',            // <= specify the tag where should be parsed style
        attributes: ['style'], // <= specify the style attribute
      },
    ],
  },
}),
```

The plugin resolves the `url()` value and replaces it in the generated HTML with the output filename:
```html
<div style="background-image: url(assets/img/pic1.d4711676.png);"></div>
```

---

#### [↑ back to contents](#contents)

<a id="recipe-resolve-attr-href-a-image" name="recipe-resolve-attr-href-a-image"></a>

## How to resolve source image in `<a href="image.jpg">`

For example, you want to link a small image as a preview to open the full-size image in a new tab or pop-up window.

A typical example:

```html
<!-- href contains HTML file -->
<a href="index.html">home</a> | <a href="about.html">about</a>

<!-- href contains image file, which should be resolved -->
<a href="./images/cat-fullsize.jpg" target="_blank">
   <img src="./images/cat-preview.jpg" />
</a>
```

To resolve images in the `href` attribute of a tag, just enable it using the [loaderOptions.sources](#loader-option-sources) option.

```js
loaderOptions: {
  sources: [
    {
      tag: 'a',
      attributes: ['href'],
    },
  ],
},
```

**Problem by resolving**

All `href` attributes of all `<a>` tags will now be resolved,
which could cause an error if the `href` contained an HTML file, e.g. `<a href="index.html">`.

**Solution**

Use the [filter](#loader-option-sources-filter) function to avoid resolving non-image files.

```js
loaderOptions: {
  sources: [
    {
      tag: 'a',
      attributes: ['href'],
      filter: ({ value }) => !value.endsWith('.html'), // return false to ignore *.html files
    },
  ],
},
```

---


#### [↑ back to contents](#contents)

<a id="recipe-dynamic-load-css" name="recipe-dynamic-load-css"></a>

## How to load CSS file dynamically

For dynamic file loading, we need the output filename of extracted CSS from a source style file.
To get the CSS output filename in JavaScript, you can use the `url` query:
```js
import cssUrl from './style.scss?url';
// - OR -
const cssUrl = require('./style.scss?url');
```
Where the `./style.scss` is the source SCSS file relative to the JavaScript file.

To load a CSS file dynamically, you can use following function:
```js
import cssUrl from './style.scss?url';

function loadCSS(url) {
  const style = document.createElement('link');
  style.href = url;
  style.rel = 'stylesheet';
  document.head.appendChild(style);
}

loadCSS(cssUrl);
```

The CSS will be extracted into separate file and the `cssUrl` variable will contains the CSS output filename.

Since 2023, many browsers support the modern way to add the stylesheets into DOM without creating the `link` tag.

```js
import cssUrl from './style.scss?url';

async function loadCSS(url) {
  const response = await fetch(url);
  const css = await response.text();
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(css);
  document.adoptedStyleSheets = [sheet];
}

loadCSS(cssUrl);
```

See the [browser compatibility](https://developer.mozilla.org/en-US/docs/Web/API/Document/adoptedStyleSheets#browser_compatibility).

---

#### [↑ back to contents](#contents)

<a id="recipe-css-modules" name="recipe-css-modules"></a>

## How to import CSS class names in JS

**Required:** `css-loader >= 7.0.0`

To import style `class names` in JS, add in the webpack config the [modules](https://github.com/webpack-contrib/css-loader#modules) option into `css-loader`:
```js
{
  test: /\.(css)$/,
  use: [
    {
      loader: 'css-loader',
      options: {
        modules: {
          localIdentName: '[name]__[local]--[hash:base64:5]',
          exportLocalsConvention: 'camelCase',
        },
      },
    },
  ],
},
```

For example there is _./style.css_ file:
```css
.error-message {
  color: red;
}
```

In _./main.js_ file you can use the class name with `camelCase`:
```js
import styles from './style.css';

element.innerHTML = `<div class="${styles.errorMessage}">`;
```

The imported `styles` object contains generated class names like followings:
```js
{
  errorMessage: 'main__error-message--gvFM4',
}
```

Read more information about [CSS Modules](https://github.com/css-modules/css-modules).

---

#### [↑ back to contents](#contents)

<a id="recipe-css-style-sheet" name="recipe-css-style-sheet"></a>

## How to import CSS stylesheet in JS

Using the `css-loader` option [exportType](https://github.com/webpack-contrib/css-loader?#exporttype) as `css-style-sheet`
you can import the CSS stylesheets as the instance of the [CSSStyleSheet](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet) object.

Import a CSS module script and apply it to a document or a shadow root like this:

```js
import sheet from './style.scss?sheet';

document.adoptedStyleSheets = [sheet];
shadowRoot.adoptedStyleSheets = [sheet];
```

You can use the `?sheet` URL query to import a style file as stylesheets.
The query must be configured in the webpack config:

```js
module.exports = {
  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },
      js: {
        filename: '[name].[contenthash:8].js',
      },
      css: {
        filename: '[name].[contenthash:8].css',
      },
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(s?css)$/,
        oneOf: [
          // Import CSS/SCSS source file as a CSSStyleSheet object
          {
            resourceQuery: /sheet/, // <= the query, e.g. style.scss?sheet
            use: [
              {
                loader: 'css-loader',
                options: {
                  exportType: 'css-style-sheet', // <= define this option
                },
              },
              {
                loader: 'sass-loader',
              },
            ],
          },
          // Import CSS/SCSS source file as a CSS string
          {
            use: [
              'css-loader',
              'sass-loader',
            ],
          }
        ],
      }
    ],
  },
};
```

Using the universal configuration above you can apply CSS stylesheets in JS and extract CSS into separate file or inject CSS into HTML:

```js
import sheet from './style.scss?sheet'; // import as CSSStyleSheet object
import './style2.scss?inline'; // the extracted CSS will be injected into HTML
import './style3.scss'; // the extracted CSS will be saved into separate output file

// apply stylesheet to document and shadow root
document.adoptedStyleSheets = [sheet];
shadowRoot.adoptedStyleSheets = [sheet];
```

This is useful for [custom elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements) and shadow DOM.

More information:

- [Using CSS Module Scripts to import stylesheets](https://web.dev/css-module-scripts/)
- [Constructable Stylesheets: seamless reusable styles](https://developers.google.com/web/updates/2019/02/constructable-stylesheets)

---

#### [↑ back to contents](#contents)


<a id="recipe-load-js-css-from-node-modules" name="recipe-load-js-css-from-node-modules"></a>
## How to load JS and CSS from `node_modules` in template

Some node modules specifies compiled bundle files for the browser in `package.json`.

For example:
- the [material-icons](https://github.com/marella/material-icons/blob/main/package.json) specifies the `browser ready` CSS file.
- the [bootstrap](https://github.com/twbs/bootstrap/blob/main/package.json) specifies the `browser ready` JS and CSS files.

You can use only the module name, the plugin automatically resolves `browser ready` files for script and style:

```html
<html>
<head>
  <!-- plugin resolves the bootstrap/dist/css/bootstrap.css -->
  <link href="bootstrap" rel="stylesheet">
  <!-- plugin resolves the bootstrap/dist/js/bootstrap.js -->
  <script src="bootstrap" defer="defer"></script>
</head>
<body>
  <h1>Hello World!</h1>
</body>
</html>
```

If you need to load a specific version of a file, use the module name and the path to that file:

```html
<html>
<head>
  <link href="bootstrap/dist/css/bootstrap.rtl.css" rel="stylesheet">
  <script src="bootstrap/dist/js/bootstrap.bundle.js" defer="defer"></script>
</head>
<body>
  <h1>Hello World!</h1>
</body>
</html>
```

> ⚠️ **Warning**
>
> Don't use a relative path to `node_modules`, like `../node_modules/bootstrap`. The plugin resolves node module path by the name automatically.

#### [↑ back to contents](#contents)


<a id="recipe-import-style-from-node-modules" name="recipe-import-style-from-node-modules"></a>
## How to import CSS or SCSS from `node_modules` in SCSS

The plugin resolves default style files defined in node_modules automatically.

For example, import source styles of material-icons:

```scss
// import source styles from `material-icons` module
@use 'material-icons';

// define short class name for original `.material-icons-outlined` class name from module
.mat-icon {
  @extend .material-icons-outlined;
}
```

You can import a file from a module using the module name and the path to the file:
```scss
@use 'MODULE_NAME/path/to/style';
```

> ⚠️ **Warning**
>
> The file extension, e.g. .scss, .css, must be omitted.

> ⚠️ **Warning**
>
> Use the `@use` instead of `@import`, because it is [deprecated](https://github.com/sass/sass/blob/main/accepted/module-system.md#timeline).


For example, import the style theme `tomorrow` from the [prismjs](https://github.com/PrismJS/prism) module:
```scss
@use 'prismjs/themes/prism-tomorrow.min';
```

> ⚠️ **Warning**
>
> Don't use [resolve-url-loader](https://github.com/bholloway/resolve-url-loader)!
>
> The HTML bundler plugin resolves styles faster than `resolve-url-loader` and don't requires using the `source map` in `sass-loader` options.

#### [↑ back to contents](#contents)

<a id="recipe-preprocessor-php" name="recipe-preprocessor-php"></a>

## How to process a PHP template (.phtml)

The plugin can replace the source filenames of scripts, styles, images, etc. with their output filenames in a template.

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
        filename: 'js/[name].[contenthash:8].js',
      },
      css: {
        filename: 'css/[name].[contenthash:8].css',
      },
      preprocessor: false, // disable preprocessor
    }),
  ],
};
```

The processed PHP template _dist/index.phtml_:

```php
<?php
  $title = 'Home';
?>
<html>
<head>
  <title><?= $title ?></title>
  <link href="css/style.026fd625.css" rel="stylesheet">
  <script src="js/main.3347618e.js" defer="defer"></script>
</head>
<body>
  <h1>Hello World!</h1>
</body>
</html>
```

---

#### [↑ back to contents](#contents)

<a id="recipe-pass-data-to-templates" name="recipe-pass-data-to-templates"></a>

## How to pass data into multiple templates

You can pass variables into template using a template engine, e.g. [Handlebars](https://handlebarsjs.com).
For multiple page configuration, better to use the [Nunjucks](https://mozilla.github.io/nunjucks) template engine maintained by Mozilla.

For example, you have several pages with variables.\
Both pages have the same layout _src/views/layouts/default.html_

```html
<!doctype html>
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
{% extends "src/views/layouts/default.html" %} {% block styles %}
<!-- include source style -->
<link href="./home.scss" rel="stylesheet" />
{% endblock %} {% block scripts %}
<!-- include source script -->
<script src="./home.js" defer="defer"></script>
{% endblock %} {% block content %}
<h1>{{ filmTitle }}</h1>
<p>Location: {{ location }}</p>
<!-- @images is the Webpack alias for the source images directory -->
<img src="@images/{{ imageFile }}" />
{% endblock %}
```

_src/views/pages/about/index.html_

```html
{% extends "src/views/layouts/default.html" %} {% block styles %}
<link href="./about.scss" rel="stylesheet" />
{% endblock %} {% block scripts %}
<script src="./about.js" defer="defer"></script>
{% endblock %} {% block content %}
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
    imageFile: 'picture.png',
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
        index: {
          // => dist/index.html
          import: 'src/views/pages/home/index.html',
          data: entryData.home,
        },
        about: {
          // => dist/about.html
          import: 'src/views/pages/about/index.html',
          data: entryData.about,
        },
      },
      js: {
        filename: 'js/[name].[contenthash:8].js',
      },
      css: {
        filename: 'css/[name].[contenthash:8].css',
      },
      // the Nunjucks template engine is supported "out of the box"
      preprocessor: 'nunjucks',
      // -OR- use as the function for full controll
      // preprocessor: (content, { data }) => Nunjucks.renderString(content, data),
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
<!doctype html>
<html>
  <head>
    <title>Home</title>
    <link href="css/home.2180238c.css" rel="stylesheet" />
    <script src="js/home.790d746b.js" defer="defer"></script>
  </head>
  <body>
    <main class="main-content">
      <h1>Breaking Bad</h1>
      <p>Breaking Bad is an American crime drama</p>
      <p>Location: Albuquerque, New Mexico</p>
      <img src="assets/img/picture.697ef306.png" alt="location" />
    </main>
  </body>
</html>
```

The generated _dist/about.html_

```html
<!doctype html>
<html>
  <head>
    <title>About</title>
    <link href="css/about.2777c101.css" rel="stylesheet" />
    <script src="js/about.1.c5e03c0e.js" defer="defer"></script>
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

<a id="recipe-diff-templates" name="recipe-diff-templates"></a>

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
            views: [path.join(__dirname, 'src/views/ejs/partials')],
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
            views: [path.join(__dirname, 'src/views/hbs/partials')],
          },
        },
      },
    ],
  },
};
```

---

#### [↑ back to contents](#contents)

<a id="recipe-split-chunks" name="recipe-split-chunks"></a>

### How to configure `splitChunks`

Webpack tries to split every entry file, include template files, which completely breaks the compilation process in the plugin.

To avoid this issue, you must specify which scripts should be split, using `optimization.splitChunks.cacheGroups`:

```diff
module.exports = {
  optimization: {
    splitChunks: {
-     chunks: 'all', // <= DO NOT use this here
      cacheGroups: {
        scripts: {
          test: /\.(js|ts)$/, // <= IMPORTANT: split only script files
+         chunks: 'all', // <= DEFINE it here only
        },
      },
    },
  },
};
```

> ℹ️ **Note**
>
> In the `test` option must be specified all extensions of scripts which should be split.

> ⚠️ **Warning**
>
> DO NOT use the `chunks: 'all'` option globally!
>
> The `splitChunks.chunks: 'all'` option splits all types of chunks, but it make no sense, because we need split only scripts.
> Templates, CSS, images and other assets can't be split.
>
> Define `chunks: 'all'` only in a cache group where is specified the `test` option for your scripts.
>
> ‼️ The `splitChunks.chunks` option will be automatically removed, because some assets can't be resolved or output files may be corrupted!

See details by [splitChunks.cacheGroups](https://webpack.js.org/plugins/split-chunks-plugin/#splitchunkscachegroups).

For example, in a template are used the scripts and styles from `node_modules`:

```html
<html>
  <head>
    <title>Home</title>
    <link href="bootstrap/dist/css/bootstrap.min.css" rel="stylesheet" />
    <script src="bootstrap/dist/js/bootstrap.min.js" defer="defer"></script>
  </head>
  <body>
    <h1>Hello World!</h1>
    <script src="./main.js"></script>
  </body>
</html>
```

> ℹ️ **Note**
>
> In the generated HTML, all script tags remain in their original places, and the split chunks will be added there
> in the order in which Webpack generated them.

In this use case the `optimization.splitChunks.cacheGroups.{cacheGroup}.test` option must match exactly only JS files from `node_modules`:

```js
module.exports = {
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/].+\.(js|ts)$/, // <= IMPORTANT: split only script files
          chunks: 'all', // <= DEFINE it here only
        },
      },
    },
  },
};
```

> ⚠️ **Warning**
>
> If you will to use the `test` as `/[\\/]node_modules[\\/]`, without extension specification,
> then Webpack concatenates JS code together with CSS in one file and Webpack compilation will failed or generate files with a wrong content.
> Webpack can't differentiate CSS module from JS module, therefore you MUST match only JS files.

---

#### [↑ back to contents](#contents)

<a id="recipe-split-chunks-keep-module-name" name="recipe-split-chunks-keep-module-name"></a>

### How to keep package name for split chunks from node_modules

To save split chunks under a custom name use `optimization.splitChunks.cacheGroups.{cacheGroup}.name` as function.

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
    <!-- include source script -->
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
      maxSize: 1000000, // split chunks bigger than 100KB, defaults is 20KB
      cacheGroups: {
        app: {
          test: /\.(js|ts)$/, // <= IMPORTANT: split only script files
          chunks: 'all', // <= define it only in a cache group
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

> ⚠️ **Warning**
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

<a id="recipe-split-css" name="recipe-split-css"></a>

### How to split CSS files

> ⚠️ **Warning**
>
> Splitting CSS to many chunks is principally impossible. Splitting works only for JS files.

Using the bundler plugin, all your style source files should be specified directly in the template.
You can import style files in JavaScript, like it works using the `mini-css-extract-plugin` and `html-webpack-plugin`,
but it is a **bad practice** and processing is **slower**.

You can separate the styles into multiple bundles yourself.

For example, there are style files used in your app:

```
- components/banner/style.scss 150 KB
- components/button/style.scss  50 KB
- components/menu/style.scss    50 KB
- components/modal/style.scss  100 KB
- components/panel/style.scss  100 KB
- styles/main.scss  250 KB
```

We want to have a bundle file ~250 KB, then create the bundles manually:

_styles/bundle01.scss_ 200 KB

```scss
@use '../components/banner/style.scss';
@use '../components/button/style.scss';
```

_styles/bundle02.scss_ 250 KB

```scss
@use '../components/menu/style.scss';
@use '../components/modal/style.scss';
@use '../components/panel/style.scss';
```

Add the bundles in the template:

```html
<html>
  <head>
    <title>Home</title>
    <link href="./styles/bundle01.scss" rel="stylesheet" />
    <link href="./styles/bundle02.scss" rel="stylesheet" />
    <link href="./styles/main.scss" rel="stylesheet" />
  </head>
  <body>
    <h1>Hello World!</h1>
  </body>
</html>
```

If you use vendor styles in your style file, then vendor styles will not be saved to a separate file, because `sass-loader` generates one CSS bundle code.

_styles.scss_

```scss
@use 'bootstrap/scss/bootstrap';
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
    <!-- include module styles -->
    <link href="bootstrap/dist/css/bootstrap.min.css" rel="stylesheet" />
    <!-- include your styles -->
    <link href="./style.scss" rel="stylesheet" />
  </head>
  <body>
    <h1>Hello World!</h1>
    <script src="./main.js"></script>
  </body>
</html>
```

---

#### [↑ back to contents](#contents)


<a id="solutions" name="solutions"></a>

## Problems & Solutions


<a id="solutions-resolve-extensions" name="solutions-resolve-extensions"></a>

### Automatic resolving of file extensions

Defaults, the Webpack resolves the omitted `.js` extension.
If you use the TypeScript, you can add the `.ts` extension to be resolved.

For example, you have the files:

```
- moduleA.js
- moduleB.ts
- app.ts
- app.scss
```

The file extensions can be omitted:

_app.ts_
```js
import moduleA from './moduleA';
import moduleB from './moduleB';
```

To allow this magic, you should configure the [resolve.extensions](https://webpack.js.org/configuration/resolve/#resolveextensions) Webpack option.

```js
module.exports = {
  //...
  resolve: {
    extensions: ['.js', '.ts'],
  },
};
```

#### Problem with styles

If you import style files in your script and want automatically to resolve the `.css`, `.scss` extensions, e.g., as the following:

_app.ts_
```js
import moduleA from './moduleA';
import moduleB from './moduleB';

// import app.scss file
import './app'; // <= DON'T DO IT!
```

```js
module.exports = {
  //...
  resolve: {
    extensions: ['.js', '.ts', '.scss'], // <= DO NOT mix script and style extensions
  },
};
```

If you use as above, it won't work.

#### Solution

To import styles in a script, you MUST use a style extension and not add a style extension to the `resolve.extensions` option.

_app.ts_
```js
import moduleA from './moduleA';
import moduleB from './moduleB';

import './app.scss'; // <= use the style extension
```

#### [↑ back to contents](#contents)


<a id="solutions-import-url-in-css" name="solutions-import-url-in-css"></a>

## How to use `@import url()` in CSS

> ⚠️ **Warning**
>
> Don't use `@import in CSS`. It's very `bad practice`.
>

Bad example, _main.css_:
```css
@import 'path/to/style.css';
```

The plugin does not support handling of `@import url()` in CSS. Imported url will be passed 1:1 into resulting CSS.

**Problem:** defaults, `css-loader` handles `@import at-rule`, which causes an issue in the plugin.

**Solution:** add the `import: false` into `css-loader` options:

```js
{
  test: /\.(css)$/i,
  loader: 'css-loader',
  options: {
    import: false, // disable handling of @import at-rule in CSS
  },
},
```

> ⚠️ **Warning**
>
> The `*.css` files imported in CSS are not handled, therefore these files must be manually copied to the `dist/` folder using the `copy-webpack-plugin`.

#### [↑ back to contents](#contents)

<a id="solutions-disable-resolving-in-commented-out-tag" name="solutions-disable-resolving-in-commented-out-tag"></a>

## How to disable resolving in commented out tag

In [default attributes](#default-attributes), files will be resolved automatically, regardless of whether the tag is commented out or not.
This is not a bug, it is a feature for very fast attribute parsing.

If you commented out a tag and don't want to resolve files in the tag's [attributes](#default-attributes), rename the attribute.
For example: `href` -> `x-href` or `src` -> `x-src`.

```html
<!-- <link x-href="./styles.scss" rel="stylesheet /> -->
<!-- <script x-src="./main.js" defer="defer"></script> -->
<!-- <img x-src="./image.png"> -->
```

If used any [template engine](#template-engine) (defaults is [Eta](#loader-option-preprocessor-options-eta))
then can be used [templating comments](https://eta.js.org/docs/intro/template-syntax) `<%/* ... */%>`.

```html
<%/* <link rel="stylesheet href="./style.scss" /> Single line comment w/o resolving */%>

<%/*
  Multiline comment w/o resolving of files in attributes
  <img src="./image1.png" />
  <img src="./image2.png" />
*/%>
```

The generated HTML will not contain templating comments.


#### [↑ back to contents](#contents)

---


## Also See

- [ansis][ansis] - The Node.js library for ANSI colors and styles in terminal output
- [pug-loader][pug-loader] The Pug loader for Webpack
- [pug-plugin][pug-plugin] The Pug plugin for Webpack

## License

[ISC](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/LICENSE)

[ansis]: https://github.com/webdiscus/ansis
[pug-loader]: https://github.com/webdiscus/pug-loader
[pug-plugin]: https://github.com/webdiscus/pug-plugin
