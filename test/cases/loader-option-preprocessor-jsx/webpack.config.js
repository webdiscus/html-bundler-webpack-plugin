const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

const VMScript = require('../../../src/Common/VMScript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  resolve: {
    alias: {
      '@images': path.join(__dirname, '../../fixtures/images'),
    },
    extensions: ['.tsx', '.jsx', '.ts', '.js'],
  },

  plugins: [
    new HtmlBundlerPlugin({
      test: /\.(tsx)$/,
      entry: {
        index: {
          import: './src/index.tsx',
          data: {
            // the variables are available in the TSX with the prefix `locals`, e.g. `locals.title`
            locals: {
              title: 'Home',
              headline: 'Breaking Bad',
              people: ['Walter White', 'Jesse Pinkman'],
            },
          },
        },
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(tsx|jsx)$/,
        use: [
          {
            loader: HtmlBundlerPlugin.loader,
            options: {
              // 2. compile transpiled JS code into HTML
              preprocessor: (content, { resourcePath, rootContext: root, data }) => {
                const vm = new VMScript({ require, exports, React, ...data });
                //console.log('## content: ', content);

                let res = vm.exec(content, { filename: resourcePath, esModule: false });
                //console.log('## RES: ', res);

                let html = renderToStaticMarkup(res);
                //console.log('## renderToStaticMarkup: ', html);

                return html;
              },
            },
          },
          // 1. transpile TSX template into JS code
          'ts-loader',
        ],
      },
      {
        test: /\.(png|svg|jpe?g|webp)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
