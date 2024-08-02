class WeakMapIterable {
  #index = [];
  #map;

  constructor(entries) {
    this.#map = new WeakMap(entries);

    if (Array.isArray(entries)) {
      for (let [key] of entries) {
        this.#index.push(key);
      }
    }
  }

  set(key, value) {
    this.#index.push(key);
    this.#map.set(key, value);
  }

  get(key) {
    return this.#map.get(key);
  }

  has(key) {
    return this.#map.has(key);
  }

  delete(key) {
    return this.#map.delete(key);
  }

  clear() {
    this.#index = [];
    this.#map = new WeakMap();
  }

  [Symbol.iterator]() {
    let index = -1;

    return {
      next: () => {
        const key = this.#index[++index];
        const value = this.#map.get(key);

        return {
          value: value,
          done: value == null,
        };
      },
    };
  }
}

module.exports = WeakMapIterable;
