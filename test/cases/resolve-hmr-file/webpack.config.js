const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist'),
  },

  resolve: {
    alias: {
      '@hmrScript': path.join(__dirname, '../../../', 'src/Loader/Hmr'),
    },
  },

  entry: {
    index: './src/index.html',
  },

  plugins: [
    new HtmlBundlerPlugin(),
  ],

  devServer: {
    hot: true,
    static: {
      directory: path.join(__dirname, 'dist'),
    },
  },
};
