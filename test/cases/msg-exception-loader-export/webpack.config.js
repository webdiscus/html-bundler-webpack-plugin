const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },
      loaderOptions: {
        sources: false,
        // simulate error by export of compiled result
        preprocessor: (content, { data }) => false,
      },
    }),
  ],
};
