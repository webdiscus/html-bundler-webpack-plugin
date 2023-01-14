const fs = require('fs');
const path = require('path');
// the 'enhanced-resolve' package already used in webpack, don't need to define it in package.json
const ResolverFactory = require('enhanced-resolve');
const Dependency = require('./Dependency');
const { plugin } = require('./Modules');
const { isWin, pathToPosix } = require('./Utils');
const { resolveException, unsupportedInterpolationException } = require('./Exeptions');

class Resolver {
  static aliasRegexp = /^([~@])?(.*?)(?=\/)/;
  static aliasFileRegexp = /^([~@])?(.*?)$/;
  static hasAlias = false;
  static hasPlugins = false;

  /**
   * @param {string} basedir The the root directory of absolute paths.
   * @param {{}} options The webpack `resolve` options.
   */
  static init({ basedir, options }) {
    this.basedir = basedir;
    this.aliases = options.alias || {};
    this.hasAlias = Object.keys(this.aliases).length > 0;
    this.hasPlugins = options.plugins && Object.keys(options.plugins).length > 0;

    // resolver for scripts from the 'script' tag, npm modules and other js files
    this.resolveFile = ResolverFactory.create.sync({
      ...options,
      preferRelative: options.preferRelative !== false,
      // resolve 'exports' field in package.json, default value is ['webpack', 'production', 'browser']
      conditionNames: ['require', 'node'],
      // restrict default extensions list '.js', '.json', '.wasm' for faster resolving
      extensions: options.extensions.length ? options.extensions : ['.js'],
    });

    // resolver for styles from the 'link' tag
    this.resolveStyle = ResolverFactory.create.sync({
      ...options,
      preferRelative: options.preferRelative !== false,
      byDependency: {},
      conditionNames: ['style', 'sass'],
      // firstly try to resolve 'browser' or 'style' fields in package.json to get compiled CSS bundle of a module,
      // e.g. bootstrap has the 'style' field, but material-icons has the 'browser' field for resolving the CSS file;
      // if a module has not a client specified field, then must be used path to client file of the module,
      // like `module-name/dist/bundle.css`
      mainFields: ['style', 'browser', 'sass', 'main'],
      mainFiles: ['_index', 'index'],
      extensions: ['.scss', '.sass', '.css'],
      restrictions: plugin.getStyleRestrictions(),
    });
  }

  /**
   * Resolve filename.
   *
   * @param {string} file The file to resolve.
   * @param {string} templateFile The template file.
   * @param {string} [type = 'default'] The require type: 'default', 'script', 'style'.
   * @return {string}
   */
  static resolve(file, templateFile, type = 'default') {
    const context = path.dirname(templateFile);
    const isScript = type === 'script';
    const isStyle = type === 'style';
    let isAliasArray = false;
    let resolvedFile = null;

    // resolve an absolute path by prepending options.basedir
    if (file[0] === '/') {
      resolvedFile = path.join(this.basedir, file);
    }

    // resolve a relative file
    if (resolvedFile == null && file[0] === '.') {
      resolvedFile = path.join(context, file);
    }

    // resolve a file by webpack `resolve.alias`
    if (resolvedFile == null) {
      resolvedFile = this.resolveAlias(file);
      isAliasArray = Array.isArray(resolvedFile);
    }

    // fallback to enhanced resolver
    if (resolvedFile == null || isAliasArray) {
      let request = file;
      // remove optional prefix in request for enhanced resolver
      if (isAliasArray) request = this.removeAliasPrefix(request);

      try {
        resolvedFile = isStyle ? this.resolveStyle(context, request) : this.resolveFile(context, request);
      } catch (error) {
        resolveException(error, file, templateFile);
      }
    }

    if (isScript) {
      resolvedFile = this.resolveScriptExtension(resolvedFile);
    } else {
      Dependency.add(resolvedFile);
    }

    return isWin ? pathToPosix(resolvedFile) : resolvedFile;
  }

