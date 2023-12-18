const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

const template = `src/views/template.html`;

const entryData = {
  1: { title: 'Home', header: 'Home page' },
  2: { title: 'About', header: 'About page' },
  3: { title: 'Contact', header: 'Contact page' },
};

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

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        'pages/1': {
          import: template,
          data: entryData['1'],
        },
        'pages/2': {
          import: template,
          data: entryData['2'],
        },
        'pages/3': {
          import: template,
          data: entryData['3'],
        },
      },
      loaderOptions: {
        preprocessor: (content, { data }) => render(content, data),
      },
    }),
  ],
};
