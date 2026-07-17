import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import router from './services/router';
import { connectSocket, disconnectSocket } from './services/socket';
import { silentRefreshOnStartup } from './services/auth';

connectSocket();
window.addEventListener('beforeunload', disconnectSocket);

// Silently restore the session using the 7-day refresh token if the
// 15-min access token has expired (prevents logout on page reload)
silentRefreshOnStartup();


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
    <ToastContainer
    className="mt-15"
      position="top-right"
      autoClose={1000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnHover
      draggable
      
    />
  </StrictMode>
);


