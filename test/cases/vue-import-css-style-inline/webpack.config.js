const { VueLoaderPlugin } = require('vue-loader');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

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
      css: {
        inline: true,
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
        test: /\.(css|sass|scss)$/i,
        use: ['css-loader', 'sass-loader'],
      },
    ],
  },
};
