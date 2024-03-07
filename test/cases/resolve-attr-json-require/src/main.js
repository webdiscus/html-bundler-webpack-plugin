const elm = document.getElementById('test-elm');

const value = elm.getAttribute('data-bigpicture');
const data = JSON.parse(value);

console.log('>> main', { value }, data);
