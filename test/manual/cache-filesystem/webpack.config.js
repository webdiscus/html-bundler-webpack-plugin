const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  mode: 'development',
  stats: 'minimal',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: {
          import: './src/home.html',
          data: {
            title: 'Home',
          },
        },
      },
      js: {
        filename: 'js/[name].bundle.js',
      },
      css: {
        filename: 'css/[name].bundle.css',
      },
      hotUpdate: false,
      //verbose: true,
    }),
  ],

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['css-loader'],
      },
      {
        test: /\.(png|jpe?g|webp|ico)$/,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext]',
        },
      },

      // test 2nd `npm start` for asset module with cache.type 'filesystem'
      {
        test: /\.svg$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 1024,
          },
        },
      },
    ],
  },

  cache: {
    type: 'memory', // OK
    // TODO: add support for the 'filesystem' cache type
    //type: 'filesystem',
    //cacheDirectory: path.join(__dirname, '.cache'),
    //store: 'pack',
  },

  // enable HMR with live reload
  devServer: {
    //hot: false,
    static: path.join(__dirname, 'dist'),
    watchFiles: {
      paths: ['src/**/*.*'],
      options: {
        usePolling: true,
      },
    },
  },
};
