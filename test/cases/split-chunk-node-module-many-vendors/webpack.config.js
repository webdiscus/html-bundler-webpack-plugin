const path = require('path');
const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',
  //mode: 'development',

  output: {
    path: path.join(__dirname, 'dist/'),
    clean: true,
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },
      js: {
        filename: 'assets/js/[name].[contenthash:8].js',
      },
      css: {
        filename: 'assets/css/[name].[contenthash:8].css',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.html/,
        loader: HtmlBundlerPlugin.loader,
      },
      {
        test: /\.(css|sass|scss)$/,
        use: ['css-loader', 'sass-loader'],
      },
    ],
  },

  optimization: {
    runtimeChunk: 'single', // extract runtime script from all modules
    splitChunks: {
      chunks: 'all',
      minSize: 10000, // extract modules bigger than 10KB, defaults is 30KB
      cacheGroups: {
        vendor: {
          //test: /[\\/]node_modules[\\/]/,
          test: /[\\/]node_modules[\\/].+\.(js|ts)$/, // use it when in Pug is defined CSS from node modules to exclude CSS from group
          name(module) {
            // save many modules from same scope as `scope-module.js`
            //const name = module.resourceResolveData.descriptionFileData.name.replace('@', '').replace('/', '-');

            // save many modules from same scope in scope directory
            const name = module.resourceResolveData.descriptionFileData.name.replace('@', '');

            return `npm.${name}`;
          },
          enforce: true,
        },
      },
    },
  },
};
