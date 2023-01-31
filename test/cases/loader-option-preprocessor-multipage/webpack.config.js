const path = require('path');
const HtmlBundlerPlugin = require('../../../');

const template = `src/views/template.html`;

const data = {
  1: { title: 'Home', header: 'Home page' },
  2: { title: 'About', header: 'About page' },
  3: { title: 'Contact', header: 'Contact page' },
};

const findData = (id) => data[id] || {};

const render = (content, data) => {
  for (const key in data) {
    const search = new RegExp(`{{ *${key} *}}`, 'g');
    const value = data[key];

    content = content.replace(search, value);
  }

  return content;
};

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  entry: {
    'pages/1': `${template}?id=1`, // => dist/pages/1.html
    'pages/2': `${template}?id=2`, // => dist/pages/2.html
    'pages/3': `${template}?id=3`, // => dist/pages/3.html
  },

  plugins: [new HtmlBundlerPlugin()],

  module: {
    rules: [
      {
        test: /\.(html)$/,
        loader: HtmlBundlerPlugin.loader,
        options: {
          preprocessor: (content, { resource }) => {
            const [, query] = resource.split('?');
            const [, id] = query.split('=');
            const data = findData(id);

            return render(content, data);
          },
        },
      },
      {
        test: /\.(png|svg|jpe?g|webp)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
