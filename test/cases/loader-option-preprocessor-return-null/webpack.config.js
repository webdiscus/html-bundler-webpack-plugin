const path = require('path');
const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
    clean: true,
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: {
          import: './src/index.html',
          data: {
            title: 'Home',
            headline: 'Breaking Bad',
            name: {
              firstname: 'Walter',
              lastname: 'White',
            },
          },
        },
      },
      loaderOptions: {
        // test preprocessor return null, has same effect as `preprocessor: false`
        preprocessor: () => null,
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(png|svg|jpe?g|webp)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
