const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',
  //mode: 'development',

  resolve: {
    alias: {
      '@fixtures': path.join(__dirname, '../../fixtures'),
      '@images': path.join(__dirname, 'src/assets/images'),
      '@styles': path.join(__dirname, 'src/assets/styles'),
    },
  },

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/views/index.html',
      },
      js: {
        filename: 'assets/js/[name].[contenthash:8].js',
      },
      css: {
        filename: (PathData) => {
          // test auto publicPath for responsive images used in different scss files
          if (PathData.chunk.name === 'main2') {
            return 'assets/css2/subdir/[name].[contenthash:8].css';
          }

          return 'assets/css/[name].[contenthash:8].css';
        },
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
            name: 'assets/img/[name]-[width]w.[ext]',
          },
        },
      },
    ],
  },
};
