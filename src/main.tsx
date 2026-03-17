import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { FilterProvider } from './context/FilterContext';

import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FilterProvider>
      <App />
    </FilterProvider>
  </StrictMode>,
);
