# Inline multiple SVG files w/o ID collision

This is an example how to inline the same SVG file containing an ID many times,
where will be generated unique ID used in inlined SVG to prevent IDs collision.

## Solution

We can use the `svgo-loader` and an own `uniqueIds` svgo plugin to generate an unique ID.
In the HTML each SVG file must have an unique URL query to force run `svgo-loader` for each SVG.

For example:

```html
<img src="./icon.svg?1" />
<img src="./icon.svg?2" />
...
```

Generated HTML will contain inlined SVG with unique IDs:

```html
<svg xmlns="http://www.w3.org/2000/svg" viewBox=" 0 0 100 100 " width="100">
  <defs><ellipse cx="50%" cy="50%" rx="42%" ry="42%" fill="red" id="id-1__circle" /></defs>
  <g><use href="#id-1__circle" /></g>
</svg>

<svg xmlns="http://www.w3.org/2000/svg" viewBox=" 0 0 100 100 " width="100">
  <defs><ellipse cx="50%" cy="50%" rx="42%" ry="42%" fill="red" id="id-2__circle" /></defs>
  <g><use href="#id-2__circle" /></g>
</svg>
```

Use the [HTML Builder Plugin](https://github.com/webdiscus/html-bundler-webpack-plugin) for Webpack
to compile and bundle source files in HTML.

## View in browser

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/edit/inline-svg-wo-ids-collision?file=README.md)

## How to use

```sh
git clone https://github.com/webdiscus/html-bundler-webpack-plugin.git
cd examples/inline-svg-unique-id
npm install
npm start
```
