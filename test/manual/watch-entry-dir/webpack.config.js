const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  mode: 'development',
  stats: 'errors-warnings',

  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: './src/views',
      // entry: {
      //   index: './src/views/index.html',
      // },
      js: {
        //filename: 'assets/js/[name].[contenthash:8].js',
        // test the `pathData.filename` after changes
        filename: (pathData) => {
          console.log('-- JS.filename: ', {
            filename: pathData.filename,
          });

          return 'js/[name].[contenthash:8].js';
        },
      },
      css: {
        //filename: 'assets/css/[name].[contenthash:8].css',
        // test the `pathData.filename` after changes
        filename: (pathData) => {
          console.log('-- CSS.filename: ', {
            filename: pathData.filename,
          });

          return 'css/[name].[contenthash:8].css';
        },
      },
      verbose: true,
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css)$/,
        use: ['css-loader'],
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
