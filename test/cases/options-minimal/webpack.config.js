const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

// test minimal Webpack options
module.exports = {
  plugins: [
    new HtmlBundlerPlugin({
      entry: './src',
    }),
  ],
};
