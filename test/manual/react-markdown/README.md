# Issue

When used the `react-markdown` module in the `development` mode,
the Webpack generate JS code from the source code containing comments.
The `react-markdown` module contains `invalid inline-JS` comments, e.g.:

```js
/**
 * DOM clobbering is this:
 * ...
 * <script>alert(x) // `x` now refers to the DOM `p#x` element</script>
 */
```

This comment is valid in a JS file, but not in `inline-JS`,
because the inline-JS code is already inside the `<script>...</script>` tag.

The generated HTML with inlined source JS code including `invalid` comment:
```js
<html>
<head>
</head>
<body>

  <script>
    /**
    * DOM clobbering is this:
    * ...
    * <script>alert(x) // `x` now refers to the DOM `p#x` element</script>
    */
    // JavaScript code ...
  </script>

</body>
</html>
```

The `<script>...</script>` in JS-comment breaks the HTML.

# Workarounds

1. When you get this issue, don't use the `js.inline` option as `'auto'` or `true` in `development` mode for such `inline-unsave` JS modules.


2. If you want to inline JS code, use the `production` mode by `webpack serve/watch` to remove all `unsave` comments in inlined JS code:

_package.json_
```js
"scripts": {
   "start": "webpack serve --mode development",
   "start:prod": "webpack serve --mode production", <-- use production mode
   "watch": "webpack watch --mode development",
   "build": "webpack --mode=production --progress"
},
```

_webpack.config.js_

```js
module.exports = {
  mode: 'production',
  // ...
}
```

_Start without error_
```
npm run start:prod
```

# TODO

## Idea

Add the new `js.inlineOptions` option.

In this option will be available the possibility to remove comments from inlined JS code, e.g.:

```js
new HtmlBundlerPlugin({
  entry: {
    index: './src/views/index.html',
  },

  js: {
    filename: 'js/[name].[contenthash:8].js',
    inline: true, // or 'auto'
    inlineOptions: {
      removeComments: true, // remove all comments from inlined JS code to avoid parsing errors
    },
  },

  //verbose: true,
}),
```

## Penalty
If you use `sourceMap` for JS code, it will not work, because the `sourceMap` is generated before we remove comments.
It means, the `sourceMap` will be invalid.
For performance reason, I don't want to recalculate the `sourceMap` for modified inlined JS-code.


# P.S.
For performance reason, I don't see a sense automatically to convert HTML reserved chars in comments of inlined JS code for a very very rare case.

Using only `react` and `react-markdown`, the Webpack generate 2.5 MB code in `development` mode.
If we replace all HTML-chars in JS, this will drastic decrease performance in `development` mode.
