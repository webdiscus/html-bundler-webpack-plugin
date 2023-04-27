const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },
      loaderOptions: {
        // test exception unsupported preprocessor
        preprocessor: '_unsupported_',
      },
    }),
  ],
};
