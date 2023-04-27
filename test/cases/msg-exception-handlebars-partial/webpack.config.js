const path = require('path');
const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },
      loaderOptions: {
        preprocessor: 'handlebars',
        preprocessorOptions: {
          partials: {
            footer: path.join(__dirname, './src/partials/not-exists-file'), // test partials file not found
          },
        },
      },
    }),
  ],
};
