import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders correctly', () => {
  render(<App />);
  const hello = screen.getByText('Immutable Sample App');
  expect(hello).toBeInTheDocument();
});
