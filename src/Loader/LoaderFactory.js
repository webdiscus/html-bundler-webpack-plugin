const Resolver = require('./Resolver');
const Option = require('./Option');
const Loader = require('./Loader');
const Dependency = require('./Dependency');

/**
 * Create unique instances pro the webpack config.
 * When used multiple webpack configuration,
 * then for every new config will be created only once instance
 * to avoid needless creating/initialisation of the same instance for many resources used in one config.
 */
class LoaderFactory {
  static #contexts = new WeakMap();

  static init(compiler) {
    if (!this.#contexts.has(compiler)) {
      const context = {
        resolver: null,
        loaderOption: null,
        loader: null,
        dependency: null,
      };

      this.#contexts.set(compiler, context);
    }
  }

  /**
   * @param {Compiler} compiler The webpack Compiler instance.
   * @param {*} opts Options of the Resolver instance.
   * @return {Resolver}
   */
  static createResolver(compiler, ...opts) {
    const context = this.#contexts.get(compiler);

    if (context.resolver == null) {
      context.resolver = new Resolver(...opts);
    }

    return context.resolver;
  }

  /**
   * Get the initialized instance of the Resolver.
   *
   * @param {Compiler} compiler The webpack Compiler instance.
   * @return {Resolver}
   */
  static getResolver(compiler) {
    const context = this.#contexts.get(compiler);

    return context.resolver;
  }

  /**
   * @param {Compiler} compiler The webpack Compiler instance.
   * @param {*} opts Options of the loader Option instance.
   * @return {Promise<Option>}
   */
  static createOption(compiler, ...opts) {
    const context = this.#contexts.get(compiler);

    if (context.loaderOption == null) {
      context.loaderOption = new Option();
    }

    // loader option must be initialised for every entry,
    // because it contains different options, e.g. entry.data

    return context.loaderOption.init(...opts).then(() => context.loaderOption);
  }

  /**
   * @param {Compiler} compiler The webpack Compiler instance.
   * @param {*} opts Options of the Loader instance.
   * @return {Loader}
   */
  static createLoader(compiler, ...opts) {
    const context = this.#contexts.get(compiler);

    // the loader must be unique for every request,
    // e.g., one loader works in render mode, other in compile mode with other loader options
    context.loader = new Loader();

    return context.loader;
  }

  /**
   * @param {Compiler} compiler The webpack Compiler instance.
   * @return {Dependency}
   */
  static createDependency(compiler) {
    const context = this.#contexts.get(compiler);

    if (context.dependency == null) {
      context.dependency = new Dependency(compiler);
    }

    return context.dependency;
  }

  /**
   * Get the initialized instance of the Dependency.
   *
   * @param {Compiler} compiler The webpack Compiler instance.
   * @return {Dependency}
   */
  static getDependency(compiler) {
    const context = this.#contexts.get(compiler);

    return context.dependency;
  }
}

module.exports = LoaderFactory;
