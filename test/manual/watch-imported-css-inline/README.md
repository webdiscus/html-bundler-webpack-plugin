# Manual test

The issue [Inclining imported css doesn't work in watch mode if a leaf component content is changed](https://github.com/webdiscus/html-bundler-webpack-plugin/issues/74).

TODO: describe steps to reproduce the issue

1. start development: `npm start`
2. change `src/home.html` => ok
3. change `src/style.css` => ok
4. change `src/main.js` => ok
5. change `src/component-a/style.css` => ok
6. change `src/component-a/index.js` => ok
7. change `src/component-b/style.css` => ok
8. change `src/component-b/index.js` => ok
