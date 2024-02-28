const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  entry: {
    // test the compiled template function used in the html
    index: './src/index.pug',
    // test the compiled template function standalone, e.g., as a component
    'my-component': './src/component/component.js',
  },

  plugins: [
    new HtmlBundlerPlugin({
      preprocessor: 'pug',
    }),
  ],
};
