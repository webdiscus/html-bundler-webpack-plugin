const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',
  devtool: 'source-map',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  entry: {
    index: './src/index.html',
  },

  plugins: [new HtmlBundlerPlugin()],

  module: {
    rules: [
      {
        test: /\.(css|scss)$/,
        //use: ['css-loader', 'sass-loader'], // sass-loader <= 15.0.0
        use: [
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                // include the sources in the generated source map (required since sass-loader >= 16.0.0)
                sourceMapIncludeSources: true,
              },
            },
          },
        ],
      },
    ],
  },
};
