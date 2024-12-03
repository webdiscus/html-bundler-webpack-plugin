<h1 align="center">Highlighting code blocks</h1>
<h3 align="center">Theme: <a href="code-dark.html">dark</a> | <a href="code-light.html">light</a></h3>

[<< back to home](index.html)

---

You can add an optional language identifier to enable syntax highlighting in your code block.

For example, to syntax highlight Ruby code:
````
```ruby
require 'redcarpet'
markdown = Redcarpet.new("Hello World!")
puts markdown.to_html
```
````

This will display the code block with syntax highlighting:
```ruby
require 'redcarpet'
markdown = Redcarpet.new("Hello World!")
puts markdown.to_html
```

Highlighting Markdown:
```md
# h1 Heading
## h2 Heading

**This is bold text**
_This is italic text_

## List

1. Lorem ipsum dolor sit amet
2. Consectetur adipiscing elit
3. Integer molestie lorem at massa

## Tables

| First Header  | Second Header |
| ------------- | ------------- |
| Content Cell  | Content Cell  |
| Content Cell  | Content Cell  |

## Images

External image URL:
![Octocat](https://octodex.github.com/images/original.png "Octocat original")

Local image path using Webpack alias:
![Image](@images/octocats/constructocat2.webp "Octocat constructor")
```

Highlighting HTML, for example, there is a template `handlebars` that includes a markdown file `demo.md`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Markdown to HTML</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <!-- Load PrismJS styles of Highlighting from installed `prismjs` package -->
  <link href="prismjs/themes/prism.min.css" rel="stylesheet" />

  <!-- Load GitHub styles of Markdown from installed `github-markdown-css` package -->
  <link href="github-markdown-css/github-markdown-light.css" rel="stylesheet" />

  <!-- Load your custom styles. -->
  <link href="./style.css" rel="stylesheet" />
</head>
<body class="markdown-body">
  <!-- Load Markdown file defined in the HTML bundler plugin option -->
  <%~ include(file) %>
</body>
</html>
```

Highlighting JavaScript, for example, there is Webpack configuration file:

```js
const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',
  output: {
    path: path.join(__dirname, 'dist/'),
  },
  resolve: {
    alias: {
      // the aliases will be resolved in Markdown file
      // for example: ![Image](@images/picture.png)
      '@images': path.join(__dirname, 'path/to/images'),
    },
  },
  plugins: [
    new HtmlBundlerPlugin({
      entry: [
        {
          import: 'src/views/index.hbs', // HTML template where are loaded CSS styles for markdown and highlighting
          filename: 'index.html', // output HTML file containing rendered Markdown
          data: {
            file: 'src/views/markdown/demo.md', // path to markdown file relative to the project directory
          },
        },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.s?css$/,
        use: ['css-loader', 'sass-loader'],
      },
      {
        test: /\.(ico|png|svg|jpe?g|webp)$/i,
        type: 'asset/resource',
      },
    ],
  },
};
```

Highlighting CSS:

```css
/* The container styles of your rendered Markdown */

.markdown-body {
  box-sizing: border-box;
  min-width: 200px;
  max-width: 980px;
  margin: 0 auto;
  padding: 45px;
}

@media (max-width: 767px) {
  .markdown-body {
    padding: 15px;
  }
}
```
