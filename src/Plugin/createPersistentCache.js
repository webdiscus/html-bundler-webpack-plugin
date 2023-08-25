const makeSerializable = require('webpack/lib/util/makeSerializable');

const classCache = new WeakMap();

/* istanbul ignore next: test it manual using `cache.type` as `filesystem` after 2nd run the same project */
const createPersistentCache = (instance) => {
  if (classCache.has(instance)) {
    return classCache.get(instance);
  }

  class PersistentCache {
    instance = instance;

    static getData(instance = {}) {
      return new PersistentCache(instance);
    }

    constructor() {}

    serialize(context) {
      this.instance.serialize(context);
    }

    deserialize(context) {
      this.instance.deserialize(context);
    }
  }

  makeSerializable(PersistentCache, __filename, 'PersistentCache');
  classCache.set(instance, PersistentCache);

  return PersistentCache;
};

module.exports = createPersistentCache;
