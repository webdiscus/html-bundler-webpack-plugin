import { createRoot } from 'react-dom/client';

// test both together must work
import Stack from '@mui/material/Stack';
import './style.css';

const root = createRoot(document.getElementById('app')!);

root.render(
  <Stack>
    <p>Hello!</p>
    <p>How are you?</p>
  </Stack>
);
