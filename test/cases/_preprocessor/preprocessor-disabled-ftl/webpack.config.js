const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },

  plugins: [
    new HtmlBundlerPlugin({
      filename: '[name].ftl',
      test: /\.ftl$/,
      entry: 'src/',
      // entry: {
      //   index: 'src/index.ftl',
      // },
      js: {
        filename: 'js/[name].[contenthash:8].js',
        // TODO: idea to add a custom prefix to output filename in processed template
        //   <script src="${url.resourcesPath}/js/main.5317c1f6.js"></script>
        //filenamePrefix: '${url.resourcesPath}/',
      },
      css: {
        filename: 'css/[name].[contenthash:8].css',
        //filenamePrefix: '${url.resourcesPath}/',
      },
      preprocessor: false,
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(s?css)$/,
        use: ['css-loader', 'sass-loader'],
      },
      {
        test: /\.(ico|png|jpe?g|svg)/,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
