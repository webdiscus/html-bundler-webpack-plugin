const path = require('path');
const HtmlBundlerPlugin = require('../../../');

const templatePath = path.join(__dirname, 'src/views/');
const htmlPath = path.join(__dirname, 'dist/www/');

module.exports = {
  mode: 'production',

  resolve: {
    alias: {
      Images: path.join(__dirname, 'src/assets/images/'),
    },
  },

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '/',
  },

  plugins: [
    new HtmlBundlerPlugin({
      sourcePath: templatePath, // absolute base path of sources
      outputPath: htmlPath, // absolute output path to html

      entry: {
        // test the option `sourcePath` to resolve the import filename
        index: 'index.html',
        // test an absolute path for import
        about: path.join(templatePath, 'about.html'),
        // test the option `outputPath` to resolve the output filename
        'pages/contact': {
          import: 'pages/contact.html',
          filename: '[name].html',
        },
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.html/,
        loader: HtmlBundlerPlugin.loader,
      },
      {
        test: /\.(png|jpg|jpeg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
