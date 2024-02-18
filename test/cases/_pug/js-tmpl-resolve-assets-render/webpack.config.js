const path = require('path');
const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '',
  },

  resolve: {
    plugins: [
      new TsConfigPathsPlugin({
        configFile: path.join(__dirname, 'tsconfig.json'),
        // ATTENTIONS
        // if you require a js file w/o extension via alias from tsconfig, like `var data = require('@data/colors')`
        // then the omitted extension must be defined in the option:
        extensions: ['.js'],
      }),
    ],
    alias: {
      Images: path.join(__dirname, 'src/assets/images/'),
      Data: path.join(__dirname, 'src/data/'),
    },
  },

  entry: {
    index: './src/views/index.pug',
  },

  plugins: [
    new HtmlBundlerPlugin({
      preprocessor: 'pug',
      preprocessorOptions: {
        basedir: path.join(__dirname, 'src/'),
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(png|webp|jpe?g)$/,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
