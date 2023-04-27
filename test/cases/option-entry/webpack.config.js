const path = require('path');
const HtmlBundlerPlugin = require('../../../');

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

  //entry: undefined,
  entry: {
    index: 'src/views/index.html',
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        // pass diff data into template
        'pages/demo': {
          import: 'src/views/template.html',
          data: {
            title: 'Demo',
            header: 'Demo page',
          },
        },

        // template w/o data
        help: 'src/views/help.html',

        // pass diff data into same template
        'pages/contact': {
          //import: 'src/views/template.html?q=1&{"a":2,"b":"c"}',
          import: 'src/views/template.html',
          data: {
            title: 'Contact',
            header: 'Contact page',
          },
        },

        // pass diff data into same template
        about: {
          import: 'src/views/template.html',
          filename: () => 'pages/[name].html',
          data: {
            title: 'About',
            header: 'About page',
          },
        },
      },

      loaderOptions: {
        preprocessor: (content, { data }) => {
          return render(content, data);
        },
      },
    }),
  ],
};
