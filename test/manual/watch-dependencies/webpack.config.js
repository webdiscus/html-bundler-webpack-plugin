const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',
  stats: 'minimal',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: {
          import: './src/views/home.html',
          data: {
            title: 'Home',
          },
        },
      },
      // configure paths to watch file changes
      watchFiles: {
        paths: ['./src'],
        //files: [/\.(html|js|sc?ss)$/],
        //ignore: [],
      },
      verbose: true,
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(png|jpe?g|svg|webp|ico)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },
    ],
  },

  // enable HMR with live reload
  devServer: {
    //hot: false,
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    watchFiles: {
      paths: ['src/**/*.*'],
      options: {
        usePolling: true,
      },
    },
  },
};
