const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  resolve: {
    alias: {
      // test local alias
      '@images': path.join(__dirname, '../../fixtures/images'),
      // test url alias
      external: 'https://raw.githubusercontent.com/webdiscus/html-bundler-webpack-plugin/refs/heads/master/images/',
      //external: '//raw.githubusercontent.com/webdiscus/html-bundler-webpack-plugin/refs/heads/master/images/',
    },
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },
      preprocessor: false,
      // resolve relative files (e.g. images) defined in *.md file
      loaderOptions: {
        //root: path.resolve(__dirname, 'src'),
        //context: resolvedDir,
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(png|jpe?g|webp|ico)$/,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
