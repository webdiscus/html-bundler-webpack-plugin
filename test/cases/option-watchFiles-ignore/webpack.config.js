const path = require('path');
const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      verbose: true,
      entry: {
        index: './src/index.html',
      },

      js: {
        // output filename of extracted JS
        filename: 'assets/js/[name].[contenthash:8].js',
      },

      css: {
        // output filename of extracted CSS
        filename: 'assets/css/[name].[contenthash:8].css',
      },
      watchFiles: {
        paths: ['src'],
        files: [/\.(html|js|css)$/], // include files
        ignore: [/\.(css)$/], // exclude files (has prio over `files` option)
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /.css$/,
        use: ['css-loader'],
      },

      {
        test: /.(png|jpe?g|ico|svg)/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
