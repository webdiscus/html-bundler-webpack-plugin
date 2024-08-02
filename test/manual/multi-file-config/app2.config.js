const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  name: 'second',
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/output2/'),
  },

  entry: {
    main: './src/main.js',
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        about: './src/about.html',
      },
    }),
  ],
};
