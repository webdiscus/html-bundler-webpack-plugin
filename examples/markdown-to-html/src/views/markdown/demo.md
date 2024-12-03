<h1 align="center">Markdown demo</h1>
<h3 align="center">Theme: <a href="index-dark.html">dark</a> | <a href="index.html">light</a></h3>

[>> Highlighting code blocks](code-light.html)

---

# Advertisement

- __[ansis](https://github.com/webdiscus/ansis/)__ - Small and fast Node.js lib to colorize terminal output.
- __[HTML Bundler Plugin for Webpack](https://github.com/webdiscus/html-bundler-webpack-plugin)__ - Generates HTML with JS and CSS from various templates.\
  Supports Eta, EJS, Handlebars, Nunjucks, Pug, Twig templates "out of the box".

You will like those projects!

---

# Headings

```
# A first-level heading
## A second-level heading
### A third-level heading
```

# A first-level heading
## A second-level heading
### A third-level heading


## Horizontal Rule

```
---
```
---

## Styling text

```
**This is bold text**
```
**This is bold text**

```
_This is italic text_
```
_This is italic text_

```
~~Strikethrough~~
```
~~Strikethrough~~

```
This is an &lt;ins&gt;underlined&lt;/ins&gt; text
```
This is an <ins>underlined</ins> text

```
This is a &lt;sub&gt;subscript&lt;/sub&gt; text
```
This is a <sub>subscript</sub> text

```
This is a &lt;sup&gt;superscript&lt;/sup&gt; text
```
This is a <sup>superscript</sup> text


## Quoting text

```
Text that is not a quote

> Text that is a quote
>> Nested quoted text
```

Text that is not a quote

> Text that is a quote
>> Nested quoted text


## GitHub Alerts

Alerts are a Markdown extension based on the blockquote syntax.

Five types of alerts are available:
```
> [!NOTE]
> Useful information that users should know, even when skimming content.

> [!TIP]
> Helpful advice for doing things better or more easily.

> [!IMPORTANT]
> Key information users need to know to achieve their goal.

> [!WARNING]
> Urgent info that needs immediate user attention to avoid problems.

> [!CAUTION]
> Advises about risks or negative outcomes of certain actions.
```

Here are the rendered alerts:

> [!NOTE]
> Useful information that users should know, even when skimming content.

> [!TIP]
> Helpful advice for doing things better or more easily.

> [!IMPORTANT]
> Key information users need to know to achieve their goal.

> [!WARNING]
> Urgent info that needs immediate user attention to avoid problems.

> [!CAUTION]
> Advises about risks or negative outcomes of certain actions.


## Lists

### Unordered

Create a list by starting a line with `+`, `-`, or `*`

- First list item
   - First nested list item
     - Second nested list item

### Ordered

1. James Madison
2. James Monroe
3. John Quincy Adams

### Start numbering with offset

100. First list item
101. Second list item


## Code

Inline `code`

Indented code

    // Some comments
    line 1 of code
    line 2 of code
    line 3 of code


Block code "fences"

```
Sample text here...
```

Syntax highlighting

```js
var foo = function (bar) {
  return bar++;
};

console.log(foo(5));
```

To display triple backticks in a fenced code block, wrap them inside quadruple backticks
````
```
Look! You can see my backticks.
```
````

## Tables

| Left-aligned | Center-aligned | Right-aligned |
| :---         |     :---:      |          ---: |
| git status   | git status     | git status    |
| git diff     | git diff       | git diff      |

## Links

[link with title](ttps://github.com/webdiscus "title text!")

```md
[link with title](ttps://github.com/webdiscus "title text!")
```


## Images

External image URL

```md
![Octocat](https://octodex.github.com/images/original.png "The Octocat original")
```
![Octocat](https://octodex.github.com/images/original.png "The Octocat original")

Local image path using Webpack alias

```md
![Image](@images/plumber.webp "The plumber")
```

![Image](@images/plumber.webp "The plumber")
