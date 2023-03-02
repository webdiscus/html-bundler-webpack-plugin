const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common');

const config = {
  mode: 'development',

  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    // enable watch changes in files
    watchFiles: {
      paths: ['src/**/*.*', 'app/**/*.*'],
      options: {
        usePolling: true,
      },
    },
    compress: true,
    //open: true,
  },
};

module.exports = merge(common, config);
