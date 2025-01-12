const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');
import HtmlMinimizerPlugin from 'html-minimizer-webpack-plugin';

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

      // use external minimizer
      minify: false,
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

  optimization: {
    minimizer: [
      // test: render HTML with `preload` option and an external minimizer
      new HtmlMinimizerPlugin({
        minify: HtmlMinimizerPlugin.swcMinify,
        // https://github.com/swc-project/swc/blob/main/packages/html/index.ts
        minimizerOptions: {
          quotes: false,
          tagOmission: false, // <= fix issue #137
        },
      }),
    ],
  },
};
