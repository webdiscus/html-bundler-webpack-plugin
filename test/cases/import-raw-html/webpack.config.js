const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },

      js: {
        filename: 'js/[name].bundle.js',
      },

      css: {
        filename: 'css/[name].bundle.css',
      },
    }),
  ],

  module: {
    rules: [
      {
        // list of rules where only the first matching rule will be applied
        oneOf: [
          {
            // load the content of a file required with the `?raw` query as the raw string
            type: 'asset/source',
            resourceQuery: /raw/,
          },
          {
            test: /\.css$/,
            use: ['css-loader'],
          },
        ],
      },
      // {
      //   type: 'asset/source',
      //   resourceQuery: /raw/,
      // },
      // {
      //   test: /\.css$/,
      //   resourceQuery: { not: [/raw/] },
      //   use: ['css-loader'],
      // },
    ],
  },
};
