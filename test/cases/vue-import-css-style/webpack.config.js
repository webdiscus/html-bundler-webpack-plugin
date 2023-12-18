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
    }),
  ],
  module: {
    rules: [
      {
        test: /\.vue$/i,
        use: ['vue-loader'],
      },
      // {
      //   test: /\.(sass|scss)$/i,
      //   use: ['css-loader', 'sass-loader'],
      // },

      {
        test: /\.(css|sass|scss)$/i,
        oneOf: [
          // {
          //   resourceQuery: /vue/,
          //   //use: ['vue-style-loader', 'css-loader', 'sass-loader'],
          //   use: ['css-loader', 'sass-loader'],
          // },

          // works, but generate different js
          // {
          //   resourceQuery: /module/,
          //   use: [
          //     {
          //       loader: 'css-loader',
          //       options: {
          //         modules: true,
          //       },
          //     },
          //     'sass-loader',
          //   ],
          // },
          {
            use: ['css-loader', 'sass-loader'],
          },
        ],
      },
    ],
  },
};
