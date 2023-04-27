const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'production', // mapping is WRONG, the CSS is minified
  //mode: 'development', // mapping is OK, the CSS is not minified
  devtool: 'source-map',

  output: {
    path: path.join(__dirname, 'dist/'),
    clean: false,
  },

  entry: {
    test1: './src/test1.css',
    test2: './src/test2.css',
    test3: './src/test3.css',
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css|scss)/,
        //use: [MiniCssExtractPlugin.loader, 'css-loader'], // mapping is OK, the CSS is not minified
        //use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'], // mapping is WRONG (in production mode)
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            // see [Source mappings wrong when using compressed style](https://github.com/sass/dart-sass/issues/1896)
            // test generated css/css.map here: https://sokra.github.io/source-map-visualization/
            loader: 'sass-loader',
            options: {
              sourceMap: true,
              sassOptions: {
                outputStyle: 'compressed', // mapping is WRONG (defaults in production mode)
                //outputStyle: 'expanded', // mapping is OK
              },
            },
          },
        ],
      },

      {
        test: /\.(png|jpe?g|ico|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
