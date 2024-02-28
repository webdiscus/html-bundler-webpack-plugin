const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  entry: {
    index: './src/index.html',
  },

  plugins: [new HtmlBundlerPlugin()],

  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: 'css-loader',
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                // minify inlined CSS
                plugins: [require('cssnano')({ preset: 'default' })],
              },
            },
          },
        ],
      },
    ],
  },
};
