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

The plugin automates the creation of complete web pages by processing HTML templates with linked assets. 
It resolves dependencies, compiles templates, and ensures that the output HTML contains correct output URLs.

## Install

```bash
npm install html-bundler-webpack-plugin --save-dev
```

## Highlights

- An [entry point](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#option-entry) is any HTML template. **Start from HTML or template**, not from JS.
- **Automatically** processes templates found in the [entry directory](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#option-entry-path).
- Build-in support for [template engines](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#template-engine): [Eta](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#using-template-eta), [EJS](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#using-template-ejs), [Handlebars](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#using-template-handlebars), [Nunjucks](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#using-template-nunjucks), [Pug](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#using-template-pug), [Tempura](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#using-template-tempura), [TwigJS](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#using-template-twig), [LiquidJS](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#using-template-liquidjs).
- Build-in support for **Markdown** `*.md` files in templates, see [Markdown demo](https://stackblitz.com/edit/markdown-to-html-webpack?file=webpack.config.js) in browser.

- **Resolve** [source files](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#loader-option-sources) of [`script`](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#option-js), [`style`](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#option-css)
  - `<link href="./style.scss" rel="stylesheet">`
  - `<script src="./app.ts" defer="defer"></script>`
  - `<link href="../images/favicon.svg" type="image/svg" rel=icon />`
  - `<img src="@images/pic.png" srcset="@images/pic400.png 1x, @images/pic800.png 2x" />`\
  Source files will be resolved, processed and auto-replaced with correct URLs in the generated HTML.
- **Resolve** [route URLs](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#option-router) in `a.href`, useful for navigation in multi-pages.
- **Inline** [JS](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#recipe-inline-js), [CSS](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#recipe-inline-css) and [Images](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#recipe-inline-image) into HTML. See [how to inline all resources](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#recipe-inline-all-assets-to-html) into single HTML file.
- Supports the [HMR for CSS](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#option-css-hot) to update CSS in browser without a full reload.
- Watches for changes in the [data file](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#option-entry-data) linked to the template in the plugin option.
- Generates the [preload](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#option-preload) tags for fonts, images, video, scripts, styles.
- Generates the [integrity](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#option-integrity) attribute in the `link` and `script` tags.
- Generates the [favicons](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#favicons-bundler-plugin) of different sizes for various platforms.
- You can create custom plugins using the provided [Plugin Hooks](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/README.md#plugin-hooks-and-callbacks).

[GitHub](https://github.com/webdiscus/html-bundler-webpack-plugin)

## Documentation

- [Get Started](https://webdiscus.github.io/html-bundler-webpack-plugin/category/getting-started)
- [Migrating from `html-webpack-plugin`](https://webdiscus.github.io/html-bundler-webpack-plugin/getting-started/migrating-from-html-webpack-plugin)
- [Features](https://webdiscus.github.io/html-bundler-webpack-plugin/introduction#key-features)
- [Options](https://webdiscus.github.io/html-bundler-webpack-plugin/category/options)
- [Guides](https://webdiscus.github.io/html-bundler-webpack-plugin/guides)
- [F.A.Q.](https://webdiscus.github.io/html-bundler-webpack-plugin/faq/import-url-in-css)

For full documentation, visit [HTML Bundler Docs](https://webdiscus.github.io/html-bundler-webpack-plugin).
