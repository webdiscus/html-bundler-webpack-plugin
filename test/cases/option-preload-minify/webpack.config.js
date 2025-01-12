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
        index: './src/index.html',
      },

      js: {
        filename: 'js/[name].bundle.js',
      },

      css: {
        filename: 'css/[name].bundle.css',
      },

      preload: [
        {
          test: /\.(m?js)$/,
          as: 'script',
        },
        {
          test: /\.(s?css|less)$/,
          as: 'style',
        },
        {
          test: /\.(eot|ttf|woff2?)$/,
          attributes: { as: 'font' },
        },
      ],

      // test: render HTML with both options the `preload` and `minify`
      minify: true,
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
          filename: 'fonts/[name][ext]',
        },
      },
    ],
  },
};
