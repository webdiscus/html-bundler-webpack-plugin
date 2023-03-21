const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',
  devtool: false,

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },
      loaderOptions: {
        preprocessor: 'handlebars',
        preprocessorOptions: {
          //views: [path.join(__dirname, './src/partials/')], // test without views option
        },
      },
    }),
  ],
};
