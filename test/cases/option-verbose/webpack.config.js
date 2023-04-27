const path = require('path');
const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: 'auto',
  },

  resolve: {
    alias: {
      '@fonts': path.join(__dirname, '../../fixtures/fonts'),
      '@images': path.join(__dirname, '../../fixtures/images'),
    },
  },

  plugins: [
    new HtmlBundlerPlugin({
      // test verbose option
      verbose: true,
      entry: {
        index: {
          import: './src/views/home/index.html',
          data: { title: 'Hone EN' },
        },
        'lang/de/index': {
          import: './src/views/home/index.html',
          data: { title: 'Hone DE' },
        },
        'pages/about': './src/views/about/index.html',
      },
      js: {
        filename: 'js/[name].bundle.js',
      },
      css: {
        verbose: true,
        filename: 'css/[name].bundle.css',
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
        test: /\.(eot|ttf|woff|woff2)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[name][ext][query]',
        },
      },

      {
        test: /\.(png|svg|jpg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },

      {
        test: /\.(png|svg)$/i,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 500,
          },
        },
      },

      // responsive loader
      {
        test: /\.(webp)$/i,
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

  // test: split chunks and single script file
  optimization: {
    splitChunks: {
      cacheGroups: {
        scripts: {
          test: /split\.(js|ts)$/,
          chunks: 'all',
          enforce: true,
        },
      },
    },
  },
};
