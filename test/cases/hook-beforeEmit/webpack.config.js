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
    }),
    {
      apply(compiler) {
        const pluginName = 'myPlugin';
        compiler.hooks.compilation.tap(pluginName, (compilation) => {
          const hooks = HtmlBundlerPlugin.getHooks(compilation);

          // test hook
          hooks.beforeEmit.tap(pluginName, (content, { entry, assets, outputPath }) => {
            // test modify generated HTML
            content = content.replace('Hello World!', 'Hi Webpack!');
            //console.dir({ _: '\n ### HOOK beforeEmit: ', entry, assets }, { depth: 5 }, content);

            return content;
          });
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
