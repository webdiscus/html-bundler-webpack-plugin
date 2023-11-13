const { VueLoaderPlugin } = require('vue-loader');
const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',
  output: {
    clean: true,
  },
  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm-bundler',
    },
    extensions: ['.ts', '...'],
  },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlBundlerPlugin({
      entry: {
        index: 'src/views/index.html',
      },
    }),
  ],
  module: {
    rules: [
      {
        test: /\.vue$/i,
        use: ['vue-loader'],
      },
      {
        test: /\.(sass|scss)$/i,
        use: ['css-loader', 'sass-loader'],
      },
    ],
  },
};
