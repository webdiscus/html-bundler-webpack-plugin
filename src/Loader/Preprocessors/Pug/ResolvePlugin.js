const Resolver = require('../../Resolver');
const { isWin, pathToPosix } = require('../../Utils');

/**
 * Whether the node value contains the require() function.
 *
 * @param {string} value
 * @return {boolean}
 */
const isRequired = (value) => value != null && typeof value === 'string' && value.indexOf('require(') > -1;

/**
 * Whether the node attribute belongs to style.
 *
 * @param {Array<name: string, val: string>} item
 * @return {boolean}
 */
const isStyle = (item) => item.name === 'rel' && item.val.indexOf('stylesheet') > -1;

let lastTag = '';

const requireTypes = {
  default: '__LOADER_REQUIRE__',
  script: '__LOADER_REQUIRE_SCRIPT__',
  style: '__LOADER_REQUIRE_STYLE__',
};

/**
 * Resolve resource file in a tag attribute.
 *
 * @param {string} value The resource value or code included require().
 * @param {string} issuer The filename of the template where resolves the resource.
 * @return {string}
 */
const requireExpression = (value, issuer) => {
  if (ResolvePlugin.mode === 'render') {
    const type = 'default';
    const requireType = requireTypes[type];

    return `${requireType}(${value},'${issuer}')`;
  }

  if (ResolvePlugin.mode === 'compile') {
    const interpolatedValue = Resolver.interpolate(value, issuer);

    return `require(${interpolatedValue})`;
  }

  return value;
};

/**
 * Resolve script file in the script tag.
 *
 * @param {string} value
 * @param {string} issuer
 * @return {string}
 */
const resolveScript = (value, issuer) => {
  const [, file] = /require\((.+?)(?=\))/.exec(value) || [];
  //if (isWin) issuer = pathToPosix(issuer);

  if (ResolvePlugin.mode === 'render') {
    const type = 'script';
    const requireType = requireTypes[type];

    return `${requireType}(${file},'${issuer}')`;
  }

  if (ResolvePlugin.mode === 'compile') {
    const interpolatedValue = Resolver.interpolate(file, issuer, 'script');

    return `require('${interpolatedValue}')`;
  }

  return value;
};

/**
 * Resolve style file in the link tag.
 *
 * @param {string} value
 * @param {string} issuer
 * @return {string}
 */
const resolveStyle = (value, issuer) => {
  const [, file] = /require\((.+?)(?=\))/.exec(value) || [];
  //if (isWin) issuer = pathToPosix(issuer);

  if (ResolvePlugin.mode === 'render') {
    const type = 'style';
    const requireType = requireTypes[type];
    return `${requireType}(${file},'${issuer}')`;
  }

  if (ResolvePlugin.mode === 'compile') {
    const resolvedFile = Resolver.interpolate(file, issuer, 'style');

    return `require('${resolvedFile}')`;
  }

  return value;
};

/**
 * Resolve resource file in a tag attribute.
 *
 * @param {string} value The resource value or code included require().
 * @param {string} issuer The filename of the template where resolves the resource.
 * @return {string}
 */
const resolveResource = (value, issuer) => {
  const openTag = 'require(';
  const openTagLen = openTag.length;
  let pos = value.indexOf(openTag);

  if (pos < 0) return value;

  let lastPos = 0;
  let result = '';
  let char;

  // TODO: test for win
  //if (isWin) issuer = pathToPosix(issuer);

  // in value replace all `require` with handler name depend on a method
  while (~pos) {
    let startPos = pos + openTagLen;
    let endPos = startPos;
    let opened = 1;

    do {
      char = value[++endPos];
      if (char === '(') opened++;
      else if (char === ')') opened--;
    } while (opened > 0 && char != null && char !== '\n' && char !== '\r');

    if (opened > 0) {
      throw new Error('[pug-loader] parse error: check the `(` bracket, it is not closed at same line:\n' + value);
    }

    const file = value.slice(startPos, endPos);
    const replacement = requireExpression(file, issuer);

    result += value.slice(lastPos, pos) + replacement;
    lastPos = endPos + 1;
    pos = value.indexOf(openTag, lastPos);
  }

  if (value.length - 1 > pos + openTagLen) {
    result += value.slice(lastPos);
  }

  return result;
};

