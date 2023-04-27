const path = require('path');
const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '', // test empty publicPath
  },

  resolve: {
    alias: {
      '@images': path.join(__dirname, '../../fixtures/images'),
      '@scripts': path.join(__dirname, 'src/assets/scripts/'),
      '@styles': path.join(__dirname, 'src/assets/styles/'),
    },
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/views/home/index.html',
        'news/science': './src/views/news/science/index.html',
      },
      js: {
        filename: 'assets/js/[name].[contenthash:8].js',
      },
      css: {
        // output filename of styles
        filename: (pathInfo) => {
          // test publicPath for CSS url() from different paths
          if (pathInfo.chunk.name === 'common') {
            return 'assets/vendor/css/[name].[contenthash:8].css';
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
        test: /\.(png|jpe?g)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
