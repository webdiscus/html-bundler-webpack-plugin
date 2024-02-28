const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  entry: {
    // pass custom data as JSON string via query
    //index: './src/index.pug?customData=' + JSON.stringify({ options: { title: 'My title' } }),
    // TODO: fix - 'My title' will be decoded as `My+title`
    index: './src/index.pug?' + JSON.stringify({ customData: { title: 'Test' } }),
    //index: './src/index.pug?' + encodeURIComponent(JSON.stringify({ customData: { title: 'My title' } })),
  },

  plugins: [
    new HtmlBundlerPlugin({
      preprocessor: 'pug',
    }),
  ],
};

// here is correct encoded
//console.log(encodeURIComponent(JSON.stringify({ customData: { title: 'My title' } })));
