//const imageFile = require('./image.png'); // OK
import imageFile from './image.png'; // OK

let img = document.createElement('img');
img.setAttribute('src', imageFile);

document.getElementById('root').append(img);

console.log('>> main imageFile: ', imageFile);
