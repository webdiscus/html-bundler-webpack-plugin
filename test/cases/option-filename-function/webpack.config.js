const path = require('path');
const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  resolve: {
    alias: {
      '@images': path.join(__dirname, '../../fixtures/images'),
    },
  },

  entry: {
    home: './src/home.html',
    about: './src/about.html',
  },

  plugins: [
    new HtmlBundlerPlugin({
      filename: ({ filename, chunk: { name } }) => {
        //console.log('\n\n~~~ filename: ', { name, filename });

        return name === 'home' ? 'index.html' : '[name].html';
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(png|jpe?g|ico|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
