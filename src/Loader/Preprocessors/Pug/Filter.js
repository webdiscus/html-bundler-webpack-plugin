const fs = require('fs');
const path = require('path');
const {
  filterNotFoundException,
  filterLoadException,
  filterInitException,
  loadNodeModuleException,
} = require('./Exeptions');

const filtersPath = path.join(__dirname, 'filters');

class Filter {
  /**
   * Load embedded pug filters.
   *
   * @param {{}} options Loader options.
   */
  static loadFilters(options) {
    if (!options.embedFilters) return;

    if (!options.filters) options.filters = {};

    const embedFilters = options.embedFilters;
    const loadedFilters = options.filters;

    for (const filterName in options.embedFilters) {
      const options = embedFilters[filterName];

      if (options) {
        let filterPath = path.resolve(filtersPath, filterName + '.js');
        let filter;

        try {
          filter = require(filterPath);
        } catch (error) {
          this.loadModuleException({ filterName, filterPath, error });
        }

        try {
          // filter module may have the `init(options)` method
          if (filter.init != null) {
            filter.init(options);
          }
          loadedFilters[filterName] = filter.apply.bind(filter);
        } catch (error) {
          filterInitException(filterName, error);
        }
      }
    }
  }

  /**
   * @param {string} filterName
   * @param {string} filterPath
   * @param {Error} error
   */
  static loadModuleException({ filterName, filterPath, error }) {
    const message = error.toString();
    const posEOL = message.indexOf('\n');
    const messageFirstLine = message.slice(0, posEOL);

    if (messageFirstLine.indexOf('Cannot find module') >= 0) {
      if (messageFirstLine.indexOf(filterPath) > 0) {
        const entries = fs.readdirSync(filtersPath, { withFileTypes: true });
        const files = entries.filter((file) => !file.isDirectory()).map((file) => path.basename(file.name, '.js'));

        filterNotFoundException(filterName, files.join(', '));
      } else {
        const [, module] = /Cannot find module '(.*?)'/.exec(messageFirstLine) || [];

        if (module) {
          loadNodeModuleException(module);
        }
      }
    }

    filterLoadException(filterName, filterPath, error);
  }
}

module.exports = Filter;
