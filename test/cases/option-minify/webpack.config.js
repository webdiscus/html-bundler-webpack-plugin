const path = require('path');
const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        'style.bundle': 'src/style.css', // test after render process for entry templates only
        index: './src/index.html',
      },
      minify: true,
    }),
  ],

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['css-loader'],
      },
      {
        test: /\.(svg)$/i,
        type: 'asset/inline',
      },
    ],
  },
};
