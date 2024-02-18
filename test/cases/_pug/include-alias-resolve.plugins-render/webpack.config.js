const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');
const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  mode: 'production',
  context: path.join(__dirname, 'src/'),

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '',
  },

  resolve: {
    plugins: [new TsConfigPathsPlugin({ configFile: path.join(__dirname, 'tsconfig.json') })],
    alias: {
      AliasImages: path.join(__dirname, 'src/assets/images/'),
    },
  },

  entry: {
    index: 'views/index.pug',
  },

  plugins: [
    new HtmlBundlerPlugin({
      preprocessor: 'pug',
      preprocessorOptions: {},
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(png|webp|jpe?g)$/,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
