[![npm](https://img.shields.io/npm/v/@test-fixtures/lorem?logo=npm&color=brightgreen "npm package")](https://www.npmjs.com/package/@test-fixtures/lorem "download npm package")
[![node](https://img.shields.io/npm/dm/@test-fixtures/lorem)](https://www.npmjs.com/package/@test-fixtures/lorem)


# @test-fixtures/lorem

This is a test fixture as a JS module containing the text `Lorem Ipsum` 1024 bytes long.

## Install

```
npm i -D @test-fixtures/lorem
```

## Usage

```js
const lorem = require('@test-fixtures/lorem');

console.log('Title: ', lorem.getTitle());    // Lorem Ipsum
console.log('Text: ', lorem.getText());      // 1024 bytes of text
console.log('Text size: ', lorem.getSize()); // 1024
```
