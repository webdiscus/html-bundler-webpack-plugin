import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';

const App = memo(() => {
  return (
    <>
      <h1>MARKDOWN</h1>
      {/*
      // TODO: fix error - "Elements by their ID are made available by browsers"
      <ReactMarkdown children={'# Hello, *world*!'} />
      <ReactMarkdown># Hello, *world*!</ReactMarkdown>
      */}
    </>
  );
});

export default App;
