const path = require('path');
const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: 'auto',
  },

  plugins: [
    new HtmlBundlerPlugin({
      // test verbose option
      verbose: true,
      entry: {
        index: './src/views/home/index.html',
        about: './src/views/about/index.html',
      },
      js: {
        filename: 'js/[name].[contenthash:8].js',
      },
      css: {
        verbose: true,
        filename: 'css/[name].[contenthash:8].css',
      },
      filename: (pathData, assetInfo) => {
        //console.log('filename: ', pathData.chunk.name, '\n', pathData.filename);
        return pathData.chunk.name + '.html';
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
        test: /\.(png|svg|jpg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },

      {
        test: /\.(png|svg)$/i,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 1024,
          },
        },
      },

      // responsive loader
      {
        test: /\.(webp)$/i,
        type: 'asset/resource',
        use: {
          loader: 'responsive-loader',
          options: {
            name: 'assets/img/[name]-[width]w.[ext]',
          },
        },
      },
    ],
  },
};
