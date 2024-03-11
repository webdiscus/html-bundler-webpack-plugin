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
        index: './src/views/pages/home/index.html',
        about: './src/views/pages/about/index.html',
      },
      preprocessor: 'ejs',
      //preprocessor: false,
      //hotUpdate: true,
      //verbose: true,
    }),
  ],

  // module: {
  //   rules: [
  //     {
  //       test: /\.(css)$/,
  //       use: ['css-loader'],
  //     },
  //   ],
  // },

  // devServer: {
  //   static: {
  //     directory: path.join(__dirname, 'dist'),
  //   },
  //   watchFiles: {
  //     paths: ['src/**/*.*'],
  //     options: {
  //       usePolling: true,
  //     },
  //   },
  // },

  watchOptions: {
    // fix twice recompilation the same file
    aggregateTimeout: 600,
  },
};
