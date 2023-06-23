# RESEARCH: How to watch entry directory for changes

## What is the expected behavior?
I need to watch the entry directory for changing of entry files and rebuild entries when files are added/deleted/renamed.

## Problem

Compilation fails after renaming an entry file:
```
ERROR in <entry name>
Module not found: Error: Can't resolve <entry source file> in <entry dir>
```

## Install and start
```
npm i
npm start
```

## How to reproduce

In the `src/views/pages/` directory rename the `news.html` to `news-2.html`.

Then Webpack try to rebuild entries, but doesn't recognize the renamed file `news-2.html` and appear the error.

## Help wanted

Аny help is welcome.


## Links to the same problem

The outdated solution for Webpack 3/4 doesn't work in Webpack 5:
[Can watch mode support watching new file automatically?](https://github.com/webpack/webpack/issues/5407)
