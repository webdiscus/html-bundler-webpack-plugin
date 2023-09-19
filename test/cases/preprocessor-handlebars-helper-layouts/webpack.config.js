const path = require('path');
const HtmlBundlerPlugin = require('../../../');

// test local helpers
//const layoutHelpers = require('./src/views/helpers/layouts');
const handlebars = require('handlebars');
const layoutHelpers = require('handlebars-layouts');

module.exports = {
  mode: 'production',
  output: {
    path: path.resolve(__dirname, './dist'),
  },
  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        extend: './src/views/templates/extend.html',
        append: './src/views/templates/append.html',
        prepend: './src/views/templates/prepend.html',
        replace: './src/views/templates/replace.html',
        embed: './src/views/templates/embed.html',
        bogus: './src/views/templates/bogus.html',
        context: './src/views/templates/context.html',
        'deep-extend': './src/views/templates/deep-extend.html',
        hash: './src/views/templates/hash.html',
        'non-object': {
          import: './src/views/templates/non-object.html',
          data: { title: '', key: 'value' },
        },
      },
      js: {
        filename: 'js/[name].bundle.js',
      },
      css: {
        filename: 'css/[name].bundle.css',
      },
      data: './src/views/data/users.json',
      preprocessor: 'handlebars',
      preprocessorOptions: {
        //helpers: layoutHelpers, // test local helpers
        helpers: layoutHelpers(handlebars), // test `handlebars-layouts` helpers
        partials: [
          //
          path.join(__dirname, 'src/views/partials/'),
        ],
      },
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(css)$/,
        use: ['css-loader'],
      },
    ],
  },
};
