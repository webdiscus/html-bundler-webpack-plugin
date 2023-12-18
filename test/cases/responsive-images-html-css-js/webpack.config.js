const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  resolve: {
    alias: {
      '@images': path.join(__dirname, '../../fixtures/images'),
      '@styles': path.join(__dirname, 'src/assets/styles/'),
      '@scripts': path.join(__dirname, 'src/assets/scripts/'),
    },
  },

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '../',
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        'pages/home': './src/views/index.html',
      },
      js: {
        filename: 'assets/js/[name].bundle.js',
      },
      css: {
        filename: 'assets/css/[name].bundle.css',
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
        oneOf: [
          // use responsive-loader in JS file
          {
            issuer: /\.(js|ts)$/,
            type: 'javascript/auto', // <= important for usage in JS
            use: {
              loader: 'responsive-loader',
              options: {
                // note: on GitHub is generated wrong hash for images
                // name: 'assets/img/[name].[hash:8]-[width]w.[ext]',
                name: 'assets/img/[name]-[width]w.[ext]',
              },
            },
          },
          // use responsive-loader in HTML/CSS
          {
            type: 'asset/resource', // <= important for usage in HTML/CSS
            use: {
              loader: 'responsive-loader',
              options: {
                // note: on GitHub is generated wrong hash for images
                // name: 'assets/img/[name].[hash:8]-[width]w.[ext]',
                name: 'assets/img/[name]-[width]w.[ext]',
              },
            },
          },
        ],
      },
    ],
  },
};
