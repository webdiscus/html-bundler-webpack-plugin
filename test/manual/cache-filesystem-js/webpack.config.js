const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  //mode: 'production',
  //mode: 'development',
  //stats: 'normal',
  //stats: 'errors-warnings',
  //devtool: false,

  output: {
    path: path.join(__dirname, 'dist/'),
    clean: true,
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        //index: './src/index.html',
        index: {
          import: './src/index.html',
          // test: filename as function
          filename: (pathData) => {
            //console.log('\n\n*** entry.index.filename: : ', { pathData });
            return '[name].html';
          },
        },
      },

      // filename: (pathData) => {
      //   console.log('\n\n*** plugin.filename: : ', { pathData });
      //   return '[name].html';
      // },

      js: {
        //filename: 'js/[name].[contenthash:8].js',
        // test: filename as function
        filename: (pathData) => {
          //console.log('\n\n*** js.filename: : ', { pathData });
          return 'js/[name].[contenthash:8].js';
        },
        //inline: true,
      },

      verbose: true,
    }),
  ],

  performance: {
    hints: false, // disable the size limit warning
  },

  // test filesystem cache
  cache: {
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
