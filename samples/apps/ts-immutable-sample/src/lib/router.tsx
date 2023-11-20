import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from 'react-router-dom';
import App from '@/components/App';
import PassportPage from '@/pages/PassportPage';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path='/' element={<App />}></Route>
      <Route path='/passport' element={<PassportPage />} />
    </Route>
  ),
);

export default router;
