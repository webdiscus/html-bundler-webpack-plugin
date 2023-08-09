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

  entry: {
    // test the default value of the option `sourcePath` to resolve the import filename
    index: './src/views/index.html',
    // test an absolute path for import
    about: path.join(__dirname, 'src/views/about.html'),
    // test the default value of the option `outputPath` to resolve the output filename
    science: {
      import: './src/views/news/science.html',
      filename: 'news/[name].html',
    },
  },

  plugins: [
    // zero config
    new HtmlBundlerPlugin(),
  ],

  module: {
    rules: [
      {
        test: /\.(png|jpg|jpeg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
