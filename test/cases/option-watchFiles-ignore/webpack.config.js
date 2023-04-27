const path = require('path');
const HtmlBundlerPlugin = require('../../../');

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
      verbose: true,
      entry: {
        index: './src/index.html',
      },

      js: {
        filename: 'assets/js/[name].bundle.js',
      },

      css: {
        filename: 'assets/css/[name].bundle.css',
      },

      watchFiles: {
        paths: ['src'],
        files: [/\.(html|css)$/, '.js'], // include files
        ignore: [/\.(css)$/, '.scss'], // exclude files (has prio over `files` option)
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['css-loader'],
      },

      {
        test: /\.(png|jpe?g|ico|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
