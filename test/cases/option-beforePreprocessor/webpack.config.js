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

      // example, how to override the data in the loaderContext before template rendering
      beforePreprocessor: (template, loaderContext) => {
        const { resourcePath, loaderIndex, data } = loaderContext;
        const loaderObject = loaderContext.loaders[loaderIndex];

        let sitename = 'Homepage';
        if (resourcePath.includes('about.html')) sitename = 'About';

        let dataAsString = JSON.stringify(data).replace('[sitename]', sitename);
        const newData = JSON.parse(dataAsString);

        //loaderContext.data = newData; // the `loaderContext.data` is read-only
        loaderObject.data = newData; // the new data must be set using the `loaderObject.data`

        return template.replaceAll('{{old_webroot}}', '{{webroot}}'); // modify template content
      },
      preprocessor: 'handlebars',
    }),
  ],
};
