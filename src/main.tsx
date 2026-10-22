import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Typography: editorial serif (headlines), modern sans (reading), restrained hand (notes).
import '@fontsource/cormorant-garamond/300.css';
import '@fontsource/cormorant-garamond/400.css';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/300-italic.css';
import '@fontsource/cormorant-garamond/400-italic.css';
import '@fontsource/cormorant-garamond/500-italic.css';
import '@fontsource-variable/manrope';
import '@fontsource-variable/caveat';

import './styles/tokens.css';
import './styles/base.css';
import './styles/atmosphere.css';
import './styles/print.css';

import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
