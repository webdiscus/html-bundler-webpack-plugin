const path = require('path');
// the 'enhanced-resolve' package already used in webpack, don't need to define it in package.json
const ResolverFactory = require('enhanced-resolve');

const PluginService = require('../Plugin/PluginService');
const Snapshot = require('../Plugin/Snapshot');
const { resolveException } = require('./Messages/Exeptions');

class Resolver {
  aliasRegexp = /^([~@])?(.*?)(?=\/)/;
  aliasFileRegexp = /^([~@])?(.*?)$/;
  hasAlias = false;
  fs = null;
  loaderContext = null;
  pluginCompiler = null;

  /** The list of ResolverType values, see types.d.ts */
  static types = {
    default: 'default',
    script: 'script',
    style: 'style',
    asset: 'asset',
    include: 'include',
  };

  /**
   * @param {Object} loaderContext
   */
  constructor(loaderContext) {
    this.loaderContext = loaderContext;
    this.pluginCompiler = loaderContext._compilation.compiler;
    this.fs = loaderContext.fs.fileSystem;
  }

  /**
   * @param {Option} loaderOption
   */
  init(loaderOption) {
    const options = loaderOption.getWebpackResolve();

    this.basedir = loaderOption.getBasedir();
    this.contextdir = loaderOption.getContextDir();
    this.aliases = options.alias || {};
    this.hasAlias = Object.keys(this.aliases).length > 0;

    const scriptResolverOptions = {
      ...options,
      preferRelative: options.preferRelative !== false,
      // resolve 'exports' field in package.json, default value is: ['webpack', 'production', 'browser']
      conditionNames: ['require', 'node'],
      // restrict default extensions list '.js', '.json', '.wasm' for faster resolving of script files
      extensions: options.extensions.length ? options.extensions : ['.js'],
    };

    const styleResolverOptions = {
      ...options,
      preferRelative: options.preferRelative !== false,
      byDependency: {},
      conditionNames: ['style', 'sass'],
      // firstly, try to resolve 'browser' or 'style' fields in package.json to get compiled CSS bundle of a module,
      // e.g. bootstrap has the 'style' field, but material-icons has the 'browser' field for resolving the CSS file;
      // if a module has not a client specified field, then must be used path to client file of the module,
      // like `module-name/dist/bundle.css`
      mainFields: ['style', 'browser', 'sass', 'main'],
      mainFiles: ['_index', 'index'],
      extensions: ['.scss', '.sass', '.css'],
      restrictions: this.getStyleResolveRestrictions(),
    };

    const fileResolverOptions = {
      ...options,
      preferRelative: options.preferRelative !== false,
      // resolve 'exports' field in package.json, default value is: ['webpack', 'production', 'browser']
      conditionNames: ['require', 'node'],
      // restrict default extensions list '.js', '.json', '.wasm' for faster resolving of script files
      extensions: options.extensions.length ? options.extensions : ['.js'],
      // remove extensions for faster resolving of files different from styles and scripts
      //extensions: [], // don't work if required js file w/o an ext in template
    };

    // resolver for scripts from the 'script' tag, npm modules, and other js files
    this.resolveScript = ResolverFactory.create.sync(scriptResolverOptions);

    // resolver for styles from the 'link' tag
    this.resolveStyle = ResolverFactory.create.sync(styleResolverOptions);

    // resolver for resources: scripts w/o an ext (e.g. in pug: require('./data')), images, fonts, etc.
    this.resolveFile = ResolverFactory.create.sync(fileResolverOptions);

    // TODO: use the resolver build-in in loaderContext, problem: this resolver is async
    //const resolveFileAsync = this.loaderContext.getResolve(fileResolverOptions);
    //this.resolveFile = async (context, request) => await resolveFileAsync(context, request);

    //const resolveStyleAsync = this.loaderContext.getResolve(styleResolverOptions);
    //this.resolveStyle = async (context, request) => await resolveStyleAsync(context, request);

    //const resolveScriptAsync = this.loaderContext.getResolve(scriptResolverOptions);
    //this.resolveScript = async (context, request) => await resolveScriptAsync(context, request);
  }

