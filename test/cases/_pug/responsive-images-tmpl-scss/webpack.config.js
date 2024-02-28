const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  resolve: {
    alias: {
      Images: path.join(__dirname, 'src/assets/images/'),
      Styles: path.join(__dirname, 'src/assets/styles/'),
      Scripts: path.join(__dirname, 'src/assets/scripts/'),
    },
  },

  output: {
    path: path.join(__dirname, 'dist/'),
    //publicPath: '/', // test responsive loader with auto publicPath
  },

  entry: {
    'pages/home': './src/views/index.pug',
  },

  plugins: [
    new HtmlBundlerPlugin({
      preprocessor: 'pug',
      //verbose: true,
      js: {
        filename: 'js/[name].[contenthash:8].js',
      },
      css: {
        filename: 'css/[name].[contenthash:8].css',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css|sass|scss)$/,
        use: ['css-loader', 'sass-loader'],
      },

      {
        test: /\.(gif|png|jpe?g|ico|svg|webp)$/i,
        type: 'asset/resource',
        use: {
          loader: 'responsive-loader',
          options: {
            name: 'img/[name]-[width]w.[ext]',
          },
        },
      },
    ],
  },
};
