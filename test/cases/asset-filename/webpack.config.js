const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

const sourceDirname = 'src/';

module.exports = {
  mode: 'production',
  devtool: false,

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  entry: {
    index: './src/views/home/index.html',
  },

  plugins: [
    new HtmlBundlerPlugin({
      js: {
        filename: 'js/[name].[contenthash:8].js',
      },
      css: {
        filename: 'css/[name].[contenthash:8].css',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['css-loader'],
      },
      {
        test: /\.(png|webp|jpe?g|ico|svg|woff2)/, // filter for both images and fonts
        type: 'asset/resource',
        generator: {
          filename: (pathData) => {
            const { dir } = path.parse(pathData.filename);
            const outputPath = dir.replace(sourceDirname, '');
            return outputPath + '/[name].[hash:8][ext]';
          },
        },
      },
    ],
  },
};
