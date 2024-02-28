const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  resolve: {
    alias: {
      '@scripts': path.join(__dirname, 'src/scripts/'),
      '@styles': path.join(__dirname, 'src/styles/'),
    },
  },

  entry: {
    index: './src/index.pug',
  },

  plugins: [
    new HtmlBundlerPlugin({
      preprocessor: 'pug',
      preprocessorOptions: {},
      pretty: true, // TODO: test inline script with pretty
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css)$/,
        use: ['css-loader'],
      },
    ],
  },
};
