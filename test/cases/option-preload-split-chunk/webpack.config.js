const path = require('path');
const HtmlBundlerPlugin = require('../../../');

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
      verbose: true,
      entry: {
        index: './src/views/pages/home/index.html',
        about: './src/views/pages/about/index.html',
        'news/sport': './src/views/pages/news/sport/index.html',
      },

      js: {
        filename: 'assets/js/[name].bundle.js',
      },

      css: {
        filename: 'assets/css/[name].bundle.css',
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
        },
        {
          test: /\.(eot|ttf|woff2?)$/,
          as: 'font',
          // test: set type as undefined to exclude the type attribute in the preload tag
          attributes: { crossorigin: true, type: undefined },
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

      {
        test: /\.(eot|ttf|woff2?)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[name][ext]',
        },
      },
    ],
  },

  // test: inject split chunks as preload tags
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        scripts: {
          test: /\.(js|ts)$/,
          chunks: 'all',
          enforce: true,
          maxSize: 50,
        },
      },
    },
  },
};
