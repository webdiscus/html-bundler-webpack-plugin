// import as CSSStyleSheet object
import sheet from './style-c.css?sheet'; // `css-loader` option `exportType: 'css-style-sheet'`

// the extracted CSS will be injected into HTML
import './style-d.css?inline'; // `css-loader` option `exportType: 'array'`

// the extracted CSS will be saved into separate output file
import './style-e.css'; // `css-loader` option `exportType: 'array'`

console.log('sheet: ', sheet);

document.adoptedStyleSheets = [sheet];
