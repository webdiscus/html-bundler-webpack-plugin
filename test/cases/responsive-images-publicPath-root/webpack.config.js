const path = require('path');
const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',

  resolve: {
    alias: {
      '@images': path.join(__dirname, '../../fixtures/images'),
      '@styles': path.join(__dirname, 'src/assets/styles/'),
    },
  },

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '/', // test with the root path
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        'pages/home': './src/views/index.html',
      },
      js: {
        filename: '[name].[contenthash:8].js',
      },
      loaderOptions: {
        sources: [
          {
            tag: 'img',
            // for property extracted via responsive-loader from an image file
            attributes: ['data-src', 'width', 'height'],
          },
        ],
      },
    }),
  ],

  module: {
    rules: [
      // images loader
      {
        test: /\.(gif|png|jpe?g|ico|svg|webp)$/i,
        type: 'asset/resource',
        use: {
          loader: 'responsive-loader',
          options: {
            // the output filename of images
            // note: GitHub generate different hash as local test
            //name: 'assets/img/[name].[hash:8]-[width]w.[ext]',
            name: 'assets/img/[name]-[width]w.[ext]',
            sizes: [300], // default size for all images
          },
        },
      },
    ],
  },
};
