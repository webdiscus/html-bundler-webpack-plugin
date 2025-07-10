const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

// TODO: this test case doesn't work! It's reserved for future.

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  resolve: {
    alias: {
      '@images': path.join(__dirname, '../../../fixtures/images'),
    },
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: [
        {
          import: 'src/index.eta',
          filename: 'index.html',
        },
      ],
      // loaderOptions: {
      //   preprocessorMode: 'compile',
      // },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.md$/,
        use: [
          {
            loader: 'html-loader',
          },
          {
            loader: 'markdown-loader',
          },
        ],
      },
      {
        test: /\.css$/,
        use: ['css-loader'],
      },
      {
        test: /\.(png|svg|jpe?g|webp)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
