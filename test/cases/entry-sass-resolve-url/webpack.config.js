const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'development',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  resolve: {
    alias: {
      Images: path.join(__dirname, './src/assets/images/'),
    },
  },

  entry: {
    // test: import the SCSS with URLs in entry
    vendor: './src/vendor/style.scss',
    // test: import the SCSS with the same URLs in template
    index: './src/views/index.html',
  },

  plugins: [
    new HtmlBundlerPlugin({
      css: {
        filename: 'assets/css/[name].[contenthash:8].css',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css|sass|scss)$/,
        use: [
          {
            loader: 'css-loader',
            options: {
              //esModule: false, // jest error
            },
          },
          // resolve resources in included npm package, e.g. @import 'material-icons';
          // WARING: BUG in `resolve-url-loader`:
          // when the same file imported from different directories,
          // then at 2nd iteration in source file will be the filename not replaced
          // Don't use `resolve-url-loader`, this plugin resolves URLs in SCSS much better and faster.
          'sass-loader',
        ],
      },

      {
        test: /\.(png|svg|jpg|jpeg|gif|ico)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },

      {
        test: /\.(woff|woff2|eot|ttf|otf|svg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[name][ext]',
        },
      },
    ],
  },
};
