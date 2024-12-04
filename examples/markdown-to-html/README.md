# Markdown to HTML

Use the [HTML Builder Plugin](https://github.com/webdiscus/html-bundler-webpack-plugin) for Webpack to render Markdown `*.md` files to HTML.

Required to install additional dependencies:

- markdown-it (render Markdown)
- prismjs (highlighting)
- parse5 (highlighting dependency)
- github-markdown-css (GitHub styles)
- handlebars (optional, if not used default template engine `eta`)

> **Note**
> 
> The template engines supports Markdown: `eta`, `ejs`, `handlebars`, `pug`.
> This example uses the `handlebars` template engine to load the markdown file.

## View and edit in browser

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/edit/markdown-to-html-webpack?file=webpack.config.js)

## How to use

```sh
git clone https://github.com/webdiscus/html-bundler-webpack-plugin.git
cd examples/markdown-to-html/
npm install
npm run view
```
