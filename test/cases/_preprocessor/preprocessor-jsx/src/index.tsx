// here must be declared all external variables passed from webpack into this template
//declare var title: string;
declare var locals: any;

// TODO: fix resolving of the required file in VM
//import Footer from './footer';

const tmpl = () => (
  <html>
    <head>
      <title>{locals.title}</title>
    </head>
    <body>
      <h1>Hello World!</h1>
    </body>
  </html>
);

export default tmpl;
