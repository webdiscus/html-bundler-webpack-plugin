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
        index: './src/templates/home.html',
        about: './src/templates/about.html',
      },
      data: {
        company: {
          name: 'Awesome Corp',
          address: '123 Main Street, Springfield',
          phone: '+1 234 567 890',
          email: 'info@awesomecorp.com',
        },
      },
    }),
  ],
};
