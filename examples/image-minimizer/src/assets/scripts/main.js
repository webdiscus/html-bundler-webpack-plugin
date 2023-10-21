const myImage = new URL('@images/2k-over/bild.png?w=250', import.meta.url);

const img = document.getElementById('js-image');
img.src = myImage;

console.log('>> Responsive image: ', { myImage });
