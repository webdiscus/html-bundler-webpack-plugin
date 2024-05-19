import sheet from './style-c.css?sheet'; // `css-loader` option `exportType: 'css-style-sheet'`
import './style-d.css'; // `css-loader` option `exportType: 'array'`

console.log('sheet: ', sheet);

document.adoptedStyleSheets = [sheet];
//shadowRoot.adoptedStyleSheets = [sheet]; // error in browser: shadowRoot is not defined
