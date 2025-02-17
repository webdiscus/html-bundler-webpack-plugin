const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  resolve: {
    alias: {
      '@fonts': path.join(__dirname, '../../fixtures/fonts'),
    },
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/views/index.html',
      },

      css: {
        filename: 'assets/css/[name].bundle.css',
      },

      preload: [
        {
          test: /\.(s?css|less)$/,
          as: 'style',
        },
        {
          test: /\.(eot|ttf|woff2?)$/,
          // test: `as` in attributes
          // test: the empty string `''` value of `crossorigin` should be rendered as `crossorigin=""`
          attributes: { as: 'font', crossorigin: '' },
        },
      ],
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css|sass|scss)$/,
        use: ['css-loader', 'sass-loader'],
      },

      {
        test: /\.(eot|ttf|woff2?)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[name][ext]',
        },
      },
    ],
  },
};
