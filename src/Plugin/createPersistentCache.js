const makeSerializable = require('webpack/lib/util/makeSerializable');

const createPersistentCache = () => {
  const memorizedCache = new WeakMap();
  let cacheIndex = 0;

  return (instance) => {
    if (memorizedCache.has(instance)) {
      return memorizedCache.get(instance);
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

    // the cache index is needed for multiple configuration
    makeSerializable(PersistentCache, __filename, `PersistentCache_${cacheIndex}`);
    memorizedCache.set(instance, PersistentCache);
    cacheIndex++;

    return PersistentCache;
  };
};

module.exports = createPersistentCache;
