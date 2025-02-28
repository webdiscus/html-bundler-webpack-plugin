import svgFilename from '@images/icons/token.svg'; // import as output filename
import svgBase64DataUrl from '@images/icons/iphone.svg?inline'; // import as base64-encoded data URL

// filename
let imgFile = document.createElement('img');
imgFile.setAttribute('src', svgFilename);
document.getElementById('svg-filename').append(imgFile);

// base64-encoded data URL
let img1 = document.createElement('img');
img1.setAttribute('src', svgBase64DataUrl);
document.getElementById('js-svg-data-url').append(img1);

console.log('>> svgFilename: ', svgFilename);
console.log('>> svgBase64DataUrl: ', svgBase64DataUrl);
