const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

class MyPlugin extends HtmlBundlerPlugin {
  /**
   * @param {HtmlBundlerPluginOptions|{}} options
   */
  constructor(options = {}) {
    // here can be defined your default options
    super({
      ...options,
    });
  }

  /**
   * Called when a compiler object is initialized.
   * Override abstract method.
   *
   * @param {Compiler} compiler The instance of the webpack compilation.
   */
  init(compiler) {
    // add to the postprocess pipeline the additional process
    // note: currently supported only `postprocess` pipeline
    this.addProcess('postprocess', (content) => {
      // called after postprocess plugin option
      return content.replace('REPLACE ME IN NEXT POSTPROCESS', 'The new replaced content.');
    });
  }
}

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new MyPlugin({
      entry: {
        index: './src/index.html',
      },
      postprocess: (content, info, compilation) => {
        // called first
        return content.replace('REPLACE ME FIRST', 'REPLACE ME IN NEXT POSTPROCESS');
      },
    }),
  ],
};
