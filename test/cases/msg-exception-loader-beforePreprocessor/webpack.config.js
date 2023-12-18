const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },
      loaderOptions: {
        // test error in beforePreprocessor
        beforePreprocessor: (content, { data }) => UndefinedFuncion(),
      },
    }),
  ],
};
