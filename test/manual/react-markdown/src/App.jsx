import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';

const App = memo(() => {
  return (
    <>
      <ReactMarkdown children={'# Hello, *world*!'} />
    </>
  );
});

export default App;
