const fs = require('fs');
const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  entry: {
    index: './src/index.pug',
  },

  plugins: [
    new HtmlBundlerPlugin({
      preprocessor: 'pug',
      preprocessorOptions: {},
      loaderOptions: {
        sources: [
          {
            tag: 'img',
            // Static resource URL from public web path should not be parsed.
            // Leave as is:
            //   img(src='/assets/image.png')
            //   link(rel='stylesheet' href='assets/style.css')
            // Must be processed:
            //   img(src=require('./image.png'))
            //   link(rel='stylesheet' href=require('./style.css'))
            filter: ({ value }) => {
              //console.log('---- FILTER: ', { value });
              return (
                value.startsWith('require(') ||
                value.startsWith('./') ||
                value.startsWith('../') ||
                (path.isAbsolute(value) && fs.existsSync(value))
              );
            },
          },
        ],
      },
      css: {
        filename: 'css/[name].[contenthash:8].css',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css|sass|scss)$/,
        use: ['css-loader', 'sass-loader'],
      },

      {
        test: /\.(png|jpg|jpeg)/,
        type: 'asset/resource', // process required images in pug
        generator: {
          filename: 'img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
