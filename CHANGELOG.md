# Changelog

## 4.15.0 (2025-01-21)

- chore: bump from beta to release v4.15.0

## 4.15.0-beta.0 (2025-01-20)

- feat: add the fixed preload filter:
  ```ts
  type PreloadFilter =
    | RegExp
    | Array<RegExp>
    | { includes?: Array<RegExp>; excludes?: Array<RegExp> }
    | ((asset: { sourceFiles: Array<string>; outputFile: string }) => void | boolean); // <= BRAKING CHANGES compared to v4.14.0 (DEPRECATED)
  ```

## 4.14.0 (2025-01-19) DEPRECATED (filter API will be changed in next version)

- feat: add the `filter` for the `preload` option
  ```ts
  type AdvancedFilter =
    | RegExp
    | Array<RegExp>
    | { includes?: Array<RegExp>; excludes?: Array<RegExp> }
    | ((value: string) => void | true | false); // <= string argument DEPRECATED
  ```

## 4.13.0 (2025-01-18)

- feat: add support for preloading of dynamic imported modules, #138

## 4.12.3 (2025-01-18)

- fix: output URL for preloaded resources if publicPath is a URL or root path, #141

## 4.12.2 (2025-01-13)

- fix: allow to define the `renderStage` option lower than `PROCESS_ASSETS_STAGE_SUMMARIZE`, #137

## 4.12.1 (2025-01-12)

- fix: incorrect output of preload tag if "crossorigin: true", #139
- fix: if `as=font` is used in preload and the `crossorigin` is not defined,
       it will be added automatically, because the `crossorigin` is mandatory for `font` type

## 4.12.0 (2025-01-12)

- feat(release): add support for the `?inline` query to load assets as data URL
- test: add tests for `?inline` query
- docs: update readme for new feature

## 4.12.0-beta.1 (2025-01-07)

- feat: add support for the `?inline` query to load assets as data URL in HTML, CSS and JS.
  By using the `?inline` query, the following configuration can now be omitted:
  ```js
  {
    // since v4.12 is not need anymore
    resourceQuery: /inline/,
    type: 'asset/inline',
  },
  ```

## 4.12.0-beta.0 (2025-01-06)

- feat: add support for the `?inline` query by importing SVG file in JS as data URL
  ```js
  import file from './image.svg'; // import according the matched webpack config, defaults as output filename
  
  import file from './image.svg?inline'; // import as UTF-8 data URL
  import file from './image.svg?inline=utf8'; // import as UTF-8 data URL
  import file from './image.svg?inline=base64'; // import as base64-encoded data URL
  ```
- chore: update dependencies
- chore: update license to current date
- docs: add in readme the recipe "How to import SVG in JavaScript"

## 4.11.1 (2024-12-27)

- fix: in TypeScript the `renderStage` option should be optional

## 4.11.0 (2024-12-27)

- feat: add the `renderStage` option to define the stage for rendering output HTML in the processAssets Webpack hook
- fix: set default render stage before the stage used in `compression-webpack-plugin` to save completely rendered HTML, #134
- test: add test for the render stage
- docs: add documentation for the new option in readme

## 4.10.4 (2024-12-18)

fix: fail rebuild after changed css file if no html entry defined, #132

## 4.10.3 (2024-12-13)

- fix: resolve webpack alias correctly if it is external URL

## 4.10.2 (2024-12-10)

- fix: if a module build has failed then stop further processing of modules to allow output original error

## 4.10.1 (2024-12-09)

- fix: re-deploy broken package `v4.10.0` in npm repository.
  An error occurred during deployment.

## 4.10.0 (2024-12-08)

- feat: add support for handlebars helpers in compile mode

## 4.9.2 (2024-12-07)

- fix: Error Cannot find module 'nunjucks', introduced in `4.9.1`

## 4.9.1 (2024-12-07) DEPRECATED

- fix: rebuild all entrypoints after changes in partials matching to the `watchFiles` plugin option,
       this fix extends the feature of `v4.9.0`

## 4.9.0 (2024-12-07)

- feat: using serve/watch, after a partial file is modified all entry point templates will be rebuilt, #127.\
  **The problem:**
  Webpack doesn't know which partials are used in which templates, so Webpack can't rebuild the main template (entrypoint) where a partial has changed. 

## 4.8.1 (2024-12-06)

- fix: if template is imported in JS in compile mode and the same template function called with different variables set
       then variables from previous definition must not be cached.
       This fix is for all template engines. #128

## 4.8.0 (2024-12-05)

- feat: add `minimized` tag in stats output for minimized HTML assets

## 4.7.0 (2024-12-04)

- feat: precompile Handlebars templates with sub partials

## 4.6.1 (2024-12-04)

- fix: missing optional dependencies
- fix: watching changes in files outer the project directory

## 4.6.0 (2024-12-03) DEPRECATED

- feat: add support the Markdown `*.md` files in the template engines: `eta`, `ejs`, `handlebars`, `pug`.
  The markdown file can be included in the HTML template, e.g. `Eta`:
  ```html
  <html>
  <head>
    <!-- Load Markdown and Highlighting styles -->
    <link href="github-markdown-css/github-markdown-light.css" rel="stylesheet" />
    <link href="prismjs/themes/prism.min.css" rel="stylesheet" />
  </head>
  <body class="markdown-body">
    <!-- Load Markdown file -->
    <%~ include('readme.md') %>
  </body>
  </html>
  ```

## 4.5.3 (2024-11-28)

- fix: issue by HMR when CSS contains Tailwind-like style names with backslashes
  E.g.: `.\32xl\:w-96`, `.lg\:ml-4`

## 4.5.2 (2024-11-28)

- fix: issue by HMR when CSS contains a comment with `back-tick` quotes

## 4.5.1 (2024-11-28)

- fix: if used `splitChunks.chunks` option then this options will be removed and will be displayed a warning
  This option makes no sense, because we will split only scripts.
- docs: update readme

## 4.5.0 (2024-11-25)

- feat: add support the HMR for styles imported in JavaScript files
- feat: add new `css.hot` option to enable HMR for styles

## 4.4.3 (2024-11-23)

- fix: issue by inline a style when in the tag used single quotes for attribute

## 4.4.2 (2024-11-18)

- fix: add Exception when used `splitChunks` and occurs the error: Can't resolve a CSS file in template
- fix: correct Exception message when a source CSS file is not found 

## 4.4.1 (2024-11-05)

- fix: if used multiple config and cache `filesystem`, occurs the error 'PersistentCache is already registered'
- test: add test for multiple config when used cache `filesystem`

## 4.4.0 (2024-11-04)

- feat: add `context` loader option to resolve assets w/o leading `/` in a directory outer your project:
  ```js
  new HtmlBundlerPlugin({
    loaderOptions: {
      context: path.resolve(__dirname, '../other/'),
    },
  }),
  ```
- docs: update readme

## 4.3.0 (2024-11-04)

