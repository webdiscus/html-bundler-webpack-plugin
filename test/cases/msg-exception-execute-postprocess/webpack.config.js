const path = require('path');
const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '/',
  },

  entry: {
    index: './src/index.html',
  },

  plugins: [
    new HtmlBundlerPlugin({
      modules: [
        {
          test: /\.html$/,
          postprocess: () => {
            throw new Error('issue an error');
          },
        },
      ],
    }),
  ],

  module: {
    rules: [
      {
        test: /\.html/,
        loader: HtmlBundlerPlugin.loader,
      },
    ],
  },
};
