<div align="center">
    <h1>
        <a href="http://www.w3.org/html/logo/">
          <img src="https://www.w3.org/html/logo/badge/html5-badge-h-solo.png" width="120" height="120" alt="HTML5 Powered" title="HTML5 Powered">
        </a>
        <a href="https://github.com/webpack/webpack">
            <img height="120" src="https://webpack.js.org/assets/icon-square-big.svg">
        </a>
        <a href="https://github.com/webdiscus/html-bundler-webpack-plugin"><br>
        HTML bundler Webpack Plugin
        </a>
    </h1>
  <div>The plugin generates HTML files contained output CSS and JS files extracted from their sources used in HTML</div>
</div>

---
[![npm](https://img.shields.io/npm/v/html-bundler-webpack-plugin?logo=npm&color=brightgreen "npm package")](https://www.npmjs.com/package/html-bundler-webpack-plugin "download npm package")
[![node](https://img.shields.io/node/v/pug-plugin)](https://nodejs.org)
[![node](https://img.shields.io/github/package-json/dependency-version/webdiscus/pug-plugin/peer/webpack)](https://webpack.js.org/)

> **Warning**
> 
> This is a brand new unique modern plugin that does exactly what you have wanted for a long time.\
> This plugin has come to replace an outdated, inconvenient `html-webpack-plugin` and others.
> 
> The plugin automatically extracts JS, CSS, images, fonts, etc. from their sources loaded directly in HTML via `<link>` `<script>` `<img>` tags.

> **Note**
>
> The purpose of this plugin is to make the developer's life much easier than it was with other plugins such as
> `html-webpack-plugin` and `mini-css-extract-plugin`.

> **Note**
> 
> The plugin is under continuous development.
> Many new feature will be implemented soon.
> 
> _Кeep your finger on the pulse._
> 
> 

# html-bundler-webpack-plugin


This plugin will work like the [pug-plugin](https://github.com/webdiscus/pug-plugin) but the entry point is a `HTML`
file.

The plugin enable to use a HTML file as entry-point in Webpack, extracts JS and CSS files from their sources specified
in HTML.
The plugin generates HTML files containing hashed output JS and CSS filenames whose source files are specified in the HTML
file.

The plugin automatically extracts the CSS from source style (e.g `*.scss`, `*.styl`) loaded via a `<link>` tag and generates a separate file with hashed filename for it.\
The plugin automatically extracts the JavaScript from source script (e.g. `*.js`, `*.ts`) loaded via a `<script>` tag and generates a separate file with hashed filename for it.\
The plugin automatically processes the images, fonts from sources loaded via `<link>`, `<img>` or `<source>` tags and generates a separate file with hashed filename for it.

💡 **Highlights**:

- The HTML file is the entry-point for all source scripts and styles.
- Source scripts and styles should be specified directly in HTML.
- All JS and CSS files will be extracted from their sources specified in HTML.

Specify the HTML files in the Webpack entry:

```js
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
module.exports = {
  entry: {
    // define your HTML files here
    index: './src/views/home/index.html',  // output dist/index.html
    about: './src/views/about/index.html', // output dist/about.html
  },
  plugins: [
    // enable processing of HTML files defined in Webpack entry
    new HtmlBundlerPlugin({
      js: {
        // output filename of extracted JS file from source script
        filename: 'assets/js/[name].[contenthash:8].js',
      },
      css: {
        // output filename of extracted CSS file from source style
        filename: 'assets/css/[name].[contenthash:8].css',
      },
    }),
  ],
  module: {
    rules: [
      {
        test: /.html/,
        loader: HtmlBundlerPlugin.loader, // HTML loader
      },
    ],
  },
};
```

Add source scripts and styles directly to HTML using relative path or Webpack alias:

```html
<html>
  <head>
    <link href="./styles.scss" rel="stylesheet">
    <script src="./main.js" defer="defer"></script>
  </head>
  <body>
    <h1>Hello World!</h1>
  </body>
</html>
```

The generated HTML contains hashed output CSS and JS filenames:

```html
<html>
  <head>
    <link href="/assets/css/styles.05e4dd86.css" rel="stylesheet">
    <script src="/assets/js/main.f4b855d8.js" defer="defer"></script>
  </head>
  <body>
    <h1>Hello World!</h1>
  </body>
</html>
```

The `<link>` and `<script>` tags stay where they are written.
This can be very important in some cases, as opposed to using other plugins like `html-webpack-plugin` and `mini-css-extract-plugin` that injects these tags somewhere in the HTML.

Just one HTML bundler plugin replaces the functionality of the plugins and loaders:

| Package                                                                                   | Features                                                         | 
|-------------------------------------------------------------------------------------------|------------------------------------------------------------------|
| [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin)                    | extract HTML and save in a file                                  |
| [mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin)     | extract CSS and save in a file                                   |
| [webpack-remove-empty-scripts](https://github.com/webdiscus/webpack-remove-empty-scripts) | remove empty JS files generated by the `mini-css-extract-plugin` |
| [resolve-url-loader](https://github.com/bholloway/resolve-url-loader)                     | resolve url in CSS                                               |
| [svg-url-loader](https://github.com/bhovhannes/svg-url-loader)                            | encode SVG data-URL as utf8                                      |
| [posthtml-inline-svg](https://github.com/andrey-hohlov/posthtml-inline-svg)               | inline SVG icons in HTML                                         |

# How to use source images in HTML

It's very easy! Add to Webpack config the rule:
```js
 module: {
  rules: [
    {
      test: /\.(png|jpe?g|ico)/,
      type: 'asset/resource',
      generator: {
        filename: 'assets/img/[name].[hash:8][ext]',
      },
    },
  ],
```

Now you can write source file (relative path or a Webpack alias) in HTML:
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

# How to preload source fonts in HTML

It's very easy! Add to Webpack config the rule:
```js
 module: {
  rules: [
    {
      test: /\.(eot|ttf|woff|woff2)/,
      type: 'asset/resource',
      generator: {
        filename: 'assets/fonts/[name][ext]',
      },
    },
  ],
```

Now you can write source file (relative path or a Webpack alias) in HTML:
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
> Now you don't need a plugin to copy files from source directory to public.

## Also See

- [ansis][ansis] - The Node.js lib for ANSI color styling of text in terminal
- [pug-loader][pug-loader] The Pug loader for Webpack
- [pug-plugin][pug-plugin] The Pug plugin for Webpack

## License

[ISC](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/LICENSE)

[ansis]: https://github.com/webdiscus/ansis
[pug-loader]: https://github.com/webdiscus/pug-loader
[pug-plugin]: https://github.com/webdiscus/pug-plugin
