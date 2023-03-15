import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';

/**
 * Returns the include function.
 *
 * @param {string} root The root path to template partials.
 * @param {string} tmplExt The default extensions of including partials.
 * @return {function(filename: string, options: Object, args: Object): Handlebars.SafeString}
 */
module.exports = ({ root, ext = '.html' }) => {
  /**
   * Include the partial file into a template.
   *
   * @param {string} filename The partial file name.
   * @param {Object} options The options passed via tag attributes into a template.
   * @param {Object} args The parent options passed using the `this` attribute.
   * @return {Handlebars.SafeString}
   */
  return (filename, options, args) => {
    const { ext: fileExt } = path.parse(filename);

    if (!fileExt) filename += ext;

    const template = fs.readFileSync(`${root}${filename}`, 'utf8');
    // pass the original data into sub-sub partials
    const data =
      options.name === 'include' ? { ...options?.hash, ...options.data?.root } : { ...options, ...args?.data?.root };
    const html = Handlebars.compile(template)(data);

    return new Handlebars.SafeString(html);
  };
};
