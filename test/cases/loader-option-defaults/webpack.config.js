const path = require('path');
const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
    clean: true,
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: 'src/views/index.html',
      },
    }),
  ],

  module: {
    rules: [
      {
        // TODO: implement default loader
        test: /\.(html)$/,
        loader: HtmlBundlerPlugin.loader,
      },
    ],
  },
};
