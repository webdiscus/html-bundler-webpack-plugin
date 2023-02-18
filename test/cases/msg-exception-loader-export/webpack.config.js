const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',
  devtool: false,

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.html/,
        use: [
          {
            loader: HtmlBundlerPlugin.loader,
            options: {
              sources: false,
              // simulate error by export of compiled result
              preprocessor: (content, { data }) => false,
            },
          },
        ],
      },
    ],
  },
};
