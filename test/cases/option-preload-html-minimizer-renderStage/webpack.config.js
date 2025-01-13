const path = require('path');
const Compilation = require('webpack/lib/Compilation');
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
        filename: 'js/[name].[contenthash:8].js',
      },

      css: {
        filename: 'css/[name].[contenthash:8].css',
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

      // test: call the HTML rendering before running of the HtmlMinimizerPlugin
      renderStage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE - 1,
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
          tagOmission: true, // <= after minification removes head and body tags
        },
      }),
    ],
  },
};
