<div align="center">
    <h1>
        <img height="120" src="https://user-images.githubusercontent.com/30186107/29488525-f55a69d0-84da-11e7-8a39-5476f663b5eb.png">
        <img height="120" src="https://webpack.js.org/assets/icon-square-big.svg">
        <a href="https://github.com/webdiscus/html-bundler-webpack-plugin"><br>
        HTML Bundler Plugin for Webpack
        </a>
    </h1>
    <div>HTML Bundler Plugin is the right way to bundle all resources with your HTML files</div>
</div>

---
[![npm](https://img.shields.io/npm/v/html-bundler-webpack-plugin?logo=npm&color=brightgreen "npm package")](https://www.npmjs.com/package/html-bundler-webpack-plugin "download npm package")
[![node](https://img.shields.io/node/v/html-bundler-webpack-plugin)](https://nodejs.org)
[![node](https://img.shields.io/github/package-json/dependency-version/webdiscus/html-bundler-webpack-plugin/peer/webpack)](https://webpack.js.org/)

This is a modern plugin that does exactly what you want, automatically extracts JS, CSS, images, fonts
from their sources loaded directly in HTML using tags 
and replaces the source filenames with output hashed version of the files.
The plugin enable to use an HTML file as entry-point in Webpack.

The purpose of this plugin is to make the developer's life much easier than it was using 
 `html-webpack-plugin` `mini-css-extract-plugin` and other plugins.

💡 **Highlights**:

- Define your HTML pages in Webpack entry.
- The HTML file is the entry-point for all source scripts and styles.
- Source scripts and styles can be loaded directly in HTML using `<script>` and `<link>` tags.
- All JS and CSS files will be extracted from their sources loaded in HTML tags.
- You can very easy inline JS, CSS, SVG, images w/o additional plugin and loaders.

This plugin works like the [pug-plugin](https://github.com/webdiscus/pug-plugin) but the entry point is a `HTML`
file.

How to easily build a multipage website with this plugin, see the [Webpack boilerplate](https://github.com/webdiscus/webpack-html-scss-boilerplate) used the `html-bundler-webpack-plugin`;

### Simple usage example
Add the HTML files in the Webpack entry:

```js
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
module.exports = {
  entry: {
    // define HTML files here
    index: './src/views/home/index.html', // output dist/index.html
  },
  plugins: [
    // enable processing of HTML files defined in Webpack entry
    new HtmlBundlerPlugin(),
  ],
  module: {
    rules: [
      {
        test: /.html/,
        loader: HtmlBundlerPlugin.loader, // HTML loader
      },
      // ... other rules, e.g. for styles, images, fonts, etc.
    ],
  },
};
```

Add source scripts and styles directly to HTML using a relative path or Webpack alias:

```html
<html>
  <head>
    <link href="./style.scss" rel="stylesheet">
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
    <link href="/assets/css/style.05e4dd86.css" rel="stylesheet">
    <script src="/assets/js/main.f4b855d8.js" defer="defer"></script>
  </head>
  <body>
    <h1>Hello World!</h1>
  </body>
</html>
```

## Contents

---
1. [Install and Quick start](#install)
2. [Features](#features)
3. [Plugin options](#plugin-options)
3. [Loader options](#loader-options)
4. [Recipes](#recipes)
   - [How to use source images in HTML](#recipe-use-images-in-html)
   - [How to preload source fonts in HTML](#recipe-preload-fonts)
   - [How to inline CSS in HTML](#recipe-inline-css)
   - [How to inline JS in HTML](#recipe-inline-js)
   - [How to inline SVG, PNG images in HTML](#recipe-inline-image)
   - [How to use a template engine, e.g. Handlebars](#recipe-template-engine)
   - [How to pass data into template](#recipe-pass-data)
   - [How to pass different data in multipage configuration](#recipe-pass-data-multipage)
   - [How to use HMR live reload](#recipe-hmr)

<a id="features" name="features" href="#features"></a>
## Features

- handels HTML files defined in Webpack entry
- HTML file is entry-point for all resources (styles, scripts)
- extracts CSS from source style loaded in HTML via a `<link>` tag
- extracts JS from source script loaded in HTML via a `<script>` tag
- processes the images, fonts and other resources from source files loaded in HTML tags
- support the tags and attributes:
  - `<link>` attributes: `href` (when `type="text/css"` or `rel="stylesheet"`) `imagesrcset`
  - `<script>` attributes: `src`
  - `<img>` attributes: `src` `srcset`
  - `<source>` attributes: `src` `srcset`
  - `<input>` attributes: `src` when `type="image"`
  - `<audio>` attributes: `src`
  - `<track>` attributes: `src`
  - `<video>` attributes: `src`
- generated HTML contains hashed CSS, JS, images, fonts output filenames
- resolves source files of URLs in CSS and extract resolved resources to output directory
- support the `auto` publicPath
- support the module types `asset/resource` `asset/inline` `asset`
- `inline CSS` in HTML
- `inline JavaScript` in HTML
- `inline image` as `base64 encoded` data-URL for PNG, JPG, etc. in HTML and CSS
- `inline SVG` as SVG tag in HTML
- `inline SVG` as `utf-8` data-URL in CSS
  ```scss
  background: url('./icons/iphone.svg') // CSS: url("data:image/svg+xml,<svg>...</svg>")
  ```

Just one HTML bundler plugin replaces the functionality of the plugins and loaders:

| Package                                                                                   | Features                                                         | 
|-------------------------------------------------------------------------------------------|------------------------------------------------------------------|
| [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin)                    | extract HTML and save in a file                                  |
| [mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin)     | extract CSS and save in a file                                   |
| [webpack-remove-empty-scripts](https://github.com/webdiscus/webpack-remove-empty-scripts) | remove empty JS files generated by the `mini-css-extract-plugin` |
| [html-loader](https://github.com/webpack-contrib/html-loader)                             | exports HTML as string                                           |
| [style-loader](https://github.com/webpack-contrib/style-loader)                           | inject CSS into the DOM                                          |
| [resolve-url-loader](https://github.com/bholloway/resolve-url-loader)                     | resolve relative url in CSS                                      |
| [svg-url-loader](https://github.com/bhovhannes/svg-url-loader)                            | encode SVG data-URL as utf8                                      |
| [posthtml-inline-svg](https://github.com/andrey-hohlov/posthtml-inline-svg)               | inline SVG icons in HTML                                         |


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

Change your `webpack.config.js` according to the following minimal configuration:

```js
const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '/',
  },

  entry: {
    // define HTML files here
    index: './src/views/home/index.html',  // output dist/index.html
    'pages/about': './src/views/about/index.html', // output dist/pages/about.html
    // ...
  },

  plugins: [
    new HtmlBundlerPlugin({
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
      {
        test: /\.html$/,
        loader: HtmlBundlerPlugin.loader, // HTML loader
      },
      {
        test: /\.(css|sass|scss)$/,
        use: ['css-loader', 'sass-loader'],
      },
    ],
  },
};
```

---

<a id="plugin-options" name="plugin-options" href="#plugin-options"></a>
## Plugin options

### `verbose`
Type: `boolean` Default: `false`<br>
Display information about extracted files.

### `test`
Type: `RegExp` Default: `/\.html$/`<br>
The `test` option allows то handel only those entry points that match their source filename.

For example, if you has `*.html` and `*.hbs` entry points, then you can set the option to match all needed files: `test: /\.(html|hbs)$/`.

<a id="plugin-option-outputPath" name="plugin-option-outputPath" href="#plugin-option-outputPath"></a>
### `outputPath`
Type: `string` Default: `webpack.options.output.path`<br>
The output directory for processed file. This directory can be relative by `webpack.options.output.path` or absolute.

<a id="plugin-option-filename" name="plugin-option-filename" href="#plugin-option-filename"></a>
### `filename`
Type: `string | Function` Default: `[name].html`<br>
The name of output file.
- If type is `string` then following substitutions (see [output.filename](https://webpack.js.org/configuration/output/#template-strings) for chunk-level) are available in template string:
  - `[id]` The ID of the chunk.
  - `[name]` Only filename without extension or path.
  - `[contenthash]` The hash of the content.
  - `[contenthash:nn]` The `nn` is the length of hashes (defaults to 20).
- If type is `Function` then following arguments are available in the function:
  - `@param {PathData} pathData` has the useful properties (see the [type PathData](https://webpack.js.org/configuration/output/#outputfilename)):
    - `pathData.filename` the full path to source file
    - `pathData.chunk.name` the name of entry key
  - `@param {AssetInfo} assetInfo` Mostly this object is empty.
  - `@return {string}` The name or template string of output file.

### `css`
Type: `Object`\
Default properties:
```js
{
  test: /\.(css|scss|sass|less|styl)$/,
  verbose: false,
  filename: '[name].css',
  outputPath: null,
}
```
The `filename` property see by [filename option](#plugin-option-filename).
The `outputPath` property see by [outputPath option](#plugin-option-outputPath).

The option to extract CSS from a style source file loaded in the HTML tag:
```html
<link href="./style.scss" rel="stylesheet">
```

> **Warning**
>
> Don't import source styles in JavaScript! Styles must be loaded directly in HTML.

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

### `js`
Type: `Object`\
Default properties:
```js
{
  verbose: false,
  filename: '[name].js', 
  outputPath: null,
}
```
The `filename` property see by [filename option](#plugin-option-filename).
The `outputPath` property see by [outputPath option](#plugin-option-outputPath).
The `test` property not exist because all JS files loaded in `<script>` tag are automatically detected.

The option to extract JS from a script source file loaded in the HTML tag:
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

---

<a id="loader-options" name="loader-options" href="#loader-options"></a>
## Loader options

### `preprocessor`
Type:
```
type preprocessor = (
  content: string,
  loaderContext: LoaderContext
) => HTMLElement;
```

Default: `undefined`<br>

The `content` argument is raw content of a file.\
The `loaderContext` argument is an object contained useful properties, e.g.:
- `mode` - the Webpack mode: `production`, `development`, `none`
- `rootContext` - the path to Webpack context
- `resource` - the template file

Complete API see by the [Loader Context](https://webpack.js.org/api/loaders/#the-loader-context).

The preprocessor is called before handling of the content. 
This function can be used to replace a placeholder with a variable or compile the content with a template engine, e.g. [Handlebars](https://handlebarsjs.com).

For example, set variable in the template
_index.html_
```html
<html>
<head>
  <title>{{title}}</title>
</head>
<body>
  <h1>Hello World!</h1>
</body>
</html>
```

_Webpack config_
```js
const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
module.exports = {
  output: {
    path: path.join(__dirname, 'dist/'),
  },

  entry: {
    index: './src/index.html',
  },

  plugins: [new HtmlBundlerPlugin()],

  module: {
    rules: [
      {
        test: /\.html$/,
        loader: HtmlBundlerPlugin.loader,
        options: {
          preprocessor: (content, loaderContext) => content.replace('{{title}}', 'Homepage'),
        },
      },
    ],
  },
};

```

> **Note**
>
> The `preprocessor` will be called for each entry file.
> For multipage configuration, you can use the `loaderContext.resource` property to differentiate data for diverse pages.
> See the [usage example](#recipe-pass-data-multipage).

---

<a id="recipe-use-images-in-html" name="recipe-use-images-in-html" href="#recipe-use-images-in-html"></a>
## How to use source images in HTML

Add to Webpack config the rule:
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

<a id="recipe-preload-fonts" name="recipe-preload-fonts" href="#recipe-preload-fonts"></a>
## How to preload source fonts in HTML

Add to Webpack config the rule:
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


<a id="recipe-inline-css" name="recipe-inline-css" href="#recipe-inline-css"></a>
## How to inline CSS in HTML

For example, the _style.scss_:
```scss
$color: red;
h1 {
  color: $color;
}
```

Add the `?inline` query to the source filename which you want to inline:
```html
<html>
  <head>
    <!-- load style as file -->
    <link href="./main.scss" rel="stylesheet" />
    <!-- inline style -->
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
    <!-- load style as file -->
    <link href="/assets/css/main.05e4dd86.css" rel="stylesheet">
    <!-- inline style -->
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
> To enable source map in inline CSS set the Webpack option `devtool`.

<a id="recipe-inline-js" name="recipe-inline-js" href="#recipe-inline-js"></a>
## How to inline JS in HTML

For example, the _script.js_:
```js
console.log('Hello JS!');
```

Add the `?inline` query to the source filename which you want to inline:
```html
<html>
  <head>
    <!-- load script as file -->
    <script src="./main.js" defer="defer"></script>
    <!-- inline script -->
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
    <!-- load style as file -->
    <script src="assets/js/main.992ba657.js" defer="defer"></script>
    <!-- inline script -->
    <script>
      (()=>{"use strict";console.log("Hello JS!")})();
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

<a id="recipe-inline-image" name="recipe-inline-image" href="#recipe-inline-image"></a>
## How to inline SVG, PNG images in HTML

You can inline images in two ways:
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

<a id="recipe-template-engine" name="recipe-template-engine" href="#recipe-template-engine"></a>
## How to use a template engine

For example, using the Handlebars templating engine, there is an
_index.hbs_
```html
<html>
<head>
  <title>{{title}}</title>
</head>
<body>
  <h1>{{headline}}</h1>
  <div>
    <p>{{firstname}} {{lastname}}</p>
  </div>
</body>
</html>
```

Add the `preprocessor` option to compile the content with Handlebars.

```js
const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
const Handlebars = require('handlebars');
module.exports = {
  output: {
    path: path.join(__dirname, 'dist/'),
  },

  entry: {
    index: './src/views/home/index.hbs',
  },

  plugins: [
    new HtmlBundlerPlugin({
      test: /\.hbs$/, // add the option to match *.hbs files in entry, default is /\.html$/
    }),
  ],

  module: {
    rules: [
      {
        test: /\.hbs$/, // must match the files specified in the entry
        loader: HtmlBundlerPlugin.loader,
        options: {
          // add the preprocessor function to compile *.hbs files to HTML
          // you can pass data here to all templates
          preprocessor: (content, loaderContext) =>
            Handlebars.compile(content)({
              title: 'My Title',
              headline: 'Breaking Bad',
              firstname: 'Walter',
              lastname: 'Heisenberg',
            }),
        },
      },
    ],
  },
};

```

<a id="recipe-pass-data" name="recipe-pass-data" href="#recipe-pass-data"></a>
## How to pass data into template

You can pass variables into template using a template engine, e.g. [Handlebars](https://handlebarsjs.com).
See the usage example by [How to use a template engine](#recipe-template-engine) or [How to pass different data in multipage configuration](#recipe-pass-data-multipage).

<a id="recipe-pass-data-multipage" name="recipe-pass-data-multipage" href="#recipe-pass-data-multipage"></a>
## How to pass different data in multipage configuration

For example, you have several pages with variables:

one file has `.html` extension, _first.html_
```html
<html>
<head>
  <title>{{title}}</title>
  <link href="./first.scss" rel="stylesheet">
  <script src="./first.js" defer="defer"></script>
</head>
<body>
  <h1>{{headline}}</h1>
  <div>
    <p>{{firstname}} {{lastname}}</p>
  </div>
</body>
</html>
```

other file has `.hbs` extension, _second.hbs_
```html
<html>
<head>
  <title>{{title}}</title>
  <link href="./second.scss" rel="stylesheet">
  <script src="./second.js" defer="defer"></script>
</head>
<body>
  <h1>Location</h1>
  <div>
    <p>{{city}}, {{state}}</p>
    <img src="./map.png" alt="map" />
  </div>
</body>
</html>
```

_Webpack config for multipage_
```js
const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
const Handlebars = require('handlebars');

/**
 * Find template data by template file.
 *
 * @param {string} sourceFile
 * @param {Object} data
 * @return {Object}
 */
const findData = (sourceFile, data) => {
  for (const [key, value] of Object.entries(data)) {
    if (sourceFile.endsWith(key)) return value;
  }
  return {};
};

// define template data using a template filename as key
const entryData = {
  'src/first.html': {
    title: 'First page',
    headline: 'Breaking Bad',
    firstname: 'Walter',
    lastname: 'Heisenberg',
  },
  'src/second.hbs': {
    title: 'Second page',
    city: 'Albuquerque',
    state: 'New Mexico',
  },
};

module.exports = {
  output: {
    path: path.join(__dirname, 'dist/'),
  },

  entry: {
    // define your templates here
    first: './src/first.html', // => dist/first.html
    'route/to/second': './src/second.hbs', // => dist/route/to/second.html
  },

  plugins: [
    new HtmlBundlerPlugin({
      test: /\.(html|hbs)$/, // match all template files
      js: {
        filename: 'assets/js/[name].[contenthash:8].js',
      },
      css: {
        filename: 'assets/css/[name].[contenthash:8].css',
      },
    }),
  ],

  module: {
    rules: [
      // templates
      {
        test: /\.(html|hbs)/,
        loader: HtmlBundlerPlugin.loader,
        options: {
          // the deconstucted 'resource' argument is the template name
          preprocessor: (content, { resource }) => {
            // get template variables by template filename
            const data = findData(resource, entryData);
            // compile template with specific variables
            return Handlebars.compile(content)(data);
          },
        },
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

The generated _dist/first.html_
```html
<html>
<head>
  <title>First page</title>
  <link href="/assets/css/first.05e4dd86.css" rel="stylesheet">
  <script src="/assets/js/first.f4b855d8.js" defer="defer"></script>
</head>
<body>
  <h1>Breaking Bad</h1>
  <div>
    <p>Walter Heisenberg</p>
  </div>
</body>
</html>

```

The generated _dist/route/to/second.html_
```html
<html>
<head>
  <title>Second page</title>
  <link href="/assets/css/second.d8605e4d.css" rel="stylesheet">
  <script src="/assets/js/second.5d8f4b85.js" defer="defer"></script>
</head>
<body>
  <h1>Location</h1>
  <div>
    <p>Albuquerque, New Mexico</p>
    <img src="assets/img/map.697ef306.png" alt="map" />
  </div>
</body>
</html>

```

<a id="recipe-hmr" name="recipe-hmr" href="#recipe-hmr"></a>
## HMR live reload

To enable live reload by changes any file add in the Webpack config the `devServer` option:
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

> **Note**
>
> Live reload works only if in HTML used a JS file. This is specific of Webpack.
> If your HTML has not a JS, then create one empty JS file, e.g. `hmr.js` and add it in the HTML:
> ```html
> <script src="./hmr.js"></script>
> ```

---

## Also See

- [ansis][ansis] - The Node.js lib for ANSI color styling of text in terminal
- [pug-loader][pug-loader] The Pug loader for Webpack
- [pug-plugin][pug-plugin] The Pug plugin for Webpack

## License

[ISC](https://github.com/webdiscus/html-bundler-webpack-plugin/blob/master/LICENSE)

[ansis]: https://github.com/webdiscus/ansis
[pug-loader]: https://github.com/webdiscus/pug-loader
[pug-plugin]: https://github.com/webdiscus/pug-plugin
