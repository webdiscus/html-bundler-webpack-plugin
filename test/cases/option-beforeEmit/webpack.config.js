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
        index: './src/index.html',
      },
      js: {
        filename: 'assets/js/[name].bundle.js',
      },
      css: {
        filename: 'assets/css/[name].bundle.css',
      },
      beforeEmit: (content, compileInfo, compilation) => {
        //console.log('\n### afterCompile:', compileInfo);
        return content.replace('REPLACE ME', 'The new replaced content.');
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
};
