const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },

      loaderOptions: {
        preprocessor: false,
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css)$/,
        use: ['css-loader'],
      },
      {
        test: /\.(jpe?g|png|webp)$/,
        type: 'asset/resource',
        generator: {
          filename: '[name].[hash:8][ext]',
        },
      },
    ],
  },
};