  /**
   * Return a list of resolve restrictions to restrict the paths that a request can be resolved on.
   * @see https://webpack.js.org/configuration/resolve/#resolverestrictions
   * @return {Array<RegExp|string>}
   */
  getStyleResolveRestrictions() {
    const restrictions = PluginService.getOptions(this.pluginCompiler).getCss().test;

    return Array.isArray(restrictions) ? restrictions : [restrictions];
  }

  /**
   * Resolve the request.
   *
   * @param {string} request The request to resolve.
   * @param {string} issuer The issuer of resource.
   * @param {ResolverType} [type = 'default'] The type of resolving request.
   * @return {string}
   */
  resolve(request, issuer, type = Resolver.types.default) {
    const [issuerFile] = issuer.split('?', 1);
    const context = this.contextdir || path.dirname(issuerFile);
    const isScript = type === Resolver.types.script;
    const isStyle = type === Resolver.types.style;
    let isAliasArray = false;
    let resolvedRequest = null;

    // resolve an absolute path by prepending options.basedir
    if (this.basedir && request[0] === '/') {
      resolvedRequest = path.join(this.basedir, request);
    }

    // resolve a relative file
    if (resolvedRequest == null && request[0] === '.') {
      resolvedRequest = path.join(context, request);
    }

    // resolve a file by webpack `resolve.alias`
    if (resolvedRequest == null) {
      resolvedRequest = this.resolveAlias(request, type);
      isAliasArray = Array.isArray(resolvedRequest);
    }

    // fallback to enhanced resolver
    if (resolvedRequest == null || isAliasArray) {
      let normalizedRequest = request;
      // remove optional prefix in request for enhanced resolver
      if (isAliasArray) normalizedRequest = this.removeAliasPrefix(normalizedRequest);

      try {
        resolvedRequest = isScript
          ? this.resolveScript(context, normalizedRequest)
          : isStyle
            ? this.resolveStyle(context, normalizedRequest)
            : this.resolveFile(context, normalizedRequest);
      } catch (error) {
        if (isScript) {
          // extract important ending of filename from the request
          // app.js => app.js
          // @alias/app.js => app.js
          // @alias/path/to/app.js => path/to/app.js
          // TODO: fix limitation, when a request is like `../../app.js` and used an array of aliases in the tsconfig

          let [requestFile] = normalizedRequest.split('?', 1);
          let beginPos = requestFile.indexOf('/');

          if (beginPos > 0) requestFile = requestFile.slice(beginPos);

          Snapshot.addMissingFile(issuer, requestFile);
        }

        resolveException(error, request, path.relative(this.loaderContext.rootContext, issuer));
      }
    }

    if (isScript) {
      resolvedRequest = this.resolveScriptExtension(resolvedRequest);
    }

    // request of the svg file can contain a fragment id, e.g., shapes.svg#circle
    const separator = resolvedRequest.indexOf('#') > 0 ? '#' : '?';
    const [resolvedFile] = resolvedRequest.split(separator, 1);

    if (!require.resolve(resolvedFile)) {
      if (isScript) {
        Snapshot.addMissingFile(issuer, resolvedFile);
      }

      const error = new Error(`Can't resolve '${request}' in '${context}'`);
      resolveException(error, request, path.relative(this.loaderContext.rootContext, issuer));
    }

    return resolvedRequest;
  }

  /**
   * Interpolate filename for `compile` mode.
   *
   * @note: the file is the argument of require() and can be any expression, like require('./' + file + '.jpg').
   * See https://webpack.js.org/guides/dependency-management/#require-with-expression.
   *
   * @param {string} value The expression to resolve.
   * @param {string} templateFile The template file.
   * @param {types} [type = 'default'] The type of resolving request.
   * @return {string}
   */
  interpolate(value, templateFile, type = Resolver.types.default) {
    value = value.trim();
    const [, quote, file] = /(^"|'|`)(.+?)(?=`|'|")/.exec(value) || [];
    const isScript = type === 'script';
    const isStyle = type === 'style';
    let interpolatedValue = null;
    let valueFile = file;

    // the argument begin with a string quote
    const context = (this.contextdir || path.dirname(templateFile)) + '/';

    if (!file) {
      // fix webpack require issue `Cannot find module` for the case:
      // - var file = './image.jpeg';
      // require(file) <- error
      // require(file + '') <- solution
      return value + ` + ''`;
    }

    // resolve an absolute path by prepending options.basedir
    if (this.basedir && file[0] === '/') {
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
      interpolatedValue = this.resolveAlias(value.slice(1), type);

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
      }
    }

