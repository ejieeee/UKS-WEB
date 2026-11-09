import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initClientApiInterceptor } from './services/mockApi.js';
import { ThemeProvider } from './context/ThemeContext.js';

initClientApiInterceptor();

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
