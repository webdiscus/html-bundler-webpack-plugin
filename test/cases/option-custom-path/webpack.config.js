const path = require('path');
const HtmlBundlerPlugin = require('../../../');

const templatePath = path.join(__dirname, 'src/views/');
const htmlPath = path.join(__dirname, 'dist/www/');

module.exports = {
  mode: 'production',

  resolve: {
    alias: {
      '@images': path.join(__dirname, '../../fixtures/images'),
    },
  },

  output: {
    path: path.join(__dirname, 'dist/'),
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
        'news/science': {
          import: 'news/science.html',
          // test `outputPath` and filename as function
          filename: (pathData) => {
            return 'custom/[name].html';
          },
        },
      },
    }),
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
