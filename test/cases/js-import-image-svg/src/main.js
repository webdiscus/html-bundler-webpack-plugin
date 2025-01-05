import svgFilename from './token.svg'; // import as output filename
import svgDataUrl from './token.svg?dataurl'; // import as data URL
import svgSource from './token.svg?raw'; // import as source content

// filename
let img1 = document.createElement('img');
img1.setAttribute('src', svgFilename);
document.getElementById('svg-filename').append(img1);

// data URL
let img2 = document.createElement('img');
img2.setAttribute('src', svgDataUrl);
document.getElementById('svg-data-url').append(img2);

// source content
document.getElementById('svg-source').innerHTML = svgSource;

console.log('>> main svgFilename: ', svgFilename);
console.log('>> main svgDataUrl: ', svgDataUrl);
console.log('>> main svgSource: ', svgSource);
