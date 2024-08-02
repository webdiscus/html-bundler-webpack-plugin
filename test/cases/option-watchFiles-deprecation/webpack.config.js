const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },
  plugins: [
    new HtmlBundlerPlugin({
      verbose: true,
      entry: {
        index: './src/index.html',
      },
      watchFiles: {
        paths: ['src'],
        files: [/\.(html|css|js)$/],
        ignore: [/\.(css)$/],
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
