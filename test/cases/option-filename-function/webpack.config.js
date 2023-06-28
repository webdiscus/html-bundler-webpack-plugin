const path = require('path');
const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  entry: {
    home: './src/home.html',
    about: './src/about.html',
  },

  plugins: [
    new HtmlBundlerPlugin({
      filename: ({ filename, chunk: { name } }) => {
        return name === 'home' ? 'index.html' : '[name].html';
      },
    }),
  ],
};
