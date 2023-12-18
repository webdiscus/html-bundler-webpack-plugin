const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/views/pages/home.hbs',
      },
      preprocessor: 'handlebars',
      preprocessorOptions: {
        views: [
          'src/views/includes', // relative path
        ],
        partials: [
          'src/views/partials', // relative path
        ],
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['css-loader'],
      },
    ],
  },
};
