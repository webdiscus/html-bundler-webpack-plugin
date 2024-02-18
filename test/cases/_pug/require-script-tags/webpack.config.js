const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',
  devtool: false,

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  resolve: {
    alias: {
      Scripts: path.join(__dirname, 'src/assets/scripts/'),
      ScriptsContext: '/src/assets/scripts/',
    },
  },

  entry: {
    index: './src/views/index.pug',
  },

  plugins: [
    new HtmlBundlerPlugin({
      js: {
        filename: 'js/[name].[contenthash:8].js',
      },
      preprocessor: 'pug',
      preprocessorOptions: {
        basedir: path.join(__dirname), // test: root path for the alias `ScriptsContext` used in template
      },
    }),
  ],
};
