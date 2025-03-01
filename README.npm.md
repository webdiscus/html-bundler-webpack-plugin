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

This plugin is a powerful alternative to [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin) and a replacement for many [plugins and loaders](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#list-of-plugins).

The HTML Bundler Plugin works a bit differently than `html-webpack-plugin`. 
It doesn't just inject JavaScript and CSS into an HTML.
Instead, it resolves all the source files of the assets referenced directly in the template 
and ensures the generated HTML contains the correct output URLs of resources after Webpack processes them.
Additionally, CSS extracted from styles imported in JS can be injected into HTML as a `<link>` tag or as an inlined CSS.

---

<h3 align="center">
📋 <a href="https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#contents">Table of Contents</a> 🚀<a href="https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#install">Install and Quick Start</a> 🖼 <a href="https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#usage-examples">Usage examples</a>
</h3>

---

## 💡 Highlights

- An [entry point](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#option-entry) is any HTML template. **Start from HTML**, not from JS.
- **Automatically** processes templates found in the [entry directory](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#option-entry-path).
- Build-in support for [template engines](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#template-engine): [Eta](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#using-template-eta), [EJS](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#using-template-ejs), [Handlebars](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#using-template-handlebars), [Nunjucks](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#using-template-nunjucks), [Pug](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#using-template-pug), [Tempura](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#using-template-tempura), [TwigJS](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#using-template-twig), [LiquidJS](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#using-template-liquidjs).
- Build-in support for **Markdown** `*.md` files in templates, see [Markdown demo](https://stackblitz.com/edit/markdown-to-html-webpack?file=webpack.config.js) in browser.
- **Source files** of [`script`](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#option-js) and [`style`](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#option-css) can be specified directly in HTML:
  - `<link href="./style.scss" rel="stylesheet">`\
  No longer need to define source style files in Webpack entry or import styles in JavaScript.
  - `<script src="./app.ts" defer="defer"></script>`\
  No longer need to define source JavaScript files in Webpack entry.
- **Resolves** [source files](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#loader-option-sources) of assets in [attributes](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#loader-option-sources-default) such as `href` `src` `srcset` using **relative path** or **alias**:
  - `<link href="../images/favicon.svg" type="image/svg" rel=icon />`
  - `<img src="@images/pic.png" srcset="@images/pic400.png 1x, @images/pic800.png 2x" />`\
  Source files will be resolved, processed and auto-replaced with correct URLs in the generated HTML.
- **Resolves** [route URLs](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#option-router) in `a.href`, useful for navigation in multi-pages.
- **Inlines** [JS](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#recipe-inline-js), [CSS](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#recipe-inline-css) and [Images](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#recipe-inline-image) into HTML. See [how to inline all resources](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#recipe-inline-all-assets-to-html) into single HTML file.
- Supports the [HMR for CSS](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#option-css-hot) to update CSS in browser without a full reload.
- Watches for changes in the [data file](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#option-entry-data) linked to the template in the plugin option.
- Generates the [preload](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#option-preload) tags for fonts, images, video, scripts, styles.
- Generates the [integrity](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#option-integrity) attribute in the `link` and `script` tags.
- Generates the [favicons](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#favicons-bundler-plugin) of different sizes for various platforms.
- You can create custom plugins using the provided [Plugin Hooks](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#plugin-hooks-and-callbacks).
- Over 700 [tests](https://github.com/webdiscus/html-bundler-webpack-plugin/tree/master/test) for various use cases.

---

📖 See [full documentation on GitHub](https://github.com/webdiscus/html-bundler-webpack-plugin).
