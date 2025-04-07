const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/templates/home.html',
        about: './src/templates/about.html',
      },
      //data: './src/data/data.cjs', // test changes in CJS file
      data: './src/data/data.mjs', // test changes in ESM file
      hotUpdate: true, // if JS files are not used, use it to enable live reload
    }),
  ],

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
