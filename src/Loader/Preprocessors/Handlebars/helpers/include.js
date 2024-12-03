const { resolveFile } = require('../../../../Common/FileUtils');

const MarkdownFilter = require('../filters/markdown/index');

/** @typedef {import('handlebars')} Handlebars */
/** @typedef {import('handlebars').HelperOptions} HelperOptions */

/**
 * Return the include helper function.
 *
 * @param {Handlebars} Handlebars The instance of Handlebars module.
 * @param {FileSystem} fs The file system.
 * @param {string} root The root path to template partials.
 * @param {Array<string>} views The paths of including partials.
 * @param {Array<string>} extensions The default extensions of including partials.
 * @return {function(filename: string, options: Object, args: Object): Handlebars.SafeString}
 */
module.exports = ({ Handlebars, fs, root, views = [], extensions = [] }) => {
  const filterOption = {
    highlight: {
      use: {
        module: 'prismjs',
        options: {
          verbose: true, // display loaded dependencies
        },
      },
    },
  };

  MarkdownFilter.init(filterOption);

  /**
   * Include the partial file in a template.
   *
   * @param {string} filename The partial file name.
   * @param {HelperOptions} options The options passed via tag attributes into a template.
   * @param {Object} args The parent options passed using the `this` attribute.
   * @return {Handlebars.SafeString}
   */
  return (filename, options, args) => {
    const file = resolveFile(filename, { fs, root, paths: views, extensions });

    if (!file) {
      throw new Error(`Could not find the include file '${filename}'`);
    }

    const template = fs.readFileSync(file, 'utf8');
    let html;

    if (filename.toLocaleLowerCase().endsWith('.md')) {
      html = MarkdownFilter.apply(template);
    } else {
      // pass the original data into sub-sub partials
      const data =
        options.name === 'include' ? { ...options?.hash, ...options.data?.root } : { ...options, ...args?.data?.root };

      html = Handlebars.compile(template)(data);
    }

    return new Handlebars.SafeString(html);
  };
};
