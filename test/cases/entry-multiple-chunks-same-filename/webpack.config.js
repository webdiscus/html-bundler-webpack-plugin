const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'development',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  entry: {
    // Test case multiple chunks with same filename:
    // - the `main.css` file is defined here, in entry point
    // - the same `main.css` file is defined in `index.pug`

    // Note: this use case has no sense and should not be used!
    // Specify all scripts and styles directly in Pug.

    index: './src/index.html',

    // test: the same style file is defined in template
    main: './src/main.css',
  },

  plugins: [
    new HtmlBundlerPlugin({
      // Use hashed filename to avoid the conflict:
      // Multiple chunks emit assets to the same filename main.css
      css: {
        filename: 'css/[name].[contenthash:8].css',
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
