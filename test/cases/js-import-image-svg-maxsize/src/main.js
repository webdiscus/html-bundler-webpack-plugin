import svgFilename from './bild-2k.svg'; // import as output filename for file > 1 kB
import svgDataUrl from './token.svg'; // import as data URL for file < 1 kB
import svgForceDataUrl from './bild-2k.svg?inline'; // force import as data URL using `?inline` query

// filename
let img1 = document.createElement('img');
img1.setAttribute('src', svgFilename);
document.getElementById('svg-filename').append(img1);

// UTF-8 data URL
let img2 = document.createElement('img');
img2.setAttribute('src', svgDataUrl);
document.getElementById('svg-utf8-data-url').append(img2);

// UTF-8 data URL
let img3 = document.createElement('img');
img3.setAttribute('src', svgForceDataUrl);
document.getElementById('svg-force-data-url').append(img3);

console.log('>> svgFilename: ', svgFilename);
console.log('>> svgDataUrl: ', svgDataUrl);
console.log('>> svgForceDataUrl: ', svgForceDataUrl);
