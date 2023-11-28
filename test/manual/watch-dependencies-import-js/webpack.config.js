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
      // auto processing templates in the path
      entry: {
        index: './src/index.html',
      },

      // test: configure paths to watch file changes
      // watchFiles: {
      //   paths: ['./src'],
      //   //files: [/\.(html|js|sc?ss)$/],
      //   //ignore: [],
      // },

      verbose: true,
    }),
  ],

  // enable live reload
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
