import svgFilename from './token.svg'; // import as output filename
import svgBase64DataUrl from './token.svg?dataurl'; // import as base64-encoded data URL
import svgUtf8DataUrl from './token.svg?inline'; // import as UTF-8 data URL
import svgSource from './token.svg?raw'; // import as source content

// filename
let img1 = document.createElement('img');
img1.setAttribute('src', svgFilename);
document.getElementById('svg-filename').append(img1);

// base64-encoded data URL
let img2 = document.createElement('img');
img2.setAttribute('src', svgBase64DataUrl);
document.getElementById('svg-base64-data-url').append(img2);

// UTF-8 data URL
let img3 = document.createElement('img');
img3.setAttribute('src', svgUtf8DataUrl);
document.getElementById('svg-utf8-data-url').append(img3);

// source content
document.getElementById('svg-source').innerHTML = svgSource;

console.log('>> svgFilename: ', svgFilename);
console.log('>> svgBase64DataUrl: ', svgBase64DataUrl);
console.log('>> svgUtf8DataUrl: ', svgUtf8DataUrl);
console.log('>> svgSource: ', svgSource);
