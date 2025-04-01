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


The plugin automates the creation of complete web pages by processing HTML templates with linked assets.
It resolves  dependencies, compiles templates, and ensures that the output HTML contains correct output URLs.

## Install

```bash
npm install html-bundler-webpack-plugin --save-dev
```

## What does the HTML Bundler do?

- **Treats HTML as an entry point**: Initiates the build process from HTML, allowing direct inclusion of source asset files like scripts and styles.
- **Processes HTML templates**: Supports various template engines such as EJS, Handlebars, Nunjucks, Pug, and more.
- **Handles dependencies**: Resolves source files referenced in HTML, such as SCSS, JS, images, updating their references with correct output URLs.
- **Inlines resources**: Provides options to inline JavaScript, CSS, and images.
- **Generates preload tags**: Creates `<link rel="preload">` tags for assets to enhance resource loading.
- **Generates integrity attributes**:  Adds `integrity` attributes to `<link>` and `<script>` tags to ensure resource integrity and security.
- **Generates favicons**: Creates favicons of various sizes for different platforms and injects them into the HTML.

## Get Started

Check out quick [Get Started](https://webdiscus.github.io/html-bundler-webpack-plugin/category/getting-started) and the [other guides](https://webdiscus.github.io/html-bundler-webpack-plugin/guides).

## Documentation

For full documentation, visit [HTML Bundler Docs](https://webdiscus.github.io/html-bundler-webpack-plugin).

## Read it

- [Use a HTML file as an entry point?](https://github.com/webpack/webpack/issues/536) (Webpack issue, #536)
- [Using HTML Bundler Plugin for Webpack to generate HTML files](https://dev.to/webdiscus/using-html-bundler-plugin-for-webpack-to-generate-html-files-30gd)
- [Keep output directory structure in Webpack](https://dev.to/webdiscus/how-to-keep-the-folder-structure-of-source-templates-in-webpack-for-output-html-files-39bj)
- [Auto generate an integrity hash for `link` and `script` tags](https://dev.to/webdiscus/webpack-auto-generate-an-integrity-hash-for-link-and-script-tags-in-an-html-template-48p5)

## Support & Appreciation

```text
If this plugin helps you, consider giving it a ⭐ to show your support!
```

## Sponsors & Patrons

Thank you to all our sponsors and patrons!

<a href="https://www.jetbrains.com/"><img src="https://avatars.githubusercontent.com/u/878437?s=50&v=4" title="JetBrains" alt="JetBrains"></a>
<a href="https://github.com/getsentry"><img src="https://avatars.githubusercontent.com/u/1396951?s=50&v=4" title="Sentry" alt="Sentry"></a>
<a href="https://github.com/stackaid"><img src="https://avatars.githubusercontent.com/u/84366591?s=50&v=4" title="StackAid" alt="StackAid"></a>
<a href="https://www.patreon.com/user?u=96645548"><img src="https://c10.patreonusercontent.com/4/patreon-media/p/user/96645548/020234154757463b939824efe62db137/eyJ3IjoyMDB9/1.jpeg?token-time=2145916800&token-hash=GYnR3xvy7qBr2w1CihOfDOq87nOr4AbuW0ytvwg7Kgs%3D" width="50" title="Buckley Robinson"></a>
<a href="https://github.com/MarcelRobitaille"><img src="https://avatars.githubusercontent.com/u/8503756?s=50&v=4" title="Marcel Robitaille" alt="Marcel Robitaille"></a>
<a href="https://github.com/kannwism"><img src="https://avatars.githubusercontent.com/u/18029781?s=50&v=4" width="50" title="Marian Kannwischer (kannwism)"></a>
<a href="https://www.patreon.com/user?u=96645548"><img src="https://c10.patreonusercontent.com/4/patreon-media/p/user/43568167/0ef77126597d460c9505bdd0aea2eea9/eyJ3IjoyMDB9/1.png?token-time=2145916800&token-hash=7izh1FZTToAqf4Qks3Qrk8YcNbGymF-sBi0hkK_aJO8%3D" width="50" title="Raymond Ackloo"></a>
<a href="https://github.com/chkpnt"><img src="https://avatars.githubusercontent.com/u/1956979?s=50&v=4" width="50" title="Gregor Dschung" alt="Gregor Dschung"></a>
<a href="https://github.com/daltonboll"><img src="https://avatars.githubusercontent.com/u/5821829?v=4" width="50" title="Dalton Boll" alt="daltonboll"></a>
