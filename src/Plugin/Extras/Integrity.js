const path = require('path');
const Template = require('../../Loader/Template');

const comparePos = (a, b) => a.startPos - b.startPos;

class Integrity {
  static apply({ fs, stats, Collection, Options }) {
    let assetIntegrity = new Map();

    stats.toJson().assets.forEach(({ name, integrity }) => {
      if (!integrity || Collection.isTemplate(name)) return;
      assetIntegrity.set(name, integrity);
    });

    // do nothing if no integrity found
    if (assetIntegrity.size < 1) return;

    for (const [htmlFilename, { entry, resources }] of Collection.data) {
      if (!entry.isTemplate) continue;

      // 1. prepare parsing options
      const parseOptions = new Map();
      for (const { type, assetFile, chunks } of resources) {
        // if parsing options for both the `link` and `script` tags are defined, then stop traversing
        if (parseOptions.size === 2) break;
        if (parseOptions.has(type)) continue;

        switch (type) {
          case Collection.type.style:
            if (assetIntegrity.has(assetFile)) {
              parseOptions.set(type, {
                tag: 'link',
                attributes: ['href'],
                filter: ({ attribute, attributes }) =>
                  !attributes.hasOwnProperty('integrity') && attribute === 'href' && attributes.rel === 'stylesheet',
              });
            }
            break;
          case Collection.type.script:
            for (const chunk of chunks) {
              if (assetIntegrity.has(chunk.chunkFile)) {
                parseOptions.set(type, {
                  tag: 'script',
                  attributes: ['src'],
                  filter: ({ attribute, attributes }) => !attributes.hasOwnProperty('integrity') && attribute === 'src',
                });
                break;
              }
            }
            break;
        }
      }

      if (parseOptions.size < 1) return;

      // 2. parse generated html for `link` and `script` tags
      const htmlOutputFileFile = path.join(entry.outputPath, htmlFilename);
      const content = fs.readFileSync(htmlOutputFileFile, 'utf-8');
      let parsedResults = [];

      for (const opts of parseOptions.values()) {
        parsedResults.push(...Template.parseTag(content, opts));
      }
      parsedResults.sort(comparePos);

      // 3. include the integrity attributes in the parsed tags
      let pos = 0;
      let output = '';

      for (const { tag, attrs, attrsAll, startPos, endPos } of parsedResults) {
        if (!attrsAll || attrs.length < 1) continue;

        const assetFile = attrsAll.href || attrsAll.src;
        const integrity = assetIntegrity.get(assetFile);

        if (integrity) {
          // attributes: https://www.w3.org/TR/SRI/
          attrsAll.integrity = integrity;
          attrsAll.crossorigin = Options.webpackOptions.output.crossOriginLoading || 'anonymous';

          let attrsStr = '';
          for (const attrName in attrsAll) {
            attrsStr += ` ${attrName}="${attrsAll[attrName]}"`;
          }

          output += content.slice(pos, startPos) + `<${tag}${attrsStr}>`;
          pos = endPos;
        }
      }
      output += content.slice(pos);

      // 4. save
      if (output) {
        fs.writeFileSync(htmlOutputFileFile, output);
      }
    }
  }
}

module.exports = Integrity;
