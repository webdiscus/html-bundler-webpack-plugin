const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  entry: {
    index: 'src/index.pug',
  },

  plugins: [
    new HtmlBundlerPlugin({
      preprocessor: 'pug',
      data: {
        title: {
          // test: call the function in template
          create: (str) => `My '${str}' title!`,
        },
        a: 'abc',
        b: 123,
      },
    }),
  ],
};
