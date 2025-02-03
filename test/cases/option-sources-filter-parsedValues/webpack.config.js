const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

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

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },
      sources: [
        {
          tag: 'img',
          attributes: ['data-srcset'],
          // test parsedValue
          filter: ({ attribute, value, parsedValue }) => {
            //console.log('\n### filter attributes: ', { attribute, value, parsedValue });
            if (attribute === 'src' && parsedValue.includes('@images/pear.png')) return false;
            if (attribute === 'data-srcset' && parsedValue.includes('@images/lemon.png')) return false;
          },
        },
      ],
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(png|jpe?g|ico|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext][query]',
        },
      },
    ],
  },
};
