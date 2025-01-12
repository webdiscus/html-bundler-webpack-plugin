import svgFilename from './bild-2k.svg'; // import as output filename for file > 1 kB
import svgDataUrl from './token.svg'; // base64 data URL
import svgDataUrl2 from './token.svg?inline'; // UTF-8 data URL
import svgDataUrl3 from './token.svg?inline=base64'; // base64 data URL
import svgDataUrl4 from './token.svg?inline=utf8'; // UTF-8 data URL
import svgDataUrl5 from './token.svg'; // base64 data URL
import svgForceDataUrl from './bild-2k.svg?inline'; // force import as data URL using `?inline` query

console.log('>> svgFilename: ', svgFilename);
console.log('>> svgDataUrl: ', svgDataUrl); // ok
console.log('>> svgDataUrl2: ', svgDataUrl2); // ok
console.log('>> svgDataUrl3: ', svgDataUrl3); // ok
console.log('>> svgDataUrl4: ', svgDataUrl4); // ok
console.log('>> svgDataUrl5: ', svgDataUrl5); // ok
console.log('>> svgForceDataUrl: ', svgForceDataUrl);
