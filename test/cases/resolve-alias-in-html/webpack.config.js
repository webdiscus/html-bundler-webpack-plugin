const path = require('path');
const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',
  devtool: false,

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '/',
  },

  resolve: {
    alias: {
      // test standard naming of assets
      Styles: path.join(__dirname, './src/assets/styles/'),
      Scripts: path.join(__dirname, './src/assets/scripts/'),
      Images: path.join(__dirname, './src/assets/images/'),
      Fonts: path.join(__dirname, './src/assets/fonts/'),

      // test the `@` prefix only as alias
      '@': path.join(__dirname, './src/assets/'),

      // test the single char as alias
      '&': path.join(__dirname, './src/assets/'),

      // test alias as string
      ImagesA: path.join(__dirname, './src/assets-a/images/'),

      // test alias as string contained a prefix in name
      ImagesB: path.join(__dirname, './src/assets-b/images1/'),
      '~ImagesB': path.join(__dirname, './src/assets-b/images2/'),
      '@ImagesB': path.join(__dirname, './src/assets-b/images3/'),

      // test alias as array
      ImagesC: [path.join(__dirname, './src/assets/images/'), path.join(__dirname, './src/assets-c/images/')],

      // test alias as array contained a prefix in name
      ImagesD: [path.join(__dirname, './src/assets/images/'), path.join(__dirname, './src/assets-d/images1/')],
      '~ImagesD': [path.join(__dirname, './src/assets/images/'), path.join(__dirname, './src/assets-d/images2/')],
      '@ImagesD': [path.join(__dirname, './src/assets/images/'), path.join(__dirname, './src/assets-d/images3')],
    },
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/views/index.html',
      },
      js: {
        filename: 'assets/js/[name].[contenthash:8].js',
      },
      css: {
        filename: 'assets/css/[name].[contenthash:8].css',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.html$/,
        loader: HtmlBundlerPlugin.loader,
      },

      {
        test: /\.(css|sass|scss)$/,
        use: ['css-loader', 'sass-loader'],
      },

      {
        test: /\.(png|jpe?g|ico)/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },

      {
        test: /\.(eot|ttf|woff|woff2)/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[name][ext]',
        },
      },
    ],
  },
};
