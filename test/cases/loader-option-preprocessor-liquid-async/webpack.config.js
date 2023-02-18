const path = require('path');
const HtmlBundlerPlugin = require('../../../');
const { Liquid } = require('liquidjs');
const LiquidEngine = new Liquid();

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
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
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(html|liquid)$/,
        loader: HtmlBundlerPlugin.loader,
        options: {
          // async parseAndRender method return promise
          preprocessor: (content, { data }) => LiquidEngine.parseAndRender(content, data),
        },
      },
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
