import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ConnectWidget from './pages/ConnectWidget';
import { onLightBase } from '@biom3/design-tokens';
import { BiomeThemeProvider, Box } from '@biom3/react';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/connect',
    element: <ConnectWidget />,
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <BiomeThemeProvider theme={{ base: onLightBase }}>
      <Box
        sx={{
          m: 'auto',
          padding: 'base.spacing.x10',
        }}
      >
        <RouterProvider router={router} />
      </Box>
    </BiomeThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