  /**
   * Interpolate filename for `compile` method.
   *
   * @note: the file is the argument of require() and can be any expression, like require('./' + file + '.jpg').
   * See https://webpack.js.org/guides/dependency-management/#require-with-expression.
   *
   * @param {string} value The expression to resolve.
   * @param {string} templateFile The template file.
   * @param {string} [type = 'default'] The require type: 'default', 'script', 'style'.
   * @return {string}
   */
  static interpolate(value, templateFile, type = 'default') {
    value = value.trim();
    const [, quote, file] = /(^"|'|`)(.+?)(?=`|'|")/.exec(value) || [];
    const isScript = type === 'script';
    const isStyle = type === 'style';
    let interpolatedValue = null;
    let valueFile = file;

    // the argument begin with a string quote
    const context = path.dirname(templateFile) + '/';

    if (!file) {
      // fix webpack require issue `Cannot find module` for the case:
      // - var file = './image.jpeg';
      // require(file) <- error
      // require(file + '') <- solution
      return value + ` + ''`;
    }

    // resolve an absolute path by prepending options.basedir
    if (file[0] === '/') {
      interpolatedValue = quote + this.basedir + value.slice(2);
    }

    // resolve a file in current directory
    if (interpolatedValue == null && file.slice(0, 2) === './') {
      interpolatedValue = quote + context + value.slice(3);
    }

    // resolve a file in parent directory
    if (interpolatedValue == null && file.slice(0, 3) === '../') {
      interpolatedValue = quote + context + value.slice(1);
    }

    // resolve a webpack `resolve.alias`
    if (interpolatedValue == null) {
      interpolatedValue = this.resolveAlias(value.slice(1));

      if (typeof interpolatedValue === 'string') {
        interpolatedValue = quote + interpolatedValue;
      } else if (Array.isArray(interpolatedValue)) {
        interpolatedValue = null;
        valueFile = this.removeAliasPrefix(file);
      }
    }

    // try the enhanced resolver for alias from tsconfig or for alias as array of paths
    // the following examples work:
    // '@data/path/script'
    // '@data/path/script.js'
    // '@images/logo.jpg'
    // `${file}`
    if (interpolatedValue == null) {
      if (file.indexOf('{') < 0 && !file.endsWith('/')) {
        try {
          const resolvedValueFile = isStyle
            ? this.resolveStyle(context, valueFile)
            : this.resolveFile(context, valueFile);
          interpolatedValue = value.replace(file, resolvedValueFile);
        } catch (error) {
          resolveException(error, value, templateFile);
        }
      } else if (file.indexOf('/') >= 0) {
        // @note: resolve of alias from tsconfig in interpolating string is not supported for `compile` method,
        // the following examples not work:
        // `@data/${pathname}/script`
        // `@data/${pathname}/script.js`
        // `@data/path/${filename}`
        // '@data/path/' + filename
        unsupportedInterpolationException(value, templateFile);
      }
    }

    if (interpolatedValue == null) {
      return value;
    }

    if (isWin) interpolatedValue = pathToPosix(interpolatedValue);

    // remove quotes: '/path/to/file.js' -> /path/to/file.js
    let resolvedValue = interpolatedValue.slice(1, -1);
    let resolvedFile;

    // detect only full resolved path, w/o interpolation like: '/path/to/' + file or `path/to/${file}`
    if (!/["'`$]/g.test(resolvedValue)) {
      resolvedFile = resolvedValue;
    }

    if (isScript || isStyle) {
      if (!resolvedFile) {
        unsupportedInterpolationException(value, templateFile);
      }
      if (isScript) resolvedFile = this.resolveScriptExtension(resolvedFile);

      return isWin ? pathToPosix(resolvedFile) : resolvedFile;
    }

    if (resolvedFile) Dependency.add(resolvedFile);

    return interpolatedValue;
  }

  /**
   * Resolve script request w/o extension.
   * The extension must be resolved to generate correct unique JS filename in the plugin.
   * For example: `vendor.min?key=val` resolve to `vendor.min.js?key=val`.
   *
   * @param {string} request The request of script.
   * @return {string}
   */
  static resolveScriptExtension(request) {
    const [resource, query] = request.split('?');
    const scriptExtensionRegexp = /\.(js|ts)$/;
    const resolvedFile = scriptExtensionRegexp.test(resource) ? resource : require.resolve(resource);

    return query ? resolvedFile + '?' + query : resolvedFile;
  }

  /**
   * Resolve an alias in the argument of require() function.
   *
   * @param {string} request The value of extends/include/require().
   * @return {string | [] | null} If found an alias return resolved normalized path otherwise return null.
   * @private
   */
  static resolveAlias(request) {
    if (this.hasAlias === false) return null;

    const hasPath = request.indexOf('/') > -1;
    const aliasRegexp = hasPath ? this.aliasRegexp : this.aliasFileRegexp;
    const [, prefix, aliasName] = aliasRegexp.exec(request) || [];
    if (!prefix && !aliasName) return null;

    let alias = (prefix || '') + (aliasName || '');
    let aliasPath = this.aliases[alias] || this.aliases[aliasName];
    let resolvedFile = aliasPath;

    if (typeof aliasPath === 'string') {
      let paths = [aliasPath, request.slice(alias.length)];
      if (!fs.existsSync(aliasPath)) {
        paths.unshift(this.basedir);
      }
      resolvedFile = path.join(...paths);
    }

    return resolvedFile;
  }

  /**
   * @param {string} request
   * @return {string}
   */
  static removeAliasPrefix(request) {
    const [, prefix, aliasName] = this.aliasRegexp.exec(request) || [];
    const alias = (prefix || '') + (aliasName || '');

    return prefix != null && aliasName != null && this.aliases[alias] == null ? request.slice(1) : request;
  }
}

module.exports = Resolver;
