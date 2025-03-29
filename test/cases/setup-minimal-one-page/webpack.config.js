const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/views/home.html',
      },
    }),
  ],
  module: {
    rules: [
      {
        test: /\.s?css$/,
        use: ['css-loader', 'sass-loader'],
      },
      {
        test: /\.(png|jpe?g|svg)$/,
        type: 'asset/resource',
      },
    ],
  },
};
