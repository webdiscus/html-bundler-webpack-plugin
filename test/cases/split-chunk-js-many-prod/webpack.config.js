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
        index: 'src/index.html',
      },

      js: {
        filename: 'js/[name].bundle.js',
      },

      //verbose: true,
    }),
  ],

  optimization: {
    runtimeChunk: 'single', // extract runtime script from all modules
    splitChunks: {
      cacheGroups: {
        //chunks: 'all', // DON'T use default splitting, it's break the compilation process in the plugin
        app: {
          // split scripts only, because webpack compile all assets such as css, html, into JS module
          test: /\.(js|ts)$/,
          // note: when used splitChunks.cacheGroups, then use the `filename` option,
          // because output.chunkFilename is ignored
          //filename: 'js/[id].chunk.js',
          chunks: 'all', // <= important to split a bundle in many small chunks
          maxSize: 100, // <= important to split a bundle in many small chunks
          enforce: true, // <= important to split a bundle in many small chunks
        },
      },
    },
  },
};