- feat: add preprocessor for [Tempura](https://github.com/lukeed/tempura) template engine.
  Supports the static render and template function.
- test: add test for the `tempura` preprocessor
- docs: add documentation for Tempura
- chore: add usage example

## 4.2.0 (2024-11-03)

- feat: add support for Webpack `>= 5.96` to correct inline images into CSS and HTML
  WARNING: Webpack version `5.96.0` introduces the BREAKING CHANGE in the `CodeGenerationResults` class!
- feat: add support for Webpack `>= 5.96` to correct CSS lazy loading
  WARNING: Webpack version `5.96.0` introduces the BREAKING CHANGE in the `AssetGenerator` class!
- chore: update package and devel dependencies
- test: update tests

## 4.1.4 (2024-11-01)

- chore: update dependencies

## 4.1.3 (2024-10-28)

- fix: if `filesystem` cache is used, webpack stats or errors are not displayed, #115
- test: allow set the `stats.preset` webpack option to display stats info by testing 

## 4.1.2 (2024-10-21)

- fix: issue `file is not resolved` after start->stop->start in serve/watch mode when used cache filesystem, #114
- chore: update dev packages

## 4.1.1 (2024-10-17)

- fix: after 2-3 changes of the data file (global or entry), the dependent entry template is not recompiled.
- test: add test for Eta preprocessor with default options

## 4.1.0 (2024-09-29)

- feat: add supports the `require` of CommonJS and JSON files in EJS templates:
  ```html
  <% const data = require('./data.js') %>
  <div>Film: <%= data.title %></div>
  <div>Genre: <%= data.genre %></div>
  ```
  or
  ```html
  <% const data = require('./data.json') %>
  <div>Film: <%= data.title %></div>
  <div>Genre: <%= data.genre %></div>
  ```
- chore: update peerDependencies
- test: refactor test cases for preprocessor

<a id="v4-0-0" name="v4-0-0"></a>
## 4.0.0 Release (2024-09-08)

### BREAKING CHANGES

- Minimum supported Node.js version `18+`.\
  The plugin may works on the Node.js >= `16.20.0`, but we can't test the plugin with outdated Node.js versions.
  GitHub CI test works only on Node.js >= 18.
  Many actual dev dependencies requires Node.js >= 18.

- Minimum supported Webpack version `5.81+`.

- The plugin `option` property is not static anymore:

  OLD (up to v3.x)
  ```js
  class MyPlugin extends HtmlBundlerPlugin {
    constructor(options = {}) {
      super({ ...options });
    }
    init(compiler) {
      // MyPlugin.option. ...; <= was as static property
    }
  }
  ```
  NEW (since v4.0)
  ```js
  class MyPlugin extends HtmlBundlerPlugin {
    constructor(options = {}) {
      super({ ...options });
    }
    init(compiler) {
      // this.option. ...; <= now is non static property
    }
  }
  ```

- Using the `addProcess()` plugin method is changed:

  OLD (up to v3.x)
  ```js
  class MyPlugin extends HtmlBundlerPlugin {
    constructor(options = {}) {
      super({ ...options });
    }
    init(compiler) {
      // the method was as property of the static `option`
      MyPlugin.option.addProcess('postprocess', (content) => {
        return content;
      });
    }
  }
  ```
  NEW (since v4.0)
  ```js
  class MyPlugin extends HtmlBundlerPlugin {
    constructor(options = {}) {
      super({ ...options });
    }
    init(compiler) {
      // now is the class method
      this.addProcess('postprocess', (content) => {
        return content;
      });
    }
  }
  ```

### DEPRECATIONS

- The `watchFiles.files` option has been renamed to `watchFiles.includes`.\
  The `files` option is still supported but is deprecated.
  It's recommended to replace the `files` with `includes` in your config.

- The `watchFiles.ignore` option has been renamed to `watchFiles.excludes`.\
  The `ignore` option is still supported but is deprecated.
  It's recommended to replace the `ignore` with `excludes` in your config.


### FEATURES

- feat: add support the multiple webpack configuration:
```js
const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = [
  {
    name: 'first',
    output: {
      path: path.join(__dirname, 'dist/web1/'),
    },
    plugins: [
      new HtmlBundlerPlugin({
        entry: {
          index: './web1/views/home.html',
        },
      }),
    ],
  },

  {
    name: 'second',
    output: {
      path: path.join(__dirname, 'dist/web2'),
    },
    plugins: [
      new HtmlBundlerPlugin({
        entry: {
          index: './web2/views/home.html',
        },
      }),
    ],
  },
];
```

- feat: display webpack config name in console output:
  ```js
  module.exports = {
    name: 'client', // <= this name will displayed in console output
  }
  ```

### BUGFIX

- fix: ERROR in RealContentHashPlugin in serv/watch mode after adding new import file
- fix: when using integrity occurs ERROR in RealContentHashPlugin in serv/watch mode after changes by using dynamic import
  
### MISC

- refactor: rewrite all static classes to regular, this is needed to support webpack multiple configurations
- refactor: code refactoring, invisible improvements
- test: add testing for Node.js `v22` on GitHub
- test: add tests to improve the code coverage to 98%, 2% code can be tested only manual, e.g. in watch/serve mode after changes
- chore: update dev packages, many packages requires Node.js >= v18
- docs: update readme

## 4.0.0-beta.3 (2024-08-16)
See release 4.0.0

## 4.0.0-beta.2 (2024-08-15)
See release 4.0.0

## 4.0.0-beta.1 (2024-08-13)
See release 4.0.0

## 4.0.0-beta.0 (2024-08-10)
See release 4.0.0

## 3.17.3 (2024-08-09)

- fix: in dev mode imports SCSS in JS when in the same file is inlined another SCSS file via `?inline` query, #102

## 3.17.2 (2024-08-08)

- fix: error when `integrity` option is enabled but no template defined in entry, #107

## 3.17.1 (2024-08-01)

- fix: when using the integrity option, leaves the original attributes in the script tag as is

## 3.17.0 (2024-07-23)

- feat: add support the `?inline` query for styles imported in JavaScript:
  ```js
  import './style-a.css?inline'; // the extracted CSS will be injected into HTML
  import './style-b.css'; // the extracted CSS will be saved into separate output file
  ```

## 3.16.0 (2024-07-23)

- feat: add `runtime` option for the `handlebars` preprocessor
- test: add test for the `runtime` option
- docs: update readme

## 3.15.1 (2024-07-07)

- fix: resolving source file in a tag attribute when another attribute contains the `>` char, e.g.:
  ```html
  <img src="./arrow.png" alt="right->">
  ```
- chore: improve error handling when attributes parsing
- test: improve test coverage

## 3.15.0 (2024-06-20)

- feat: update `eta` package to latest version 3.4.0
- chore: update dev dependencies and tests

## 3.14.0 (2024-05-31)

- feat: add `watchFiles.includes` and `watchFiles.excludes` options to allow watch specifically external file,
  e.g. *.md file included via Pug filter from any location outer project directory
  ```ts
  type WatchFiles = {
    paths?: Array<string>;
    files?: Array<RegExp>;
    includes?: Array<RegExp | string>; // <= NEW
    ignore?: Array<RegExp>;
    excludes?: Array<RegExp | string>; // <= NEW
  };
  ```
  WARNING: in the 4.0 version the undocumented `includes` and `excludes` properties are removed from code.

## 3.13.0 (2024-05-26)

- feat: add resolving the url() value in the style attribute:
  ```html
  <div style="background-image: url(./image.png);"></div>
  ```

## 3.12.0 (2024-05-19)

- feat: add support for the `css-loader` option `exportType` as [css-style-sheet](https://github.com/webpack-contrib/css-loader?#exporttype)
- test: add tests for import of CSS stylesheet
- docs: update readme

## 3.11.0 (2024-04-23)

- feat: add `entryFilter` option to include or exclude entry files when the `entry` option is the path

## 3.10.0 (2024-04-18)

- feat: add support the [CSS Modules](https://github.com/css-modules/css-modules) for styles imported in JS using the [css-loader modules](https://github.com/webpack-contrib/css-loader#modules) option.\
  Required: `css-loader` >= `7.0.0`\
  The CSS _module rule_ in the webpack config:
  ```js
  {
    test: /\.(css)$/,
    use: [
      {
        loader: 'css-loader',
        options: {
          modules: {
            localIdentName: '[name]__[local]__[hash:base64:5]',
            exportLocalsConvention: 'camelCase',
          },
        },
      },
    ],
  },
  ```
  CSS:
  ```css
  .red {
    color: red;
  }
  .green {
    color: green;
  }
  ```
  Using in JS:
  ```js
  // the styles contains CSS class names: { red: 'main__red__us4Tv', green: 'main__green__bcpRp' }
  import styles from './main.css';
  ```

## 3.9.1 (2024-04-10)

- fix: issue when used js dynamic import with magic comments /* webpackPrefetch: true */ and css.inline=true, #88
- fix: ansi colors for verbose output in some terminals

## 3.9.0 (2024-04-07)

- feat: add support for dynamic import of styles
  ```
  const loadStyles = () => import('./component.scss');
  loadStyles();
  ```
- fix: extract CSS from styles imported in dynamically imported JS

## 3.8.0 (2024-04-06)

- feat(Pug): add experimental (undocumented) syntax to include (using `?include` query) compiled CSS directly into style tag to allow keep tag attributes
  ```pug
  style(scope='some')=require('./component.scss?include')
  ```
  will be generate
  ```html
  <style scope="some">
    ... CSS ...
  </style>
  ```
- test: add test for lazy loading CSS using `fetch()` and `document.adoptedStyleSheets`
- docs: update readme

## 3.7.0 (2024-03-21)

- feat: add the possibility to add many post processes. Next postprocess receives the result from previous.
  So you can extend this plugin with additional default functionality.
  ```js
  class MyPlugin extends HtmlBundlerPlugin {
    init(compiler) {
      MyPlugin.option.addProcess('postprocess', (content) => {
        // TODO: modify the generated HTML content
        return content;
      });
    }
  }
  
  module.exports = {
    plugins: [
      new MyPlugin({
        entry: {
          index: './src/index.html',
        },
      }),
    ],
  };
  ```
  This feature is used in the [pug-plugin](https://github.com/webdiscus/pug-plugin) for pretty formatting generated HTML.\
  See an example in the [test case](https://github.com/webdiscus/html-bundler-webpack-plugin/tree/master/test/cases/option-postprocess-pipe).

## 3.6.5 (2024-03-19)

- fix: define the unique instance name for the plugin as `HtmlBundlerPlugin` instead of `Plugin`

## 3.6.4 (2024-03-17)

- fix: catching of the error when a peer dependency for a Pug filter is not installed

## 3.6.3 (2024-03-14)

- fix: resolving asset files on windows

## 3.6.2 (2024-03-11)

- fix: avoid recompiling all entry templates after changes of a non-entry partial file, [pug-plugin issue](https://github.com/webdiscus/pug-plugin/issues/66)

## 3.6.1 (2024-03-08)

- fix: cannot find module 'nunjucks/src/object', introduced in v3.6.0

## 3.6.0 (2024-03-08) DEPRECATED

- feat: resolve resource files in an attribute containing the JSON value using the `require()` function,\
  source template:
  ```js
  <a href="#" data-image='{ "alt":"image", "imgSrc": require("./pic1.png"), "bgImgSrc": require("./pic2.png") }'> ... </a>
  ```
  generated HTML contains resolved output assets filenames:
  ```js
  <a href="#" data-image='{ "alt":"image", "imgSrc": "img/pic1.da3e3cc9.png", "bgImgSrc": "img/pic2.e3cc9da3.png" }'> ... </a>
  ```

## 3.5.5 (2024-03-03)

- fix: initialize the singleton of the Config only once

## 3.5.4 (2024-03-03)

- optimize: lazy load the plugin config file
- refactor: change the label in output: `html-bundler-webpack-plugin` => `HTML bundler plugin`
- refactor: optimize code for other plugins extending from this plugin.\
  For example: the [pug-plugin](https://github.com/webdiscus/pug-plugin) since the version `5.0.0` is extended from the `html-bundler-webpack-plugin` with Pug specifically settings.
- docs: add description how to use the `entry` plugin option as the array of the `EntryDescription`, e.g.:
  ```js
  {
    entry: [
      {
        filename: 'index.html', // output filename in dist/
        import: 'src/views/index.html', // template file
        data: { title: 'Homepage' }, // page specifically variables
      },
      {
        filename: 'news/sport.html',
        import: 'src/views/news/sport/index.html',
        data: { title: 'Sport' },
      },
    ],
  }
  ```

## 3.5.3 (2024-02-28)

- fix: correct parsing the data passed via query in JSON notation, e.g.: `index.ejs?{"title":"Homepage","lang":"en"}`
- fix: by parsing of the generated html ignore files already resolved via a preprocessor, e.g. pug
- fix(pug): resolve resource required in pug code and content, also outer tag attributes
- fix(pug): resolve images generated via `responsive-loader` when used query parameters with `,` and `&` separators
- test: add tests from pug-plugin

## 3.5.2 (2024-02-20)

- fix: when used TS then could not find a declaration file for module 'html-bundler-webpack-plugin'

## 3.5.1 (2024-02-20)

- fix(pug): correct resolving required resources in multiple pages

## 3.5.0 (2024-02-18)

- feat: add support for the `Pug` template engine.
  The `pug` preprocessor based on the [@webdiscus/pug-loader](https://github.com/webdiscus/pug-loader) source code 
  and has the same options and features.
- test: add pug tests
- docs: add documentation for using the pug

## 3.4.12 (2024-01-29)

- fix: serialization issue when used the `cache.type = 'filesystem'`
- fix: missing output js files after second run build when used the `cache.type = 'filesystem'`

## 3.4.11 (2024-01-22)

- fix: error by resolving url() in the CSS file defined in the entry option

## 3.4.10 (2024-01-16)

- fix: save the webmanifest files in the directory defined in the `faviconOptions.path` option

## 3.4.9 (2024-01-15)

- fix: use the favicons default options for the build-in FaviconsBundlerPlugin when no plugin options

## 3.4.8 (2024-01-15)

- fix: error by resolving `url(date:image...)` in CSS

## 3.4.7 (2024-01-09)

- fix: if the same CSS file is imported in many js files, then the CSS is extracted for the first issuer only, #68

## 3.4.6 (2024-01-02)

- fix: the `pathData.chunk.name` is undefined when the `js.filename` is a function, this bug was introduced in `3.4.5`

## 3.4.5 (2024-01-01)

- fix: the `pathData.filename` is undefined after changes when the `js.filename` is a function

## 3.4.4 (2023-12-28)

- fix: extract css from complex libs like MUI leads to an infinity walk by circular dependency, #59
- test: refactor tests

## 3.4.3 (2023-12-18)

- fix: favicon plugin causes a crash without an error explaining if no link tag is included

## 3.4.2 (2023-12-08)

- fix: watching changes in template function imported in JS

## 3.4.1 (2023-12-08)

- fix: runtime error using template function in JS when external data is not defined

## 3.4.0 (2023-12-03)

- feat: add support for the template function on the client-side for `ejs`
- docs: update readme
- test: add tests for compile mode

## 3.3.0 (2023-11-29)

- feat: add support for the template function on the client-side for `eta`

## 3.2.0 (2023-11-28)

- feat: add Twig preprocessor. Now you can use "best of the best" template engine. Enjoy ;-)

## 3.1.3 (2023-11-24)

- fix: fatal error when using the handlebars preprocessor (introduced in v3.1.2)
- fix: access `@root` variables in hbs `partial` helper inside the `each` block

## 3.1.2 (2023-11-24) DEPRECATED: the critical bug by using the handlebars preprocessor is fixed in the v3.1.3

- fix: access `@root` variables in hbs `partial` helper inside the `each` block

## 3.1.1 (2023-11-23)

- fix: define `js.test` field in `types.d.ts` as optional

## 3.1.0 (2023-11-22)

- feat: add support for the `template function` in JS runtime on the client-side.\
  For example:
  ```js
  import personTmpl from './partials/person.ejs';
  
  // render template function with variables in browser
  document.getElementById('person').innerHTML = personTmpl({ name: 'Walter White', age: 50});
  ```
  Template function works with preprocessors: `ejs`, `handlebars`, `nunjucks`.\
  **Note:** The `eta` (default preprocessor) doesn't support template function in JS on the client-side, use the `ejs` instead.
- feat: add CSS extraction from styles used in *.vue files.\
  For example, _MyComponent.vue_:
  ```html
  <template>
    ...
  </template>
  <script setup>
    ...
  </script>
  <!-- CSS will be extracted from the SCSS file into a separate *.css file -->
  <style src="./style.scss" lang="scss"></style>
  <!-- CSS will be extracted from the style tag into a separate *.css file -->
  <style>
    h1 {
      color: red;
    }
  </style>
  ```

## 3.0.3 (2023-11-13)

- fix: add the missing `plugins` directory to package
- chore: add usage example of the build-in favicons plugin

## 3.0.2 (2023-11-13) DEPRECATED, critical issue is fixed in v3.0.3

- fix: installation error 'Invalid tag name of the favicons package' (introduced in v3.0.0)

## 3.0.1 (2023-11-08)

- fix: add the root dir of the module to exports in the package.json
- test: update manual tests for using with the Eta version 3.x
- docs: update readme for live reloading

## 3.0.0 (2023-11-07)

- feat(BREAKING CHANGE): changed `postprocess` callback arguments and return\
  OLD:
  ```ts
  postprocess(content: string, info: TemplateInfo, compilation: webpack.Compilation): string | null;

  type TemplateInfo = {
    filename: string | ((pathData: PathData) => string);
    assetFile: string;
    sourceFile: string;
    outputPath: string;
    verbose: boolean | undefined;
  };
  ```
  When return `null` then the template processing was skipped.

  **NEW:**\
  Removed properties: `filename`, `verbose`. Added properties: `name`, `resource`.
  ```ts
  postprocess(content: string, info: TemplateInfo, compilation: webpack.Compilation): string | undefined;

  type TemplateInfo = {
    name: string; // the entry name
    assetFile: string; // the output asset filename relative to output path
    sourceFile: string;  // the source filename without a query
    resource: string; // the source filename including a query
    outputPath: string; // output path of assetFile
  };
  ```
  When return `null` or `undefined` then the content stay unchanged by `postprocess` and will be processed in next hooks/callbacks.
- feat: optimize `postprocess` callback option, moved from `renderManifest` sync hook to `processAssets` async hook
- feat: add `postprocess` hook
- feat: add `beforePreprocessor` hook
- feat: add `beforePreprocessor` callback option
- feat: add `preprocessor` hook
- feat: add `resolveSource` hook
- feat: add `beforeEmit` hook
- feat: add `beforeEmit` callback option
- feat: add `afterEmit` hook
- feat: add `afterEmit` callback option
- feat: add possibility to create own plugin using the hooks: `beforePreprocessor`, `preprocessor`, `resolveSource`, `postprocess`, `beforeEmit`, `afterEmit`
- feat: add the **first** plugin (plugin for bundler plugin :-) - `favicons-bundler-plugin` to generate and inject favicon tags for many devices.\
  For example:
  ```js
  const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
  const { FaviconsBundlerPlugin } = require('html-bundler-webpack-plugin/plugins');
  
  module.exports = {
    plugins: [
      new HtmlBundlerPlugin({
        entry: {
          index: './src/views/index.html',
        },
      }),
      // add the plugin to extend the functionality of the HtmlBundlerPlugin
      new FaviconsBundlerPlugin({
        faviconOptions: { ... }, // favicons configuration options
      }),
    ],
  };
  ```
  If you use the `favicons-bundler-plugin`, you need to install the [favicons](https://www.npmjs.com/package/favicons) module.

- feat: add possibility to get output CSS filename in JS via import a source style file with the `url` query.\
  This feature allows the dynamic load the CSS in JavaScript, for example:
  ```js
  function loadCSS(file) {
    const style = document.createElement('link');
    style.href = file;
    style.rel = 'stylesheet';
    document.head.appendChild(style);
  }
  
  loadCSS(require('./style.scss?url')); // <= dynamic load the source style file with `url` query
  ```
- feat: add `js.inline.attributeFilter` option to keep some original script tag attributes when JS is inlined.\
  For example, keep the `id` and `text/javascript` attributes by inlined `<script id="my-id">...inlined JS code...</script>`:
  ```js
  new HtmlBundlerPlugin({
    // ...
    js: {
      inline: {
        attributeFilter: ({ attributes, attribute, value }) => {
          if (attribute === 'type' && value === 'text/javascript') return true;
          if (attribute === 'id' && attributes?.type === 'text/javascript') return true;
        },
      },
    },
  }
  ```
- refactor: optimize inner processes for HTML rendering
- test: add tests for new features
- docs: add descriptions for new features

## 2.16.0-beta.3 (2023-10-29)

- feat: add `resolveSource` hook
- test: add a test as the example how to create a plugin using the `favicons` module

## 2.16.0-beta.2 (2023-10-24)

- fix: compute integrity for the current compilation only to isolate them by async tests
- fix: output exceptions for new callbacks
- test: add test for `beforePreprocessor` hook
- test: add test for `beforePreprocessor` callback
- test: add test for `preprocessor` hook
- test: add test for `beforeEmit` hook
- test: add test for `beforeEmit` callback
- test: add test for `afterEmit` hook
- test: add test for `afterEmit` callback

## 2.16.0-beta.1 (2023-10-23)

- feat: add `js.inline.keepAttributes` option to keep some original script tag attributes when JS is inlined
- feat(EXPERIMENTAL): add `afterEmit` callback, undocumented
- fix(EXPERIMENTAL, BREAKING CHANGE): rename `lazy` query to `url` to get output URL of CSS
  ```js
  // your code to add the CSS file dynamically
  function dynamicLoad(outputFilename) {
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = outputFilename;
    document.head.appendChild(style);
  }

  dynamicLoad(require('./style.scss?url')); // <= dynamic load the style file with `url` query
  ```
- chore: add usage example of image-minimizer-webpack-plugin

## 2.16.0-beta.0 (2023-10-21)

- feat(EXPERIMENTAL): add possibility to get output CSS filename in JS via import a style file with the `lazy` query.\
  **DON'T use it for production, it is just EXPERIMENTAL undocumented feature!**\
  This feature allows to lazy load the extracted CSS, for example:
  ```js
  function loadCSS(file) {
    const style = document.createElement('link');
    style.href = file;
    style.rel = 'stylesheet';
    document.head.appendChild(style);
  }
  
  loadCSS(require('./style.scss?lazy')); // <= dynamic load the source style file with `lazy` query
  ```
- feat(EXPERIMENTAL): add `beforePreprocessor` hook, undocumented
- feat(EXPERIMENTAL): add `beforePreprocessor` callback, undocumented
- feat(EXPERIMENTAL): add `preprocessor` hook, undocumented
- feat(EXPERIMENTAL, BREAKING CHANGE): rename `undocumented` experimental `afterCompile` callback to `beforeEmit`
- feat(EXPERIMENTAL): add `beforeEmit` hook, undocumented
- feat(EXPERIMENTAL): add `afterEmit` hook, undocumented
- fix: disable preprocessor when the value of the `preprocessor` plugin option is `false`

## 2.15.1 (2023-10-28)

- fix: error when used integrity with root publicPath, #42, #43

## 2.15.0 (2023-10-18)

- feat: add `parsedValue` argument as an array of parsed filenames w/o URL query, in the `filter()` function of the `sources`
- fix(BREAKING CHANGE): for `srcset` attribute the type of the `value` argument is now `string` (was as `Array<string>`), in the `filter()` function of the `sources`\
  Note: for `srcset` attribute you can use the `parsedValue` as an array instead of the `value`, the `value` contains now an original string
- docs: fix attributes type

## 2.14.4 (2023-10-12)

- fix: correct attributes type in the `filter()` function of the `sources` loader option
- refactor: improve code
- docs: fix attributes type

## 2.14.3 (2023-10-08)

- chore: update dependencies in examples
- docs: update readme

## 2.14.2 (2023-09-27)

- fix: pass correct entry data in the template when the same template used for many pages with different data, in `serve` mode

## 2.14.1 (2023-09-24)

- fix: remove unused `isEntry` property from the `info` argument of the `postprocess` callback
  the `isEntry` property was always true, because template is defined as an entrypoint
- chore: code cleanup
- chore: add examples of using `PureCSS` as a plugin for Webpack and for PostCSS
- docs: fix formatting in readme
- docs: fix some inaccuracies in readme

## 2.14.0 (2023-09-17)

- feat: add the `integrityHashes` hook to allow retrieving the integrity values
- test: add tests for the `integrityHashes` hook
- docs: update README

## 2.13.0 (2023-09-16)

- feat: add the `beforePreprocessor` callback option, called right before the `preprocessor`
- test: add tests for new option `beforePreprocessor`
- docs: update README

## 2.12.0 (2023-09-15)

- feat: remove support for the `webpack-subresource-integrity` plugin,
  because it works not optimized and contains Webpack deprecated code
- feat: add support for `subresource integrity` independent of other plugins.
  It was implemented own very compact, optimized and fast code to generate `integrity` for `link` and `script` tags.
- feat(changed behavior): the `integrity` option defaults is now `false` (in v2.11.0 was `auto` using `webpack-subresource-integrity` plugin)
- feat: extend the `integrity` option values with the object to pass additional `hashFunctions` option
- refactor: optimize code and improve performance for html parsing
- fix: remove comments of node module imported in dynamic imported chunks
- fix: correct content hash in the output JS filename when license comment is removed
- test: add tests for integrity
- test: remove the test strategy for node 14 on GitHub because the generated hashed test filenames are different from nodes 16, 18, 20
- chore: update dev dependencies
- docs: update README

## 2.11.0 (2023-09-05)

- feat: add support for the `webpack-subresource-integrity` plugin to include the [subresource integrity hash](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity)
- feat: add the `integrity` option to enable/disable the support for `webpack-subresource-integrity` plugin

## 2.10.1 (2023-09-02)

- fix: avoid generation of empty css files when source styles are imported in TS file

## 2.10.0 (2023-09-01)

- feat: add Handlebars helpers `assign`, `partial` and `block` to extend a template layout with blocks
- chore: add `handlebars-layout` example
- docs: update README

## 2.9.0 (2023-08-27)

- feat(experimental): add support the Webpack `cache.type` as `filesystem`. This is yet an alpha version of the feature.
  You can try it, but if that doesn't work, just use the default `cache.type` as `memory`.
- feat: remove the `json5` dependency, take only the parser code from this package, remove unused code from it and optimize it for use with the plugin
- fix: resolve output asset filenames without the needless index `.1`, like `index.1.js`, when used the same base filename for template and js files.
  For example, if the source files with the same base name `src/index.html` and `src/index.js` were used, then `dist/index.html` and `dist/index.1.js` were created,
  because the entry name used for compilation must be unique. This case is fixed.
- test: add tests for features and fixes
- test: remove unused code in test suits
- chore: update dev dependencies
- docs: update README

## 2.8.0 (2023-08-15)

- feat: add watching for changes (add/remove/rename) in handlebars helpers without restarting Webpack
- feat: change the default value of the `hotUpdate` option to `false`. _This is not breaking change._\
  If you already have a js file, this setting should be `false` as Webpack automatically injects the hot update code into the compiled js file.
  Enable this option only if you don't have a referenced source file of a script in a html template.
- docs: update README

## 2.7.0 (2023-08-13)

- feat: add `js.inline.chunk` and `js.inline.source` options to inline only js chunks matching regular expressions
- fix: if the html outputPath is a relative path, it is relative to `output.path`, not to CWD
- fix: resolve `asset` module by 2nd `npm start` when `cache.type` is `'filesystem'` (using `memory` type was OK)
- chore: update the `eta` to the latest `v3.1.0` version
- docs: update README

## 2.6.1 (2023-08-09)

- fix: when the Webpack `output.path` option is undefined, set the default path as CWD + `/dist`

## 2.6.0 (2023-08-09)

- feat: add the `css.chunkFilename` option for output filename of non-initial chunk files
- feat: add the `hotUpdate` option to enable/disable live reload in serve/watch mode
- fix: missing an output css file when the same style file is imported in js and linked in html
- chore: add the "hello world" example
- chore: add simple-site example with automatically processing many HTML templates
- chore: add the Handlebars example
- chore: add react-app example, ejected from `create-react-app` (alpha version)

## 2.5.1 (2023-08-04)

- fix: missing output html file after renaming template file in watch mode when using entry as a path
- chore: add example for bootstrap
- chore: update npm packages
- docs: update README

## 2.5.0 (2023-07-30)

- feat: add the reference for `data` in the plugin options.\
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
  The old syntax is still valid:
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
- refactor: code refactoring
- test: add more tests
- docs: update README

## 2.4.0 (2023-07-28)

- feat: add support for Webpack CSS optimization
- fix: resolving the same resources used in imported styles on different pages

## 2.3.1 (2023-07-27)

- fix: add the missing types.d.ts file to npm package

## 2.3.0 (2023-07-27)

- feat: add support for TS
- docs: update README

## 2.2.3 (2023-07-25)

- fix: correct importing styles in JS when used serve mode

## 2.2.2 (2023-07-25)

- fix: importing the raw content of the html file in js

## 2.2.1 (2023-07-23)

- fix: load the Handlebars's partials with allowed extensions only, #24

## 2.2.0 (2023-07-21)

- feat: add the references for `preprocessor` and `preprocessorOptions` in the plugin options.\
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
  The old syntax is still valid:
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
- feat: improve performance when using the same style file in many templates
- fix: correct order of styles when the same style is imported in many nested js files
- chore: update npm packages

## 2.1.1 (2023-07-14)

- chore: fix the image path in readme

## 2.1.0 (2023-07-14)

- feat: add watching for create/rename/delete files in the entry path, without restarting Webpack
- fix: watching for create/rename/delete JS files
- fix: add to watching only parent directories, ignore all subdirectories
- fix: generate correct output filenames for assets in deep nested pages after changes in serve mode
- fix: in some cases is missing the hot-update.js file after changes in serve mode
- fix: missing slash in output filename when publicPath is an url without finishing slash
- test: add tests for new features and bug fixes
- chore: update npm packages
- docs: update readme

## 2.0.1 (2023-06-23)

- fix: watching for create/rename Handlebars partials
- chore: update npm packages

## 2.0.0 (2023-06-21)

- feat: add support for importing style files in JavaScript.
- feat(BREAKING CHANGE): upgrade the default preprocessor `eta` to next major version 3.0.
  Perhaps you may need to migrate your Eta templates to v3 syntax.
- refactor: optimize source code
- fix: some invisible rare bug fixes
- test: add tests for new features and bug fixes
- chore: add code example how to use the tailwindcss
- chore: update npm packages
- docs: update readme

## 1.18.0 (2023-04-26)

- feat: add the `js.chunkFilename` option
- fix: do not delete split chunks from compilation loading dynamically
- fix: allow to define the `as` property of the preload option in the attributes, e.g.:
  ```js
  {
    test: /\.(ttf|woff2?)$/,
    attributes: { as: 'font', crossorigin: true },
  },
  ```

## 1.17.3 (2023-04-24)

- fix: correct parsing of a query where the key does not contain a value, e.g. `?enable&size=100`
- refactor: code refactoring and optimization
- chore: small performance improvement due to code optimization
- chore: spelling corrections in code
- chore: update dev dependencies
- test: refactor tests to async run
- docs: update readme

## 1.17.2 (2023-04-21)

- fix: live reload after changes if a template contains a commented out script
- fix: issue if a CSS file is imported in SCSS with a filename, including the `.css` extension, e.g. `@import 'npm-module/styles.css'`
- fix: issue if used the copy plugin which copies an HTML file

## 1.17.1 (2023-04-19)

- fix: pass data via query parameters into template imported in JS file\
  _template.html_
  ```html
  <div>Hello <%= name %>!</div>
  ```
  _app.js_
  ```js
  import tmpl from './template.html?name=World'; // exports '<div>Hello World!</div>'
  document.body.innerHTML = html;
  ```
- test: add test for import a template in JS as rendered HTML string
- docs: update readme

## 1.17.0 (2023-04-17)

- feat: allow the `data` loader option as a filename for dynamically loading global template variables
- feat: allow the `data` entry-point option as a filename for dynamically loading page template variables
- fix: inject hot update js file after changes when the template has no scripts
- docs: add description of new features

## 1.16.0 (2023-04-15)

- feat: new compact verbose output, all resources are grouped by their issuers
- feat: remove `js.verbose` option, because it makes no sense with new verbose output (no breaking change)
- feat: remove `css.verbose` option, because it makes no sense with new verbose output (no breaking change)
- feat: improve performance
- fix: display loader dependencies only once in the watch mode
- fix: correct inline CSS and JS when is used minify, #8
- refactor: optimize processing for inline resources and preload tags
- chore: update packages
- docs: update readme

## 1.15.0 (2023-04-05)

- feat: add the `views` option for the `nunjucks` preprocessor
- feat: allow to pass the configuration options for the `nunjucks` preprocessor
- feat: automatically add to watching directories defined in the preprocessor options `root` `views` `partials`\
  for example, several template directories are not subdirectories, but are on the same level:
  ```js
  preprocessorOptions: {
    root: 'pages/',
    views: ['templates/layouts/', 'templates/includes/'],
    partials: ['templates/partials/'],
  }
  ```

## 1.14.0 (2023-04-04)

- feat: add `root` loader option to allow use the `/` as root path to source directory for asset files:
  ```js
  new HtmlBundlerPlugin({
    loaderOptions: {
      root: path.join(__dirname, 'src'),
    },
  }),
  ```
  to resolve the `/src/images/apple.png` source file, use the root path `/`:
  ```html
  <img src="/images/apple.png" />
  ```
- refactor: optimize code
- test: add tests for new features
- docs: add description of new features

## 1.13.0 (2023-04-03)

- feat: add `preload` option to auto generate preload tags for resources such as font, image, video, audio, script, style, etc.
- feat: allow resolving all duplicate scripts and styles in the template so that they can be preloaded with a link tag
- feat: remove warnings for duplicate script and styles in the template
- fix: set the default `removeRedundantAttributes: false` minify option to prevent styling bug when input "type=text" is removed
- chore: update dev dependencies
- test: add tests for new features
- docs: add description of new features

## 1.12.0 (2023-03-29)

- feat: add `minifyOptions` to customize minification when the `minify` options is `auto`, FR #5
- feat: add `helpers` value as array of a relative or absolute path to helper directories for the `handlebars` preprocessor
- fix: allow the `partials` values to be relative paths for the `handlebars` preprocessor
- test: add tests for new features
- docs: add description of new features

## 1.11.0 (2023-03-27)

- feat: add the entry option value as a relative or absolute path to pages.\
  Template files matching the `test` option are read recursively from the path.\
  For example, there are files in the `./src/views/pages/`
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
  });
  ```
  Internally, the entry is created with the templates matching to the `test` option:
  ```js
  {
    index: 'src/views/pages/index.html', // => dist/index.html
    'about/index': 'src/views/pages/about/index.html', // => dist/about/index.html
    'news/sport/index': 'src/views/pages/news/sport/index.html', // => dist/news/sport/index.html
  }
  ```
  The output HTML filenames keep their source structure relative to the entry path.
- fix: display an original error stack by nested exceptions

## 1.10.0 (2023-03-26)

- feat: add the `data` loader option to pass global data into all templates\
  Note: use the `data` property of the entry option to pass data only in one template
  ```js
  new HtmlBundlerPlugin({
    entry: {
      index: {
        import: './src/home.html',
        data: {
          title: 'Home', // overrides the `title` defined in the loader data
        },
      },
      about: './src/about.html',
    },
    loaderOptions: {
      data: {
        // <= NEW option to pass global variables for all pages
        title: 'Default Title',
        globalData: 'Global Data',
      },
    },
  });
  ```
- feat: add default template extensions: `.njk`.\
  The following default template extensions are now supported: `/\.(html|ejs|eta|hbs|handlebars|njk)$/`
- feat: add `preprocessor` value as string `nunjucks` to use the preconfigured Nunjucks compiler (`nunjucks` package needs to be installed)
  ```js
  new HtmlBundlerPlugin({
    entry: {
      index: './src/views/pages/home.njk',
    },
    loaderOptions: {
      preprocessor: 'nunjucks', // <= NEW 'nunjucks' value
      preprocessorOptions: {
        // async: true, // dafaults is false, to compile asynchronous templates set as true
      },
    },
  }),
  ```
- fix: handle unsupported value of the preprocessor option
- refactor: optimize preprocessor code
- chore: update dev dependencies
- docs: add description of new features

## 1.9.0 (2023-03-21)

- feat: add `preprocessorOptions` to the loader option to define a custom config for the default preprocessor.\
  For all options of the default preprocessor see https://eta.js.org/docs/learn/configuration#big-list-of-configuration-options. \
  Usage example:

  ```js
  new HtmlBundlerPlugin({
    entry: {
      index: './src/views/pages/home.html',
    },
    loaderOptions: {
      preprocessorOptions: {
        // root path for includes with an absolute path (e.g., /file.html), defaults is process.cwd()
        root: path.join(process.cwd(), 'src/views/'),
        // directories that contain partials, defaults is undefined
        views: [
          path.join(process.cwd(), 'src/views/layouts'),
          path.join(process.cwd(), 'src/views/partials'),
        ],
      },
    },
  }),

  ```

- feat: add resolving a template partial relative to template.
  For example, there are templates:
  ```
  src/views/pages/home.html - the main template
  src/views/pages/includes/gallery.html - the partial used in the main template
  ```
  You can include the `src/views/pages/includes/gallery.html` partial in `home.html` using a relative path:
  ```html
  <%~ includeFile('includes/gallery.html') %>
  ```
- feat: add default template extensions: `.hbs` and `.handlebars`.\
  The following default template extensions are now supported: `/\.(html|ejs|eta|hbs|handlebars)$/`
- feat: add `preprocessor` value as string `ejs` to use the preconfigured EJS compiler (`ejs` package needs to be installed)
- feat: add `preprocessor` value as string `handlebars` to use the preconfigured Handlebars compiler (`handlebars` package needs to be installed).\
  The `preprocessorOptions` has `Handlebars.compile` option plus additional options for the build-in `include` helper:
  - `root {string}` - root path for includes with an absolute path (e.g., /file.html), defaults `process.cwd()`
  - `views {string|Array<strings>}` - directory or directories that contain templates.\
    For example:\
    _preprocessorOptions_
    ```js
    {
      root: path.join(__dirname, 'src/views'),
      views: [
        path.join(__dirname, 'src/views/includes'),
      ],
    }
    ```
    _include a partial without an extension_\
    `{{ include '/partials/footer' }}` - the root path relative to defined in the `root` option\
    `{{ include 'gallery' }}` - the relative path to defined in the `views` option
  - The following extensions will be automatically resolved by default: `.html`, `.hbs`, `.handlebars`.\
    Other options:
  - `partials {Object.<[name: string], [file: string]>}` - Use the `partials` as an object to define partials manually.\
     The key is a `partial name`, the value is an absolute path of the partial.\
     For example:
    ```js
    partials: {
      gallery: path.join(__dirname, 'src/views/includes/gallery.html'),
      'menu/nav': path.join(__dirname, 'src/views/partials/menu/nav.html'),
      'menu/top/desktop': path.join(__dirname, 'src/views/partials/menu/top/desktop.html'),
    },
    ```
  - `partials {Array<string>}` - Use `partials` as an array of absolute paths to automatically find partials in these paths.\
    Files with the following extensions will be found recursively in the given paths: `*.html`, `*.hbs`, `*.handlebars`.\
    For example:
    ```js
    partials: [
      path.join(__dirname, 'src/views/includes'),
      path.join(__dirname, 'src/views/partials'),
    ],
    ```
    **Note:** the `partial name` is a complete relative path to a file without an extension.
    This is different from plugins, in which Id is a base directory and filename without extension.
  - `helpers {Object.<[name: string], function()>}` - the key is a helper name, the value is the helper function.
- fix: inline a style from the `link` tag with the attribute `as="style"`, e.g.:
  ```html
  <link href="style.css?inline" rel="preload" as="style" />
  ```
- fix: resolve a script in the `link` tag with the `as="script"` or the `rel="modulepreload"` attributes, e.g.:
  ```html
  <link href="script.js" rel="prefetch" as="script" />
  <link href="script.js" rel="preload" as="script" />
  <link href="script.js" rel="modulepreload" />
  ```
- fix: keep output filename extension, different from `.html`, e.g. `[name].php`, #4
- refactor: optimize code
- test: add tests for new features
- docs: add description of new features

## 1.8.0 (2023-03-18)

- feat: add `asset/source` support for SVG to inline it in HTML
- test: add test to inline SVG using the `asset/source` type

## 1.7.0 (2023-03-17)

- feat: add hot update file to HTML in serv mode when there is no script in template, to reload page after changes
- chore: update dev dependencies
- docs: update readme

## 1.6.5 (2023-03-16)

- fix: extra fix for yarn fans. Yarn can't correctly install packages form standard npm peerDependencies.
  move the enhanced-resolve from peerDependencies into dependencies, it is needed for yarn only
- test: add test for resolving the source manifest.json

## 1.6.4 (2023-03-15)

- fix: add the enhanced-resolve to peerDependencies
- chore: update dev dependencies
- docs: add links to demo examples

## 1.6.3 (2023-03-13)

- fix: correct rebuild the node modules specified in a template or imported in a script, after changes in the template of in the script
- chore: update dev dependencies
- test: add test for rebuild the node modules

## 1.6.2 (2023-03-09)

- fix: add missing node modules to compilation after rebuild
- fix: resolve resources in the entry file containing a query
- test: add tests for fixes

## 1.6.1 (2023-03-07)

- fix: correct inline JS when used split chunks
- refactor: optimize code for windows, clean up from needless code
- test: add test for inline JS with split chunks
- test: refactor and clean up tests

## 1.6.0 (2023-03-06)

- feat: add `css.inline` option, replaces the functionality of `style-loader`.\
  The values of `inline` option:
  - false - extract processed CSS in an output file, defaults
  - true - inline processed CSS into HTML via `style` tag
  - 'auto' - in development mode - inline CSS, in production mode - extract in a file
- feat: add `js.inline` option to inline extracted JS into HTML
- feat: add to the `?inline` query parameter for JS and CSS files the values: `false`, `true`, `'auto'`.\
  Note: the query parameter takes precedence over global `js.inline` or `css.inline` option.
- fix: emit a loader exception as an instance of Error instead a string
- fix: throw exception when the loader is used but the `HtmlBundlerPlugin` is not initialized in Webpack plugins option
- refactor: optimize and improve the code
- test: add tests for inline CSS and JS
- docs: update readme with new features

## 1.5.2 (2023-03-03)

- fix: correct loader export when template contain CRLF line separators
- fix: correct resolve `auto` value for `verbose` option

## 1.5.1 (2023-03-03)

- fix: add LF after each generated script tag in dev mode for pretty HTML formatting

## 1.5.0 (2023-03-02)

- feat: add the `loaderOptions` to the plugin option to allow defining loader options with the plugin.
  No need to additionally specify the template loader in `module.rules`.
  You can specify plugin and loader options in one place, in plugin options.
- feat(experimental): add the `cacheable` loader option to disable caching of loader results, can be useful in a specific use case
- fix: the default `watchFiles.paths` value is now a first-level subdirectory of a template, relative to root context.
  E.g. the template path is `./src/views/index.html` then the default watching dir is `./src`.
- fix: watching a changes in template partials
- test: add manual test for watching changes in partials used in multiple page configuration
- docs: update readme

## 1.4.0 (2023-02-26)

- feat: display watch files in watch/serv mode when verbose option is enabled
- feat: add `auto` value for the `verbose` option
- refactor: improve the code structure
- test: add tests for watch mode
- chore: add GitHub test badge
- docs: improve readme

## 1.3.1 (2023-02-24)

- fix: after an error, restore watching without restarting
- refactor: improve the loader code

## 1.3.0 (2023-02-23)

- feat: add `watchFiles` option to configure paths and files to watch file changes

## 1.2.1 (2023-02-22)

- fix: resolve correct output asset path when the publicPath is a URL
- docs: add description of important Webpack options used to properly configure the plugin

## 1.2.0 (2023-02-21)

- feat: set the config option `root` of the Eta preprocessor as current working dir by defaults,
  now you can use the template root path, e.g.:
  ```html
  <%~ includeFile('/src/views/partials/header') %>
  ```
- test: add test `async` preprocessor for Eta
- docs: add `back to contents` navigation in readme, improve readme

## 1.1.2 (2023-02-20)

- fix: resolving of assets under Windows
- docs: update readme

## 1.1.1 (2023-02-19)

- fix: handling an issue when used an async preprocessor
- refactor: optimize handling of loader options
- test: add test case for issue in async preprocessor
- docs: improve readme

## 1.1.0 (2023-02-18)

- feat: add support for both `async` and `sync` preprocessor, the preprocessor should return a string or a promise.
  This can be used for async templating engines like `LiquidJs`, `EJS`, `Nunjucks`.
- feat: add resolving of `href` attribute in the SVG `<image>` and `<use>` tags, by defaults
  ```html
  <svg><image href="image.png"></image></svg> <svg><use href="icons.svg#home"></use></svg>
  ```
- feat: improve error handling in the loader
- fix: add only unique optional sources attribute
- test: add async tests for templating engines LiquidJS, EJS, Nunjucks
- core: update dev packages
- docs: add in readme description of new features

## 1.0.0 (2023-02-14) Stable release

### Changes:

Defaults, HTML templates defined in the entry are processed via Eta (same EJS syntax) templating engine.
If you have pure HTML file you can disable this processing to save the compilation time:

```js
  {
    test: /\.html$/,
    loader: HtmlBundlerPlugin.loader,
    options: {
      preprocessor: false, // <= disable default processing
    },
  },
```

### Features:

- feat: add the default template loader in Webpack `module.rule`.\
  In most cases, the default loader options are used.
  You can omit the template loader in `module.rule`,
  then the default template loader will be added automatically:
  ```js
  {
    test: /\.(html|ejs|eta)$/,
    loader: HtmlBundlerPlugin.loader,
  },
  ```
- feat: add the `Eta` templating engine (smaller and faster alternative to `EJS` with same syntax) as the default preprocessor.
  If no preprocessor option is specified, Eta is used in the preprocessor.
- feat: add `minify` option
- test: add tests for the default loader and the default preprocessor

## 0.10.1 (2023-02-12)

- fix: error by display verbose inlined module
- test: add verbose test when a module is inlined
- test: add manual test for multiple pages with inlined resources

## 0.10.0 (2023-02-11)

- feat: improve verbose information output for extracted scripts
- fix: resolve scripts in diff pages generated from one template
- fix: warning for duplicate files when many html files are generated from one template
- refactor: optimise code structure, code cleanup
- refactor: optimize code for processing of scripts
- test: add base and advanced test template for new issues
- chore: add GitHub CONTRIBUTING.md
- chore: add GitHub PULL_REQUEST_TEMPLATE.md
- chore: add GitHub ISSUE_TEMPLATE
- chore: add SECURITY.md
- docs: update content structure, improve readme content

## 0.9.1 (2023-02-08)

- fix: resolve filename containing a URI fragment, e.g.:
  ```html
  <use href="./icons.svg#home"></use>
  ```
- fix: resolve assets when the same file is used on many pages generated from the same template
- fix: pass data to template after changes when using HMR
- fix: by verbose display a file path relative by working directory instead of an absolute path
- refactor: code optimisation
- test: add tests for bugfixes
- docs: update readme

## 0.9.0 (2023-02-04)

- BREAKING CHANGE: the 3rd argument `data` of the `preprocessor` has been moved to the 2nd argument as a property\
  `v0.9.0`: `preprocessor: (content, { resourcePath, data }) => {}` <= NEW syntax\
  `v0.8.0`: `preprocessor: (content, { resourcePath }, data) => {}` <= old syntax
- fix: avoid an additional query param for internal use in the module's `resource` property
- fix: remove info comments before inlined SVG
- docs: add description how to pass data into template using new option `entry`

## 0.8.0 (2023-02-01)

- feat: add `entry` plugin option, this option is identical to Webpack entry plus additional `data` property
- feat: add 3rd `data` argument of the `preprocessor` to pass template specific data:

  ```js
  module.exports = {
    plugins: [
      new HtmlBundlerPlugin({
        entry: {
          // <= NEW `entry` option
          index: {
            import: 'src/views/template.html',
            data: {
              // <= NEW `data` property
              title: 'Home',
            },
          },
        },
      }),
    ],

    module: {
      rules: [
        {
          test: /\.(html)$/,
          loader: HtmlBundlerPlugin.loader,
          options: {
            preprocessor: (content, { resourcePath }, data) => {
              // <= NEW 3rd `data` argument
              return render(content, data);
            },
          },
        },
      ],
    },
  };
  ```

- feat: support split chunk

## 0.7.0 (2023-01-29)

- feat: add `postprocess` plugin option
- fix: parse srcset attribute containing a query as JSON5, e.g. `srcset="image.png?{sizes: [100,200,300], format: 'jpg'}"`
- test: add tests for options, responsive images, exceptions
- docs: update readme

## 0.6.0 (2023-01-28)

- feat: add `sources` loader option to define custom tags and attributes for resolving source files
- feat: add `extractComments` plugin option to enable/disable saving comments in \*.LICENSE.txt file
- feat: add to default resolving the `data` attribute of `object` tag
- feat: add supports the `responsive-loader`
- fix: resolve exact attribute name w/o leading wildcard
- fix: resolve mutiline attributes
- fix: resolve mutiline values in srcset attribute
- test: add tests for new options, messages
- docs: update readme

## 0.5.1 (2023-01-24)

- refactor: optimize code
- test: add test for usage `Nunjucks` template engine
- docs: update readme for usage the multipage configuration with `Nunjucks` template engine

## 0.5.0 (2023-01-22)

- feat: add `test` plugin option to process entry files that pass test assertion
- feat: add `preprocessor` loader option to allow pre-processing of content before handling
- test: add test for usage `Handlebars` template engine
- docs: update readme with new features

## 0.4.0 (2023-01-20)

- feat: add support for `<input>` `<audio>` `<video>` `<track>` tags
- fix: automatic publicPath must be empty string when used HMR
- fix: corrupted inline JS code when code contains `$$` chars chain

## 0.3.1 (2023-01-19)

- refactor: optimize parsing of source
- chore: update dev packages
- docs: update readme

## 0.3.0 (2023-01-18)

- feat: inline binary images, e.g. PNG
- feat: inline SVG images
- fix: resolve href in the `<link>` tag with the attribute `type="text/css"` as the style file

## 0.2.1 (2023-01-16)

- fix: resolving inlined styles on windows

## 0.2.0 (2023-01-14)

- feat: add supports for the inline CSS in HTML
- feat: add supports for the inline JS in HTML
- test: add test for new features
- docs: update readme

## 0.1.0 (2023-01-12)

First beta release:

- feat: handle HTML files from webpack entry
- feat: resolve the Webpack alias in the source file name
- feat: add `js` plugin option to extract JavaScript files from source scripts loaded in HTML via a `<script>` tag and generates a separate file for it
- feat: add `css` plugin option to extract CSS files from source styles loaded in HTML via a `<link>` tag and generates a separate file for it
- feat: process the images, fonts from sources loaded via `<link>`, `<img>` or `<source>` tags and generates a separate file for it
- feat: resolve and extracts images from sources loaded via `url()` in a style (css, scss)
- feat: resolve auto `publicPath`

## 0.0.1-beta.0 (2023-01-07)

- docs: announcement of the plugin
