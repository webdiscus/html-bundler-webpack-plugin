# Subresource integrity hash

Use the [HTML Builder Plugin](https://github.com/webdiscus/html-bundler-webpack-plugin) for Webpack
to compile and bundle source Sass and JavaScript in HTML.

This is the example how to include the [subresource integrity hash](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) into `link` and `script` tags
using the [webpack-subresource-integrity](https://www.npmjs.com/package/webpack-subresource-integrity) plugin.

## View and edit in browser

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/edit/webpack-integrity-hvnfmg?file=webpack.config.js)

## How to use

```sh
git clone https://github.com/webdiscus/html-bundler-webpack-plugin.git
cd examples/integrity/
npm install
npm run build
```

Open generated `dist/index.html`. The `link` and `script` tags will contain the `integrity` attribute with a hash.

## Note

The integrity hash is generated only in `build` mode. By `watch` or `serve` mode, it will not be generated.
