const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');
const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  mode: 'production',
  stats: {
    children: true,
  },

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '',
  },

  resolve: {
    plugins: [new TsConfigPathsPlugin({ configFile: path.join(__dirname, 'tsconfig.json') })],
  },

  entry: {
    index: 'src/views/index.pug',
  },

  plugins: [
    new HtmlBundlerPlugin({
      preprocessor: 'pug',
      preprocessorOptions: {
        embedFilters: {
          escape: true,
        },
      },
    }),
  ],
};
