# Markdown demo

# h1 Heading
## h2 Heading
### h3 Heading
#### h4 Heading
##### h5 Heading
###### h6 Heading


## Horizontal Rule

---
```
---
```

## Emphasis

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


## Blockquotes

> Blockquotes can also be nested...
>> ...by using additional greater-than signs right next to each other...
> > > ...or with spaces between arrows.

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

Unordered

+ Create a list by starting a line with `+`, `-`, or `*`
+ Sub-lists are made by indenting 2 spaces:
  - Marker character change forces new list start:
    * Ac tristique libero volutpat at
    + Facilisis in pretium nisl aliquet
    - Nulla volutpat aliquam velit
+ Very easy!

Ordered

1. Lorem ipsum dolor sit amet
2. Consectetur adipiscing elit
3. Integer molestie lorem at massa

Start numbering with offset:

57. foo
1. bar


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
![Image](@images/octocats/plumber.webp "The plumber")
```

![Image](@images/octocats/plumber.webp "The plumber")
