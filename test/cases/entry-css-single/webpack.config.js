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
        style: 'src/style.css',
      },
      css: {
        filename: '[name].bundle.css',
        // filename: (pathData) => {
        //   const { filename } = pathData;
        //   console.log('------- CSS.filename: ', {
        //     filename,
        //     filenameTemplate: pathData.chunk.filenameTemplate?.toString(),
        //   });
        //
        //   return '[name].bundle.css';
        // },
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
