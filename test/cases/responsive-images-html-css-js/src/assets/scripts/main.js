import bild from '@images/2k-over/bild.png';

const img = document.getElementById('js-image');
img.src = bild.src;

console.log('>> Responsive image: ', { src: bild.src });
