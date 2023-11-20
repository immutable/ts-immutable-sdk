import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import router from '@/lib/router';

const container = document.getElementById('app');
const root = createRoot(container);
root.render(<RouterProvider router={router} />);
