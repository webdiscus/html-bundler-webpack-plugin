const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',
  //mode: 'development',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },
      js: {
        filename: 'assets/js/[name].bundle.js',
      },
      css: {
        filename: 'assets/css/[name].bundle.css',
      },
    }),
  ],

  module: {
    rules: [
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
          test: /[\\/]node_modules[\\/].+\.(js|ts)$/, // use it when in the template is defined CSS from node modules to exclude CSS from the group
          name(module, chunks, groupName) {
            const moduleName = module.resourceResolveData.descriptionFileData.name.replace('@', '');
            return `${groupName}.${moduleName}`;
          },
          enforce: true,
        },
      },
    },
  },
};
