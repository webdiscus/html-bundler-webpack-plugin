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
        index: './src/home.html',
        about: './src/about.html',
      },
      outputPath: 'pages/',
      data: {
        title: 'Welcome to [sitename] website',
        webroot: '/pages',
      },
      beforePreprocessor: (template, { resourcePath, data }) => {
        let sitename = 'Homepage';
        if (resourcePath.includes('about.html')) sitename = 'About';
        data.title = data.title.replace('[sitename]', sitename); // modify template data

        // test return undefined
        //return;
        //return null;
        //return undefined;
      },
      preprocessor: 'handlebars',
    }),
  ],
};
