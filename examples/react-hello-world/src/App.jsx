import React from 'react';
//import './scss/style.scss'; // <= import style in JS to enable hot replacement

const App = () => {
  return (
    <>
      <h1>Hello World!</h1>
      {/* use relative path or webpack alias to source file */}
      <img src={require('./images/picture.png')} />
      <p>Background image in CSS</p>
      <div className="bg-image"></div>
    </>
  );
};

export default App;
