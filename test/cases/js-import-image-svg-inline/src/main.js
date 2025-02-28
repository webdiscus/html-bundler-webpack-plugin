import svgFilename from './token.svg'; // import as output filename
import svgBase64DataUrl from './token.svg?inline=base64'; // import as base64-encoded data URL
import svgUtf8DataUrl from './token.svg?inline=escape'; // import as UTF-8 data URL

import pngFilename from '@images/icons/imac.png';
import pngDataUrl from '@images/icons/imac.png?inline';

// filename
let img1 = document.createElement('img');
img1.setAttribute('src', svgFilename);
document.getElementById('svg-filename').append(img1);

// base64-encoded data URL
let img2 = document.createElement('img');
img2.setAttribute('src', svgBase64DataUrl);
document.getElementById('svg-base64-data-url').append(img2);

// // UTF-8 data URL
let img3 = document.createElement('img');
img3.setAttribute('src', svgUtf8DataUrl);
document.getElementById('svg-utf8-data-url').append(img3);

console.log('>> svgFilename: ', svgFilename);
console.log('>> svgBase64DataUrl: ', svgBase64DataUrl);
console.log('>> svgUtf8DataUrl: ', svgUtf8DataUrl);

// test bin images
console.log('>> pngFilename: ', pngFilename);
console.log('>> pngDataUrl: ', pngDataUrl);