/**
 * Resolve filenames in Pug node.
 *
 * @param {Object} node The Pug AST Node.
 */
const resolveNode = (node) => {
  switch (node.type) {
    case 'Code':
      if (isRequired(node.val)) {
        node.val =
          lastTag === 'script' ? resolveScript(node.val, node.filename) : resolveResource(node.val, node.filename);
      }
      break;
    case 'Mixin':
      if (isRequired(node.args)) {
        node.args = resolveResource(node.args, node.filename);
      }
      break;
    case 'Each':
    case 'EachOf':
      if (isRequired(node.obj)) {
        node.obj = resolveResource(node.obj, node.filename);
      }
      break;
    case 'Tag':
      lastTag = node.name;
    // fallthrough
    default:
      resolveNodeAttributes(node, 'attrs');
      resolveNodeAttributes(node, 'attributeBlocks');
      break;
  }
};

/**
 * Resolve required filenames in Pug node attributes.
 *
 * @param {Object} node The Pug AST Node.
 * @param {string} attrName The node attribute name.
 */
const resolveNodeAttributes = (node, attrName) => {
  const attrs = node[attrName];
  if (!attrs || attrs.length === 0) return;

  for (let attr of attrs) {
    const value = attr.val;
    if (isRequired(value)) {
      if (node.name === 'script') {
        attr.val = resolveScript(value, attr.filename);
      } else if (node.name === 'link' && node.attrs.find(isStyle)) {
        attr.val = resolveStyle(value, attr.filename);
      } else {
        attr.val = resolveResource(value, attr.filename);
      }
    }
  }
};

/**
 * The pug plugin to resolve the path for the extends, include, require.
 *
 * @type {{resolve: (function(string, string, {}): string), preCodeGen: (function({}): *)}}
 */
const ResolvePlugin = {
  mode: '',

  /**
   * Resolve the filename for the extends, include, raw include.
   *
   * @param {string} filename The extends/include filename in template.
   * @param {string} templateFile The absolute template filename.
   * @param {{}} options The options of pug compiler.
   * @return {string}
   */
  resolve(filename, templateFile, options) {
    return Resolver.resolve(filename.trim(), templateFile.trim(), Resolver.types.include);
  },

  /**
   * Traverse all Pug nodes and resolve filename in each node.
   *
   * @note: This is the implementation of the 'pug-walk' logic without a recursion, up to x2.5 faster.
   *
   * @param {{}} tree The parsed tree of the pug template.
   * @return {{}}
   */
  preCodeGen(tree) {
    const stack = [tree];
    let ast, lastIndex, i;

    while ((ast = stack.pop())) {
      while (true) {
        resolveNode(ast);

        switch (ast.type) {
          case 'Tag':
          case 'Code':
          case 'Case':
          case 'Mixin':
          case 'When':
          case 'While':
          case 'EachOf':
            if (ast.block) stack.push(ast.block);
            break;
          case 'Each':
            if (ast.block) stack.push(ast.block);
            if (ast.alternate) stack.push(ast.alternate);
            break;
          case 'Conditional':
            if (ast.consequent) stack.push(ast.consequent);
            if (ast.alternate) stack.push(ast.alternate);
            break;
          default:
            break;
        }

        if (!ast.nodes || ast.nodes.length === 0) break;

        lastIndex = ast.nodes.length - 1;
        for (i = 0; i < lastIndex; i++) {
          stack.push(ast.nodes[i]);
        }
        ast = ast.nodes[lastIndex];
      }
    }

    return tree;
  },
};

module.exports = ResolvePlugin;
