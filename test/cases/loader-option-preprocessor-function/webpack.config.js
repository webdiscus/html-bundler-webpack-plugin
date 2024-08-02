const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  entry: {
    index: './src/index.html',
  },

  plugins: [
    new HtmlBundlerPlugin({
      preprocessor: (content, loaderContext, loaderOptions) => {
        //console.log(loaderOptions);
        return content.replace('REPLACE_ME', 'World');
      },
    }),
  ],
};
