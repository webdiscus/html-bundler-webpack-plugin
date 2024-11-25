const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',

  output: {
    path: path.join(__dirname, 'dist/'),
    clean: true,
  },

  entry: {
    // HMR works only if all CSS are imported in one JS file
    app: './src/app.js',

    // BUG: Webpack does not recognize changes by HMR Checking for updates on the server
    //'style-a': './src/style-a.css', // BUG: after changes - Nothing hot updated
    //'style-b': './src/style-b.css', // OK: Updated modules ... (HMR works only by last entrypoint)

    // the same bug
    // 'script-a': './src/script-a.js', // BUG: after changes - Nothing hot updated
    // 'script-b': './src/script-b.js', // OK: Updated modules ... (HMR works only by last entrypoint)
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './src/home.html',
      filename: path.join(__dirname, 'dist', 'index.html'),
    }),
  ],

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },

  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    hot: 'only', // enable HMR
  },
};
