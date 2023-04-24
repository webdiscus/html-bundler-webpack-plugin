const vm = require('vm');
const { toCommonJS } = require('./Utils');
const { executeFunctionException } = require('./Messages/Exception');

class VMScript {
  /**
   *
   * @param {Object} context The context object.
   */
  constructor(context) {
    this.contex = vm.createContext(context);
  }

  /**
   *
   * @param source
   * @param {string} filename The filename used in stack traces produced by this script.
   * @return {*|string}
   */
  run(source, filename) {
    let code = source.source();

    if (Buffer.isBuffer(code)) {
      code = code.toString();
    }

    // transform the code to CommonJS
    if (code.indexOf('export default') > -1) {
      code = toCommonJS(code);
    }

    try {
      const script = new vm.Script(code, { filename });
      const compiledCode = script.runInContext(this.contex);

      return typeof compiledCode === 'function' ? compiledCode() : compiledCode || '';
    } catch (error) {
      executeFunctionException(error, filename);
    }
  }
}

module.exports = VMScript;
