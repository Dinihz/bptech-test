import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster
        position='top-center'
        toastOptions={{
          style: {
            background: '#111827',
            color: '#fff'
          },
        }}
        />
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
