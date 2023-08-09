const HtmlBundlerPlugin = require('../../../');

// test minimal Webpack options
module.exports = {
  plugins: [
    new HtmlBundlerPlugin({
      entry: './src',
    }),
  ],
};
