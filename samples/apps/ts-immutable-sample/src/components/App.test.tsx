import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Hello world ', () => {
  render(<App />);
  const hello = screen.getByText('Hello world');
  expect(hello).toBeInTheDocument();
});
