// These two imports are not included in the bundled css when running `webpack --mode development`.
// However, they are included in the bundled css when running `webpack --mode production`.
import "./import1.scss";
import "./import2.scss";

// This css is always properly inlined in the HTML file.
// Interestingly, if you comment this line out, then it fixes the issue with thea above imports
// (they will be properly included in the bundled css in development mode).
import "./import3.scss?inline";

console.log("Hello World!");
