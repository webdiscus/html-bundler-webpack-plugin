const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

const sourcePath = path.join(__dirname, 'src'); // => /absolute/path/to/src

const keepEntryFolderStructure = (pathData) => {
  const sourceFile = pathData.filename; // => /absolute/path/to/src/pages/about.pug
  const relativeFile = path.relative(sourcePath, sourceFile); // => pages/about.pug
  const { dir, name } = path.parse(relativeFile); // dir: 'pages', name: 'about'
  return `${dir}/${name}.html`; // => dist/pages/about.html
};

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  entry: {
    // note: each key of entry must be unique,
    // the output filename will be generated by source filename via the keepEntryFolderStructure()
    page001: './src/index.pug', // => dist/index.html
    page002: './src/pages/about.pug', // => dist/pages/about.html
    page003: './src/pages/contact/index.pug', // => dist/pages/contact/index.html
  },

  plugins: [
    new HtmlBundlerPlugin({
      preprocessor: 'pug',
      preprocessorOptions: {},
      // use the function to dynamic generate output filenames for entry files
      filename: keepEntryFolderStructure,
    }),
  ],
};
