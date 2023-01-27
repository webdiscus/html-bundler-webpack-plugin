const path = require('path');
const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'development',

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '/',
  },

  entry: {
    index: './src/index.html',
  },

  plugins: [new HtmlBundlerPlugin()],

  module: {
    rules: [
      {
        test: /\.html/,
        loader: HtmlBundlerPlugin.loader,
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'css-loader',
            options: {
              // to enable using @import in CSS file disable the `import` option
              import: true,
            },
          },
        ],
      },
    ],
  },
};
