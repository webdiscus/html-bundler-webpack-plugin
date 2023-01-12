const vm = require('vm');
const Dependency = require('./Dependency');
const { executeTemplateFunctionException } = require('./Exeptions');

class VMScript {
  requireTypes = {
    default: '__LOADER_REQUIRE__',
    script: '__LOADER_REQUIRE_SCRIPT__',
    style: '__LOADER_REQUIRE_STYLE__',
  };

  /**
   * @param {string} templateName The template filename.
   * @param {Function} loaderRequire The method function for resolving a resource file in template.
   * @param {Function} loaderRequireScript The method function for resolving a script file in template.
   * @param {Function} loaderRequireStyle The method function for resolving a style file in template.
   */
  constructor({ templateName, loaderRequire, loaderRequireScript, loaderRequireStyle }) {
    const contextOptions = { require };
    contextOptions[this.requireTypes.default] = loaderRequire;
    contextOptions[this.requireTypes.script] = loaderRequireScript;
    contextOptions[this.requireTypes.style] = loaderRequireStyle;

    this.contextObject = vm.createContext(contextOptions);
    this.templateName = templateName;
  }

  /**
   * Return template of require function to call custom handler in vm depend on the method.
   *
   * @param {string} file The argument of require function.
   * @param {string} issuer The issuer of file.
   * @param {string} type The require type, one of the this.requireTypes keys.
   * @return {string}
   */
  require(file, issuer, type = 'default') {
    const requireType = this.requireTypes[type];

    return `${requireType}(${file},'${issuer}')`;
  }

  /**
   * @param {string} templateFile The path of template file.
   * @param {string} source The function body.
   * @param {Object} locals The local template variables.
   * @return {string}
   * @throws
   */
  run(templateFile, source, locals) {
    try {
      const script = new vm.Script(source, { filename: templateFile });
      script.runInContext(this.contextObject);
    } catch (error) {
      Dependency.watch();
      executeTemplateFunctionException(error, templateFile);
    }

    return this.contextObject[this.templateName](locals);
  }
}

module.exports = VMScript;
