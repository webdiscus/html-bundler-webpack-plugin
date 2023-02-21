const path = require('path');
const HtmlBundlerPlugin = require('../../../');
const Eta = require('eta');

const EtaConfig = {
  // defaults async is false, because the `includeFile()` function is sync,
  // wenn async is true then must be used `await includeFile()`
  async: true,
  useWith: true, // to use data in template without `it.` scope
  root: process.cwd(),
  views: path.join(process.cwd(), 'src/views/'),
};

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      test: /\.(html|ejs|eta)$/,
      entry: {
        index: {
          import: './src/views/home.eta',
          data: {
            title: 'Home',
            headline: 'Breaking Bad',
            people: ['Walter White', 'Jesse Pinkman'],
          },
        },
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(html|ejs|eta)$/,
        loader: HtmlBundlerPlugin.loader,
        options: {
          preprocessor: (content, { data }) => Eta.render(content, data, EtaConfig),
        },
      },
      {
        test: /\.(png|svg|jpe?g|webp)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
