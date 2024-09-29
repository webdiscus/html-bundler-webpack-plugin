const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },
      preprocessor: (content, loaderContext, loaderOptions) => {
        //console.log(loaderOptions);
        return content.replace('REPLACE_ME', 'World');
      },
    }),
  ],
};
