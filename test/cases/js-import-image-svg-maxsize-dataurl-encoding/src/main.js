import svgFilename from '@images/2k-over/bild.svg'; // import as output filename for file > 1 kB
import svgDataUrl from '@images/icons/token.svg'; // escaped data URL
import svgDataUrl2 from '@images/icons/token.svg?inline'; // escaped data URL
import svgDataUrl3 from '@images/icons/token.svg?inline=base64'; // base64 data URL
import svgDataUrl4 from '@images/icons/token.svg?inline=escape'; // escaped data URL
import svgDataUrl5 from '@images/icons/token.svg'; // escaped data URL
import svgForceDataUrl from '@images/2k-over/bild.svg?inline'; // force import as data URL using `?inline` query

console.log('>> svgFilename: ', svgFilename);
console.log('>> svgDataUrl: ', svgDataUrl); // ok
console.log('>> svgDataUrl2: ', svgDataUrl2); // ok
console.log('>> svgDataUrl3: ', svgDataUrl3); // ok
console.log('>> svgDataUrl4: ', svgDataUrl4); // ok
console.log('>> svgDataUrl5: ', svgDataUrl5); // ok
console.log('>> svgForceDataUrl: ', svgForceDataUrl);
