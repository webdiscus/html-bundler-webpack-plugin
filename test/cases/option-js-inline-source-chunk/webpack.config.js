const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',
  //mode: 'development',

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },
      js: {
        //filename: 'js/[name].[contenthash:8].js',
        filename: 'js/[name].bundle.js',

        inline: {
          //enabled: 'auto', // ok
          //enabled: false, // ok

          // Inlines the webpack runtime script. This script is too small to warrant a network request.
          chunk: /runtime.+[.]js/,

          // Inlines when source filename contains `-inline.js` string.
          source: /.+-inline[.]js/,
        },
      },

      verbose: true, // test chunks
    }),
  ],

  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        lib: {
          // split scripts only, because webpack compile all assets such as css, html, into JS module
          test: /\.(js|ts)$/,
          chunks: 'all',
          maxSize: 100,
          enforce: true,
        },
      },
    },
  },
};
