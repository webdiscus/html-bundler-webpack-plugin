# Subresource integrity hash

Use the [HTML Builder Plugin](https://github.com/webdiscus/html-bundler-webpack-plugin) for Webpack
to compile and bundle source Sass and JavaScript in HTML.

This is the example how to include the [subresource integrity hash](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) into `link` and `script` tags.

## View and edit in browser

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/edit/webpack-integrity-hvnfmg?file=webpack.config.js)

## How to use

```sh
git clone https://github.com/webdiscus/html-bundler-webpack-plugin.git
cd examples/integrity/
npm install
npm run view
```

Open generated `dist/index.html`. The `link` and `script` tags will contain the `integrity` attribute with a hash.

> **Note**
>
> The integrity hash is generated when using webpack `build` in the `production` mode.
> When using webpack `watch` or `serve`, no hashes will be generated because it doesn't make sense.
