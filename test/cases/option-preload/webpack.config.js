const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  resolve: {
    alias: {
      '@fonts': path.join(__dirname, '../../fixtures/fonts'),
      '@images': path.join(__dirname, '../../fixtures/images'),
      '@scripts': path.join(__dirname, 'src/assets/scripts'),
      '@styles': path.join(__dirname, 'src/assets/styles'),
    },
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/views/pages/home/index.html',
        'news/sport': './src/views/pages/news/sport/index.html',
      },

      js: {
        filename: 'assets/js/[name].[contenthash:8].js',
      },

      css: {
        filename: 'assets/css/[name].[contenthash:8].css',
      },

      preload: [
        {
          test: /\.(js|ts)$/,
          as: 'script',
        },
        {
          test: /\.(s?css|less)$/,
          as: 'style',
        },
        {
          test: /\.(png|jpe?g|webp|svg)$/,
          as: 'image',
          rel: 'prefetch', // test custom 'rel'
        },
        {
          test: /\.(eot|ttf|woff2?)$/,
          as: 'font',
          type: 'font/custom-font', // test custom type
          // note: font preloading requires the crossorigin attribute to be set
          // test: the `true` or empty string `''` value should be rendered as `crossorigin` attribute w/o a value
          attributes: { crossorigin: true },
        },
      ],

      verbose: true, // test verbose for preload
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

      {
        test: /\.(eot|ttf|woff2?)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[name][ext]',
        },
      },
    ],
  },
};
