const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '/sub-path/',
    clean: true,
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: {
          import: './public/index.html',
          data: {
            title: 'Home',
            name: 'World',
          },
        },
      },

      js: {
        filename: 'assets/js/[name].[contenthash:8].js',
      },

      css: {
        filename: 'assets/css/[name].[contenthash:8].css',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /.css$/,
        use: ['css-loader'],
      },

      {
        test: /.(png|jpe?g|ico|svg)/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },
    ],
  },

  // enable HMR with live reload
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    open: '/sub-path/', // <= must be same as output.publicPath
    watchFiles: {
      paths: ['src/**/*.*', 'public/**/*.*'],
      options: {
        usePolling: true,
      },
    },
  },
};
