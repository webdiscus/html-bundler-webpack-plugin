const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

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
          import: 'src/index.html',
          filename: 'demo.html',
          data: {
            title: 'Demo',
            markdownFile: 'src/markdown/demo.md', // path relative to project directory
          },
        },
        {
          import: 'src/index.html',
          filename: 'code.html',
          data: {
            title: 'Code',
            markdownFile: 'src/markdown/code.md', // path relative to project directory
          },
        },
      ],
    }),
  ],

  module: {
    rules: [
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
