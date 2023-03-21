const path = require('path');
const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      verbose: true, // test coloring of a template file by extract resource, expected green
      test: /\.php$/i,
      filename: () => '[name].php',
      entry: {
        'main.bundle': 'src/main.scss', // test the non-template entry file
        index: './src/index.php', // test the processing of php templates
        'pages/about': {
          import: './src/about.php',
          filename: () => '[name].phtml',
        },
      },
      js: {
        filename: 'assets/js/[name].[contenthash:8].js',
      },
      css: {
        filename: 'assets/css/[name].[contenthash:8].css',
      },
      loaderOptions: {
        preprocessor: false,
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
        test: /\.(png|jpe?g|ico|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
