const path = require('path');
const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  resolve: {
    alias: {
      '@images': path.join(__dirname, 'src/assets/images'),
      '@scripts': path.join(__dirname, 'src/assets/scripts'),
      '@styles': path.join(__dirname, 'src/assets/styles'),
    },
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/views/pages/home/index.html?qq=1',
        'news/sport': './src/views/pages/news/sport/index.html?qq=2',
      },

      js: {
        filename: 'assets/js/[name].[contenthash:8].js',
      },

      css: {
        filename: 'assets/css/[name].[contenthash:8].css',
      },

      preload: [
        {
          test: /\.(png|jpe?g|webp)$/,
          as: 'image',
        },
        // preload responsive images
        {
          test: /\.(png|jpe?g|webp)\?.*size=100/,
          as: 'image',
          attributes: { media: '(max-width: 100px)' },
        },
        {
          test: /\.(png|jpe?g|webp)\?.*size=300/,
          as: 'image',
          attributes: { media: '(max-width: 300px)' },
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

      // default images
      {
        test: /\.(ico|svg|png)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },

      // responsive images
      {
        test: /\.(png|jpe?g|webp)/i,
        type: 'asset/resource',
        use: {
          loader: 'responsive-loader',
          options: {
            // output filename of images
            // note: GitHub generate different hash as local test
            //name: 'assets/img/[name].[hash:8]-[width]w.[ext]',
            name: 'assets/img/[name]-[width]w.[ext]',
            sizes: [200], // default size for all images
          },
        },
      },
    ],
  },
};
