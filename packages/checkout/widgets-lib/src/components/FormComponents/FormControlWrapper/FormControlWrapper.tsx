import { FormControl } from '@biom3/react';

interface FormControlWrapperProps {
  children: React.ReactNode;
  isErrored?: boolean;
  errorMessage?: string;
}

export const FormControlWrapper = ({
  children,
  isErrored,
  errorMessage,
}: FormControlWrapperProps) => {
  return (
    <FormControl validationStatus={isErrored ? 'error' : 'success'}>
      {children}
      {isErrored && (
        <FormControl.Validation>{errorMessage}</FormControl.Validation>
      )}
    </FormControl>
  );
};
