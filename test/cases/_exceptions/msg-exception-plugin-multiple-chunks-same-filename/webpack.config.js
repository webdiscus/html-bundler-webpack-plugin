const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'development',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  entry: {
    // test exception: multiple chunks with same filename:
    // - the `main.css` file is defined here, in entry point
    // - the same `main.css` file is defined in `index.html`

    // solution:
    // - DON'T use same source file in entry point and in HTML

    index: './src/views/index.html',
    main: './src/styles/main.css',
  },

  plugins: [
    new HtmlBundlerPlugin({
      css: {
        filename: '[name].css', // error: multiple chunks with same filename
        //filename: '[name].[contenthash:8].css', // use a hash in filename to avoid the error
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css)$/,
        use: ['css-loader'],
      },
    ],
  },
};
