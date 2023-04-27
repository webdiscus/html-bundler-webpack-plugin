const image = require('@images/apple.png');

document.addEventListener('DOMContentLoaded', (event) => {
  const elm = document.querySelector('.js-image-script-inline-false');
  elm.style.backgroundImage = `url(${image})`;
  elm.style.width = '160px';
  elm.style.height = '130px';
  elm.style.border = '5px solid steelblue';
});

console.log('>> script-inline-false.js?inline=false', { image });
