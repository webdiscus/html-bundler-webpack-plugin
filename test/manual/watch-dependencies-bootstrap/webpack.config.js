const path = require('path');
const HtmlBundlerPlugin = require('../../..');

module.exports = {
  mode: 'production',
  stats: 'minimal',

  output: {
    path: path.join(__dirname, 'dist/'),
    clean: true,
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/views/home.html',
      },
      js: {
        filename: 'js/[name].[contenthash:8].js',
      },
      css: {
        filename: 'css/[name].[contenthash:8].css',
      },

      //configure paths to watch file changes
      // watchFiles: {
      //   paths: ['./src', './node_modules/bootstrap/dist/js'],
      //   files: [/\.(html|js)$/],
      //
      //   //paths: ['./src'],
      //   //files: [/\.(html|js|sc?ss)$/],
      //   //ignore: [],
      // },
      //verbose: true,
    }),
  ],

  // optimization: {
  //   //runtimeChunk: 'single',
  //   splitChunks: {
  //     cacheGroups: {
  //       scripts: {
  //         test: /\.(js|ts)$/,
  //         name: 'vendor',
  //         chunks: 'all',
  //       },
  //     },
  //   },
  // },

  module: {
    rules: [
      {
        test: /\.(css|sass|scss)$/,
        use: ['css-loader'],
      },
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
