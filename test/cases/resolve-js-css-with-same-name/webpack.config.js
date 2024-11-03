const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  resolve: {
    alias: {
      '@styles': path.join(__dirname, 'src/styles'),
      '@scripts': path.join(__dirname, 'src/scripts'),
    },
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/views/index.html',
        news: './src/views/news/index.html',
        about: './src/views/about/index.html',
      },
      js: {
        // test of generating js with the same source name: script.js, script.1.js
        filename: 'js/[name].bundle.js',
        //filename: 'js/[name].[contenthash:8].js',
      },
      css: {
        // test of generating css with the same source name: style.css, style.1.css
        filename: 'css/[name].bundle.css',
        //filename: 'css/[name].[contenthash:8].css',
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
        test: /\.(png|jpe?g|ico|svg)$/,
        type: 'asset/resource',
        generator: {
          // The problem: by generating assets with the same source name: img.js, img.1.js into one directory
          // occurs the conflict: "Multiple chunks emit assets to the same filename".
          //filename: 'img/[name][ext]',

          // The solution: always use the hashed asset name to avoid the conflict.
          filename: 'img/[name].[hash:8][ext][query]',
        },
      },
    ],
  },
};
