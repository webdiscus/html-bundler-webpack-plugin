const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  //mode: 'production',
  mode: 'development',
  //stats: 'normal',
  stats: 'errors-warnings',
  //devtool: false,

  output: {
    path: path.join(__dirname, 'dist/'),
    clean: true,
  },

  resolve: {
    alias: {
      '@images': path.join(__dirname, '../../fixtures/images'),
    },
    extensions: ['.js', '.jsx'],
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },

      js: {
        filename: 'js/[name].[contenthash:8].js',
        //inline: true,
      },

      //verbose: true,
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(m?js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            presets: [['@babel/preset-react']],
          },
        },
      },
      {
        test: /\.(ico|png|jp?g|webp|svg)$/,
        type: 'asset/resource',
      },
    ],
  },

  performance: {
    hints: false, // disable the size limit warning
  },

  cache: {
    //type: 'memory',
    // test filesystem cache
    type: 'filesystem',
    cacheDirectory: path.join(__dirname, '.cache'),
  },

  // enable live reload
  devServer: {
    static: path.join(__dirname, 'dist'),
    watchFiles: {
      paths: ['src/**/*.*'],
      options: {
        usePolling: true,
      },
    },
  },
};