    // @note: resolve of alias from tsconfig in interpolating string is not supported for `compile` method,
    // the following examples not work:
    // `@data/${pathname}/script`
    // `@data/${pathname}/script.js`
    // `@data/path/${filename}`
    // '@data/path/' + filename

    if (interpolatedValue == null) {
      return value;
    }

    // remove quotes: '/path/to/file.js' -> /path/to/file.js
    let resolvedValue = interpolatedValue.slice(1, -1);
    let resolvedFile;

    // detect only full resolved path, w/o interpolation like: '/path/to/' + file or `path/to/${file}`
    if (!/["'`$]/g.test(resolvedValue)) {
      resolvedFile = resolvedValue;
    }

    if (isScript || isStyle) {
      if (isScript) resolvedFile = this.resolveScriptExtension(resolvedFile);

      return resolvedFile;
    }

    // TODO: test add dependency to watch
    //if (resolvedFile) Dependency.add(resolvedFile);

    return interpolatedValue;
  }

  /**
   * Resolve script request w/o the extension.
   * The extension must be resolved to generate a correct unique JS filename in the plugin.
   * For example, `vendor.min?key=val` resolve to `vendor.min.js?key=val`.
   *
   * @param {string} request The request of script.
   * @return {string}
   */
  resolveScriptExtension(request) {
    const [file, query] = request.split('?');
    // TODO: get resolve extension from webpack config `resolve.extensions` and merge with the default (js|ts)

    const scriptExtensionRegexp = /\.(js|ts)$/;
    const resolvedFile = scriptExtensionRegexp.test(file) ? file : require.resolve(file);

    return query ? resolvedFile + '?' + query : resolvedFile;
  }

  /**
   * Resolve an alias in the argument of require() function.
   *
   * @param {string} request The value of extends/include/require().
   * @return {string | [] | null} If found an alias return the resolved normalized path otherwise return null.
   * @param {ResolverType} type The type of resolving request.
   * @private
   */
  resolveAlias(request, type) {
    if (this.hasAlias === false) return null;

    const fs = this.fs;
    const hasPath = request.indexOf('/') > -1;
    const aliasRegexp = hasPath ? this.aliasRegexp : this.aliasFileRegexp;

    // special use case for a templating engine, e.g. Pug,
    // when the webpack alias is a file and used by include e.g., `include FILE_ALIAS`,
    // the Pug compiler adds to the alias the `.pug` extension automatically,
    // this added extension must be removed from request
    if (type === Resolver.types.include && !hasPath && PluginService.getOptions(this.pluginCompiler).isEntry(request)) {
      let pos = request.lastIndexOf('.');
      if (pos > 0) {
        request = request.slice(0, pos);
      }
    }

    const [, prefix, aliasName] = aliasRegexp.exec(request) || [];
    if (!prefix && !aliasName) return null;

    let alias = (prefix || '') + (aliasName || '');
    let aliasPath = this.aliases[alias] || this.aliases[aliasName];
    let resolvedFile = aliasPath;

    if (typeof aliasPath === 'string') {
      let paths = [aliasPath, request.slice(alias.length)];

      if (this.basedir && !fs.existsSync(aliasPath)) {
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
  removeAliasPrefix(request) {
    const [, prefix, aliasName] = this.aliasRegexp.exec(request) || [];
    const alias = (prefix || '') + (aliasName || '');

    return prefix != null && aliasName != null && this.aliases[alias] == null ? request.slice(1) : request;
  }
}

module.exports = Resolver;
