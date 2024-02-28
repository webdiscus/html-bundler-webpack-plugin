const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  resolve: {
    // test modules
    modules: ['src', 'node_modules'],
  },

  entry: {
    index: './src/views/index.pug',
  },

  plugins: [
    new HtmlBundlerPlugin({
      pretty: true,
      css: {
        filename: 'assets/css/[name].[contenthash:8].css',
      },
      preprocessor: 'pug',
      preprocessorOptions: {}, // render
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css|sass|scss)$/,
        use: [
          {
            loader: 'css-loader',
          },
        ],
      },

      {
        test: /\.(png|webp|jpe?g)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
