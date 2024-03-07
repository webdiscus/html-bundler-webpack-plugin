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

      js: {
        // output filename of extracted JS
        filename: 'js/[name].bundle.js',
      },

      css: {
        // output filename of extracted CSS
        filename: 'css/[name].bundle.css',
      },

      loaderOptions: {
        sources: [
          {
            tag: 'a',
            attributes: ['data-image'],
            filter: (obj) => {
              //console.log('### Filter: ', obj);
            },
          },
        ],
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
          filename: 'img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
