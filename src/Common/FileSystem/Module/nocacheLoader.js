// This module exports ESM loader hooks used for custom resolution and loading behavior.
// It is registered dynamically via moduleRegister.js.

/**
 * Custom resolve hook.
 *
 * Appends a unique cache-busting query parameter to module URLs when the parent
 * module was imported with the `nocache` flag.
 * This helps force reloads of changed ESM modules, useful for features like Live Reload or HMR.
 *
 * @param {string} specifier The raw import value.
 * @param {{conditions: string[], importAttributes: Object, parentURL: string | undefined}} context Info.
 * @param {Function} nextResolve The default or next resolve hook in the chain.
 * @return {Promise<{url: string, format?: string, shortCircuit?: boolean, importAttributes?: Object}>}
 */
async function resolve(specifier, context, nextResolve) {
  const resolved = await nextResolve(specifier, context);
  const resolvedUrl = new URL(resolved.url);
  const parentUrl = new URL(context.parentURL);
  const flag = 'nocache';

  if (!resolvedUrl.searchParams.get(flag) && parentUrl.searchParams.get(flag)) {
    resolvedUrl.searchParams.set(flag, Date.now().toString());

    return {
      ...resolved,
      url: resolvedUrl.href,
      shortCircuit: false, // if false, continue to next loader in chain
    };
  }

  return resolved;
}

module.exports = { resolve };
