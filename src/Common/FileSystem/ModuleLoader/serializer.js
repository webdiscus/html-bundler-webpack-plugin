const vm = require('vm');

function serialize(obj) {
  const seen = new WeakMap();
  const refs = [];
  let id = 0;

  function encode(value) {
    if (value instanceof Error) {
      return {
        __type: 'Error',
        name: value.name,
        message: value.message,
        stack: value.stack,
      };
    }

    if (typeof value === 'function') {
      return {
        __type: 'Function',
        source: value.toString(),
      };
    }

    if (typeof value === 'bigint') {
      return {
        __type: 'BigInt',
        value: value.toString(),
      };
    }

    if (typeof value === 'symbol') {
      return {
        __type: 'Symbol',
        value: value.toString(),
      };
    }

    if (Buffer.isBuffer(value)) {
      return {
        __type: 'Buffer',
        data: value.toString('base64'),
      };
    }

    if (value instanceof ArrayBuffer) {
      return {
        __type: 'ArrayBuffer',
        data: Array.from(new Uint8Array(value)),
      };
    }

    // Handle TypedArrays (e.g., Uint8Array, Int32Array, etc.)
    if (ArrayBuffer.isView(value)) {
      return {
        __type: 'TypedArray',
        type: value.constructor.name,
        data: Array.from(value),
      };
    }

    if (value instanceof Date) {
      return {
        __type: 'Date',
        value: value.toISOString(),
      };
    }

    if (value instanceof RegExp) {
      return {
        __type: 'RegExp',
        source: value.source,
        flags: value.flags,
      };
    }

    if (value instanceof URL) {
      return {
        __type: 'URL',
        href: value.href,
      };
    }

    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return { __ref: seen.get(value) };
      }

      const currentId = id++;
      seen.set(value, currentId);
      refs[currentId] = null;

      if (Array.isArray(value)) {
        refs[currentId] = value.map(encode);
        return { __ref: currentId };
      }

      if (value instanceof Map) {
        refs[currentId] = {
          __type: 'Map',
          entries: Array.from(value.entries()).map(([k, v]) => [encode(k), encode(v)]),
        };
        return { __ref: currentId };
      }

      if (value instanceof Set) {
        refs[currentId] = {
          __type: 'Set',
          values: Array.from(value.values()).map(encode),
        };
        return { __ref: currentId };
      }

      const constructorName = value.constructor?.name;
      const objData = {};
      for (const [key, val] of Object.entries(value)) {
        objData[key] = encode(val);
      }

      refs[currentId] =
        constructorName === 'Object'
          ? objData
          : {
              __type: 'Instance',
              constructor: constructorName,
              data: objData,
            };

      return { __ref: currentId };
    }

    return value;
  }

  const root = encode(obj);
  return JSON.stringify({ root, refs });
}

function deserialize(serialized, options = {}) {
  const { root, refs } = JSON.parse(serialized);
  const constructed = new Array(refs.length);

  function revive(value) {
    if (value && typeof value === 'object') {
      if ('__ref' in value) {
        return constructed[value.__ref];
      }

      //console.log('*** revive: ', { value });

      switch (value.__type) {
        case 'Error': {
          const error = new Error(value.message);
          error.name = value.name;
          error.stack = value.stack;
          return error;
        }

        case 'Function': {
          try {
            const script = new vm.Script(`(${value.source})`);
            return script.runInNewContext();
          } catch {
            return () => {
              throw new Error('Failed to deserialize function');
            };
          }
        }

        case 'BigInt':
          return BigInt(value.value);

        case 'Symbol':
          return Symbol(value.value.slice(7, -1));

        case 'Buffer':
          return Buffer.from(value.data, 'base64');

        case 'ArrayBuffer':
          const buffer = new ArrayBuffer(value.data.length);
          const uint8View = new Uint8Array(buffer);
          uint8View.set(value.data);
          return buffer;

        case 'TypedArray':
          const TypedArrayConstructor = globalThis[value.type];
          return new TypedArrayConstructor(value.data);

        case 'Date':
          return new Date(value.value);

        case 'RegExp':
          return new RegExp(value.source, value.flags);

        case 'URL':
          return new URL(value.href);

        case 'Map':
          return new Map();

        case 'Set':
          return new Set();

        case 'Instance': {
          const obj = {};
          // Handle nested objects first
          for (const [key, val] of Object.entries(value.data)) {
            obj[key] = revive(val);
          }

          // Try to recreate the instance from the constructor
          const Cls = globalThis[value.constructor];
          if (Cls && typeof Cls === 'function') {
            // Recreate instance by calling the constructor with the correct data
            const instance = new Cls(...Object.values(obj));
            Object.setPrototypeOf(instance, Cls.prototype); // Ensure the prototype chain is correct

            console.log('*** Instance: ', { serialized, obj });

            return instance;
          }

          // If no constructor was found, return plain object
          Object.setPrototypeOf(obj, Object.prototype);
          return obj;
        }
      }
    }

    return value;
  }

  // Restoring references after the instances and objects have been constructed
  for (let i = 0; i < refs.length; i++) {
    const ref = refs[i];
    if (ref && typeof ref === 'object') {
      if (ref.__type === 'Map') {
        constructed[i] = new Map();
      } else if (ref.__type === 'Set') {
        constructed[i] = new Set();
      } else if (ref.__type === 'ArrayBuffer') {
        constructed[i] = new ArrayBuffer(ref.data.length);
      } else if (ref.__type === 'TypedArray') {
        const TypedArrayConstructor = globalThis[ref.type];
        constructed[i] = new TypedArrayConstructor(ref.data);
      } else if (ref.__type === 'URL') {
        constructed[i] = new URL(ref.href);
      } else if (!ref.__type || ref.__type === 'Object') {
        constructed[i] = {};
      } else if (ref.__type === 'Instance') {
        constructed[i] = {}; // Placeholder object, will be replaced later
      }
    } else {
      constructed[i] = ref;
    }
  }

  // Rebuilding the actual values after references have been set
  for (let i = 0; i < refs.length; i++) {
    const ref = refs[i];
    const target = constructed[i];

    if (ref && typeof ref === 'object') {
      if (ref.__type === 'Map') {
        for (const [k, v] of ref.entries) {
          target.set(revive(k), revive(v));
        }
      } else if (ref.__type === 'Set') {
        for (const v of ref.values) {
          target.add(revive(v));
        }
      } else if (ref.__type === 'ArrayBuffer') {
        target.data = revive(ref);
      } else if (ref.__type === 'TypedArray') {
        target.data = revive(ref);
      } else if (ref.__type === 'URL') {
        target.href = revive(ref);
      } else if (!ref.__type || ref.__type === 'Object') {
        for (const [key, val] of Object.entries(ref)) {
          target[key] = revive(val);
        }
      } else if (ref.__type === 'Instance') {
        for (const [key, val] of Object.entries(ref.data)) {
          target[key] = revive(val);
        }
      }
    }
  }

  return revive(root);
}

module.exports = { serialize, deserialize };
