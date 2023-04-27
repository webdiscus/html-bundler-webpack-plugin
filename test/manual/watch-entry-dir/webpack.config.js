const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  //mode: 'production',
  mode: 'development',
  //stats: 'normal',
  stats: 'errors-warnings',

  output: {
    path: path.join(__dirname, 'dist/'),
    clean: true,
  },

  resolve: {
    alias: {
      '@images': path.join(__dirname, '../../fixtures/images'),
    },
  },

  plugins: [
    new HtmlBundlerPlugin({
      // add/remove a template in the entry then the Webpack compilation will be auto restarted via 'nodemon'
      entry: {
        index: './src/views/pages/home.html',
        news: './src/views/pages/news.html',
      },

      // note: watching of a directory not works, after changes in the directory the Webpack must be restarted
      // entry: './src/views/pages',
      // filename: ({ filename, chunk: { name } }) => {
      //   if (name === 'home') return 'index.html';
      //   // bypass the original structure
      //   return '[name].html';
      // },

      js: {
        filename: 'assets/js/[name].[contenthash:8].js',
      },

      css: {
        filename: 'assets/css/[name].[contenthash:8].css',
      },

      //verbose: true,
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css)/,
        use: ['css-loader'],
      },

      {
        test: /\.(png|jpe?g|ico|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },
    ],
  },

  devServer: {
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
