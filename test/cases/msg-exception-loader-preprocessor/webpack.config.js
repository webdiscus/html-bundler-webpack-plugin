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
              // test error in preprocessor
              preprocessor: (content, { data }) => UndefinedFuncion(),
            },
          },
        ],
      },
    ],
  },
};
