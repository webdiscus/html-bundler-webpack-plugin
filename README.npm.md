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

- An [entry point](https://webdiscus.github.io/html-bundler-docs/plugin-options-entry) is any HTML template. **Start from HTML or template**, not from JS.
- **Automatically** processes templates found in the [entry directory](https://webdiscus.github.io/html-bundler-docs/plugin-options-entry#template-directory-reference).
- Built-in support for [template engines](https://webdiscus.github.io/html-bundler-docs/category/template-engines): [Eta](https://webdiscus.github.io/html-bundler-docs/guides/preprocessor/eta), [EJS](https://webdiscus.github.io/html-bundler-docs/guides/preprocessor/ejs), [Handlebars](https://webdiscus.github.io/html-bundler-docs/guides/preprocessor/handlebars), [Nunjucks](https://webdiscus.github.io/html-bundler-docs/guides/preprocessor/nunjucks), [Pug](https://webdiscus.github.io/html-bundler-docs/guides/preprocessor/pug), [Tempura](https://webdiscus.github.io/html-bundler-docs/guides/preprocessor/tempura), [TwigJS](https://webdiscus.github.io/html-bundler-docs/guides/preprocessor/twig), [LiquidJS](https://webdiscus.github.io/html-bundler-docs/guides/preprocessor/liquid).
- Built-in support for **Markdown** `*.md` files in templates, see [Markdown demo](https://stackblitz.com/edit/markdown-to-html-webpack?file=webpack.config.js) in browser.
- Allows to [pass data](https://webdiscus.github.io/html-bundler-docs/plugin-options-entry#entrydescriptiondata) into a template.
- **Resolve** [source files](https://webdiscus.github.io/html-bundler-docs/plugin-options-sources) of [`scripts`](https://webdiscus.github.io/html-bundler-docs/plugin-options-js), [`styles`](https://webdiscus.github.io/html-bundler-docs/plugin-options-css), images and other assets in HTML:
  - `<link href="./style.scss" rel="stylesheet">`
  - `<script src="./app.ts" defer="defer"></script>`
  - `<link href="../images/favicon.svg" type="image/svg" rel=icon />`
  - `<img src="@img/pic.png" srcset="@img/pic2.png 1x, @img/pic3.png 2x" />`\
    Resolved assets will be processed and replaced with correct URLs in the generated HTML.
- **Resolve** references to source files of fonts, images in CSS:
  - `@font-face { src: url('@fonts/monaco.woff2') ... }`
  - `background-image: url(../images/picture.png);`\
    Resolved assets will be processed and replaced with correct URLs in the generated CSS, without using [resolve-url-loader](https://github.com/bholloway/resolve-url-loader).
- **Resolve** [route URLs](https://webdiscus.github.io/html-bundler-docs/plugin-options-router) in `a.href`, useful for navigation in multi-pages.
- **Inline** [JS](https://webdiscus.github.io/html-bundler-docs/guides/inline-js), [CSS](https://webdiscus.github.io/html-bundler-docs/guides/inline-css) and [Images](https://webdiscus.github.io/html-bundler-docs/guides/inline-images) into HTML. See [how to inline all resources](https://webdiscus.github.io/html-bundler-docs/guides/inline-all-assets) into single HTML file.
- Supports importing styles in JavaScript.
- Supports styles used in `*.vue`.
- Supports the [HMR for CSS](https://webdiscus.github.io/html-bundler-docs/plugin-options-css) to update CSS in browser without a full reload.
- Watches for changes in the [data file](https://webdiscus.github.io/html-bundler-docs/plugin-options-entry#entrydescriptiondata) linked to the template in the plugin option.
- Generates the [preload](https://webdiscus.github.io/html-bundler-docs/plugin-options-preload) tags for fonts, images, video, scripts, styles.
- Generates the [integrity](https://webdiscus.github.io/html-bundler-docs/plugin-options-integrity) attribute in the `link` and `script` tags.
- Generates the [favicons](https://webdiscus.github.io/html-bundler-docs/Plugins/favicons) of different sizes for various platforms.
- Minimizes generated HTML.
- You can create custom plugins using the provided [Plugin Hooks](https://webdiscus.github.io/html-bundler-docs/hooks-and-callbacks).

[>> GitHub](https://github.com/webdiscus/html-bundler-webpack-plugin)

## Documentation

- [Get Started](https://webdiscus.github.io/html-bundler-docs/category/getting-started)
- [Migrating from `html-webpack-plugin`](https://webdiscus.github.io/html-bundler-docs/getting-started/migrating-from-html-webpack-plugin)
- [Features](https://webdiscus.github.io/html-bundler-docs/introduction#key-features)
- [Options](https://webdiscus.github.io/html-bundler-docs/category/options)
- [Guides](https://webdiscus.github.io/html-bundler-docs/guides)
- [F.A.Q.](https://webdiscus.github.io/html-bundler-docs/faq/import-url-in-css)

For full documentation, visit [HTML Bundler Docs](https://webdiscus.github.io/html-bundler-webpack-plugin).
