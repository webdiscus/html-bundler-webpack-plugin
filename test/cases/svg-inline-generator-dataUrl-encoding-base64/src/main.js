import svgFilename from '@images/icons/iphone.svg';

// base64-encoded data URL
let img1 = document.createElement('img');
img1.setAttribute('src', svgFilename);
document.getElementById('js-svg-data-url').append(img1);

console.log('>> svgBase64DataUrl: ', svgFilename);
