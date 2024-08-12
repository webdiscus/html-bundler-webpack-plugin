# Manual test for the issue [#110](https://github.com/webdiscus/html-bundler-webpack-plugin/issues/110)

Cache issue with `integrity: true` and `output.filename = '[name].[contenthash].js'`
in watch mode  after adding a new import statement to a JS file.


Try to reproduce the issue:

1. Start in serv mode:
   `npm start`
2. Open URL in browser: `http://localhost:8080/`
3. Open `./src/main.js`
4. Change the file:
```diff
import str from './module';

// test in serv mode: add new import JS file
- //import str2 from './module-new'; // <= uncomment
- //console.log('>> main', { str2 }); // <= uncomment
+ import str2 from './module-new';
+ console.log('>> main', { str2 });

console.log('>> main', { str });
```

Currently: This simple test works fine w/o errors.

TODO: reproduce issue described in the issue #110.
