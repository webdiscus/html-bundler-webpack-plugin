const path = require('path');
const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html?lang=en',
      },
      js: {
        filename: '[name].[contenthash:8].js',
        chunkFilename: '[name].[contenthash:8].chunk.js',
      },
      css: {
        filename: '[name].[contenthash:8].css',
        chunkFilename: '[name].[contenthash:8].chunk.css',
      },
      // 2. test postprocess callback, called after postprocess hook
      postprocess: (content, info) => {
        return content.replace('Postprocess hook!', 'Hi Webpack!');
      },
    }),
    // test custom plugin using the postprocess hook
    {
      apply(compiler) {
        const pluginName = 'myPlugin';
        compiler.hooks.compilation.tap(pluginName, (compilation) => {
          const hooks = HtmlBundlerPlugin.getHooks(compilation);

          // 1. test async hook
          hooks.postprocess.tapPromise(pluginName, (content, info) => {
            content = content.replace('Hello World!', 'Postprocess hook!');
            return Promise.resolve(content);
          });

          // 1. test sync hook
          // hooks.postprocess.tap(pluginName, (content, info) => {
          //   content = content.replace('Hello World!', 'Postprocess hook!');
          //   console.log('\n ### HOOK postprocess: ', { info, content });
          //   return content;
          // });
        });
      },
    },
  ],

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['css-loader'],
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
