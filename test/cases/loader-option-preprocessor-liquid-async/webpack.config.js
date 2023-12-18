const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');
const { Liquid } = require('liquidjs');
const LiquidEngine = new Liquid({ root: process.cwd() });

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  resolve: {
    alias: {
      '@images': path.join(__dirname, '../../fixtures/images'),
    },
  },

  plugins: [
    new HtmlBundlerPlugin({
      test: /\.(html|liquid)$/,
      entry: {
        index: {
          import: './src/home.liquid',
          data: {
            title: 'Home',
            headline: 'Breaking Bad',
            people: ['Walter White', 'Jesse Pinkman'],
          },
        },
      },
      loaderOptions: {
        // async parseAndRender method return promise
        preprocessor: (content, { data }) => LiquidEngine.parseAndRender(content, data),
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(png|svg|jpe?g|webp)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
