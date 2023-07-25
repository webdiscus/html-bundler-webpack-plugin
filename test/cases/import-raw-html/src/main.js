//const lazyRawFile = require.context('./?raw', true, /(html|css|js)$/, 'lazy');

// the context path can contain a query; webpack add the query to the filename, e.g. ./samples/page.html?raw
const rawFile = require.context('./samples/?raw', true, /\.(html|css|js)$/);

let rawHTML = rawFile('./page.html');
let rawCSS = rawFile('./page.css');
let rawJS = rawFile('./page.js');

console.log('>> raw HTML: ', { rawHTML });
console.log('>> raw CSS: ', { rawCSS });
console.log('>> raw JS: ', { rawJS });
