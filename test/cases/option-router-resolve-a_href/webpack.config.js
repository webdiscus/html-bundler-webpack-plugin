const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

const viewsPath = path.resolve(__dirname, 'src/views/pages');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
    //publicPath: 'auto', // tested: OK
    //publicPath: () => '/', // tested: OK
    //publicPath: () => 'http://localhost:8080/', // tested: OK
  },

  resolve: {
    alias: {
      '@images': path.join(__dirname, '../../fixtures/images'),
      '@scripts': path.join(__dirname, 'src/assets/scripts'),
      '@styles': path.join(__dirname, 'src/assets/styles'),
      '@views': path.join(__dirname, 'src/views/pages'),
    },
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/views/pages/home/index.html',
        'news/sport/index': './src/views/pages/news/sport/index.html',
      },
      css: {
        filename: 'assets/css/[name].[contenthash:8].css',
      },
      sources: [
        {
          // resolve page URLs automatically, w/o router option
          tag: 'a',
          attributes: ['href'],
        },
      ],
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css|sass|scss)$/,
        use: ['css-loader', 'sass-loader'],
      },

      {
        test: /\.(png|jpe?g|ico|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
