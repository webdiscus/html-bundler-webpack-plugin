const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },
      js: {
        inline: {
          keepAttributes: ({ attributes, attribute, value }) => {
            if (attribute === 'type' && value === 'text/javascript') return true;
            if (attribute === 'id' && attributes?.type === 'text/javascript') return true;
            if (attribute === 'defer') return true;
            if (attribute === 'src') return false;
          },
        },
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.txt$/,
        type: 'asset/source',
      },
    ],
  },
};
