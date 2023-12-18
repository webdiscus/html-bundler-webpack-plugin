const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

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
          // Inlines when source filename contains `-inline.js` string.
          source: /.+-inline[.]js/,
        },
      },
      verbose: true, // test inlined asset
    }),
  ],
};
