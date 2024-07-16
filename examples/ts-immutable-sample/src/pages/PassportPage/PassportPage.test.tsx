import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import PassportPage from './PassportPage';

test('renders correctly', () => {
  render(<PassportPage />);
  const pasportHeading = screen.getByText('Passport');
  expect(pasportHeading).toBeInTheDocument();
});
