const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },
      loaderOptions: {
        sources: false,
        // simulate the error by exporting not a string as expected
        preprocessor: (content, { data }) => 123,
      },
    }),
  ],
};
