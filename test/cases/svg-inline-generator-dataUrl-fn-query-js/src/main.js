import svg1 from '@images/icons/token.svg?js'; // import as output of `generator.dataUrl()` function
import svg2 from '@images/icons/iphone.svg?inline=base64&js';

let img1 = document.createElement('img');
img1.setAttribute('src', svg1);
document.getElementById('js-svg-data-url').append(img1);

let img2 = document.createElement('img');
img2.setAttribute('src', svg2);
document.getElementById('js-svg-data-url-base64').append(img2);

console.log('>> svg1: ', svg1);
console.log('>> svg2: ', svg2);
