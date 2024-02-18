const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/views/index.pug',
      },
      preprocessor: 'pug',
      preprocessorOptions: {
        // resolve the root path for extends/include
        basedir: path.join(__dirname, 'src'),
      },
      loaderOptions: {
        // resolve the root path for assets: scripts, styles, images
        root: path.join(__dirname, 'src'),
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css)$/,
        use: ['css-loader'],
      },
    ],
  },
};
