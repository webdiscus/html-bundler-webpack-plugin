const vm = require('vm');
const { transformToCommonJS } = require('./Utils');
const { executeFunctionException } = require('../Plugin/Messages/Exception');

class VMScript {
  context = null;

  /**
   *
   * @param {Object} context The context object.
   * @param {string} name The function name compiled in the VM context.
   */
  constructor(context, name = '') {
    this.context = vm.createContext(context);
    this.name = name;
  }

  /**
   * Execute the source code.
   *
   * @param {Buffer | string} code The source code.
   * @param {string} filename The filename is used in error stack traces produced by this script.
   * @param {{}?} data The data passed in the compiled function.
   * @param {boolean?} esModule  Whether the source code is an ES module.
   * @return {string}
   */
  exec(code, { filename, data = {}, esModule = false }) {
    if (Buffer.isBuffer(code)) {
      code = code.toString();
    }

    // transform the code to CommonJS
    if (esModule === true) {
      code = transformToCommonJS(code);
    }

    try {
      const script = new vm.Script(code, { filename });
      let result = script.runInContext(this.context);

      // if the code returns nothing but creates a named definition in the context
      if (!result && this.name && this.name in this.context) {
        result = this.context[this.name];
      }

      return typeof result === 'function' ? result(data) : result || '';
    } catch (error) {
      executeFunctionException(error, filename);
    }
  }
}

module.exports = VMScript;
