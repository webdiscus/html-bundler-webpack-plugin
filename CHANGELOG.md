# Change log

## 0.9.1 (2023-02-08)
- fix: correctly resolve SVG filename with fragment in `use` tag
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
- feat(BREAKING CHANGE): the 3rd argument `data` of the `preprocessor` has been moved to the 2nd argument as a property\
  `v0.9.0`: `preprocessor: (content, { resourcePath, data }) => {}` <= NEW syntax\
  `v0.8.0`: `preprocessor: (content, { resourcePath }, data) => {}` <= old syntax
- fix: avoids an additional query param for internal use in the module's `resource` property
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
- fix: parsing srcset attribute containing a query as JSON5, e.g. `srcset="image.png?{sizes: [100,200,300], format: 'jpg'}"`
- test: add tests for options, responsive images, exceptions
- docs: update readme

## 0.6.0 (2023-01-28)
- feat: add `sources` loader option to define custom tags and attributes for resolving source files
- feat: add `extractComments` plugin option to enable/disable saving comments in *.LICENSE.txt file
- feat: add to default resolving the `data` attribute of `object` tag
- feat: add supports the `responsive-loader`
- fix: resolves exact attribute name w/o leading wildcard
- fix: resolves mutiline attributes
- fix: resolves mutiline values in srcset attribute
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
- feat: added support for `<input>` `<audio>` `<video>` `<track>` tags
- fix: automatic publicPath must be empty string when used HMR
- fix: corrupted inline JS code when code contains '$$' chars chain

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
First release:
- feat: handles HTML files from webpack entry
- feat: resolving the Webpack alias in the source file name
- feat: add `js` plugin option to extract JavaScript files from source scripts loaded in HTML via a `<script>` tag and generates a separate file for it
- feat: add `css` plugin option to extract CSS files from source styles loaded in HTML via a `<link>` tag and generates a separate file for it
- feat: processes the images, fonts from sources loaded via `<link>`, `<img>` or `<source>` tags and generates a separate file for it
- feat: resolves and extracts images from sources loaded via `url()` in a style (css, scss)
- feat: support auto `publicPath`

## 0.0.1-beta.0 (2023-01-07)
- docs: announcement of the plugin
