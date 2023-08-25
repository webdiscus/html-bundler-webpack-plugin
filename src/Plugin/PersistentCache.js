/**
 * Here can be added instances that should be stored in the cache, when `cache.type` is `filesystem`.
 */

const Collection = require('./Collection');

/* istanbul ignore next: test it manual using `cache.type` as `filesystem` after 2nd run the same project */
class PersistentCache {
  static serialize(context) {
    Collection.serialize(context);
  }

  static deserialize(context) {
    Collection.deserialize(context);
  }
}

module.exports = PersistentCache;
