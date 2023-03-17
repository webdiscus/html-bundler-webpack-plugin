# Change log

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
- feat: add to the `?inline` query parameter  for JS and CSS files the values: `false`, `true`, `'auto'`.\
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
  <svg><image href="image.png"></image></svg>
  <svg><use href="icons.svg#home"></use></svg>
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
- fix: resolve SVG filename with fragment in `use` tag
  ```html
  <svg width="24" height="24">
    <use href="./icons.svg#home"></use>
  </svg>
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
        entry: { // <= NEW `entry` option
          index: {
            import: 'src/views/template.html',
            data: { // <= NEW `data` property
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
            preprocessor: (content, { resourcePath }, data) => { // <= NEW 3rd `data` argument
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
- feat: add `extractComments` plugin option to enable/disable saving comments in *.LICENSE.txt file
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
