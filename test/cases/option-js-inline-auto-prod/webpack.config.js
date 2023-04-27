const path = require('path');
const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
    // when an image is required/imported in JS then the publicPath must be defined,
    // otherwise in JS is generated the error: Automatic publicPath is not supported in this browser
    //publicPath: '/',
    publicPath: '/html-bundler-webpack-plugin/test/cases/option-js-inline-auto-prod/dist/',
  },

  resolve: {
    alias: {
      '@images': path.join(__dirname, '../../fixtures/images'),
      '@scripts': path.join(__dirname, 'src/assets/scripts/'),
    },
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/views/index.html',
        'pages/about': './src/views/about.html', // test same inline JS from another path
      },
      js: {
        inline: 'auto', // false; true; 'auto' - in dev mode is true, in prod mode is false
        //filename: 'assets/js/[name].[contenthash:8].js',
        filename: 'assets/js/[name].js',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(png|jpg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
