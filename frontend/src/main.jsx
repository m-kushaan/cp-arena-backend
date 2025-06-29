import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';

import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
axios.defaults.baseURL = "https://cp-arena-backend.onrender.com"; // ✅ add this line


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
      <Toaster position="top-right" reverseOrder={false} />
    </AuthProvider>
  </StrictMode>
);
