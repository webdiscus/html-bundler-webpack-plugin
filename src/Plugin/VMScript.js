const vm = require('vm');
const { transformToCommonJS } = require('./Utils');
const { executeFunctionException } = require('./Messages/Exception');

class VMScript {
  context = {};

  /**
   *
   * @param {Object} context The context object.
   */
  constructor(context) {
    this.context = vm.createContext(context);
  }

  /**
   *
   * @param source
   * @param {string} filename The filename used in stack traces produced by this script.
   * @param {boolean} esModule
   * @return {*|string}
   */
  compile(source, filename, esModule) {
    let code = source.source();

    if (Buffer.isBuffer(code)) {
      code = code.toString();
    }

    // transform the code to CommonJS
    if (esModule === true) {
      code = transformToCommonJS(code);
    }

    try {
      const script = new vm.Script(code, { filename });
      const compiledCode = script.runInContext(this.context);

      return typeof compiledCode === 'function' ? compiledCode() : compiledCode || '';
    } catch (error) {
      executeFunctionException(error, filename);
    }
  }
}

module.exports = VMScript;
