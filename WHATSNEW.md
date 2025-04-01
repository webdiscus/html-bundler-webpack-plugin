## 🔆 What's New in v4

- **NEW** added support the `?inline` and `?embed` queries to inline SVG in HTML, JS and CSS (since `v4.19.0`).
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
