const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  stats: {
    children: true,
  },

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  resolve: {
    alias: {
      // test the prefix only as alias
      '@': path.join(__dirname, './src/assets/'),

      // test the single char as alias
      '&': path.join(__dirname, './src/assets/'),

      // test alias as string
      ImagesA: path.join(__dirname, './src/assets-a/images/'),

      // test alias as string contained a prefix in name
      ImagesB: path.join(__dirname, './src/assets-b/images1/'),
      '~ImagesB': path.join(__dirname, './src/assets-b/images2/'),
      '@ImagesB': path.join(__dirname, './src/assets-b/images3'),

      // test alias as array
      ImagesC: [path.join(__dirname, './src/assets/images/'), path.join(__dirname, './src/assets-c/images/')],

      // test alias as array contained a prefix in name
      ImagesD: [path.join(__dirname, './src/assets/images/'), path.join(__dirname, './src/assets-d/images1/')],
      '~ImagesD': [path.join(__dirname, './src/assets/images/'), path.join(__dirname, './src/assets-d/images2/')],
      '@ImagesD': [path.join(__dirname, './src/assets/images/'), path.join(__dirname, './src/assets-d/images3')],
    },
  },

  entry: {
    index: 'src/index.pug',
  },

  plugins: [
    new HtmlBundlerPlugin({
      preprocessor: 'pug',
      preprocessorOptions: {},
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(png|webp|jpe?g)$/,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
