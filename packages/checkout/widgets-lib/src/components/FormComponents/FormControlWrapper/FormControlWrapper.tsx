import { FormControl } from '@biom3/react';

interface FormControlWrapperProps {
  children: React.ReactNode;
  subtext?: string;
  textAlign?: 'left' | 'right';
  isErrored?: boolean;
  errorMessage?: string;
}

export function FormControlWrapper({
  children,
  subtext,
  textAlign,
  isErrored,
  errorMessage,
}: FormControlWrapperProps) {
  return (
    <FormControl
      textAlign={textAlign ?? 'left'}
      validationStatus={isErrored ? 'error' : 'success'}
    >
      {children}
      {subtext && <FormControl.Caption>{subtext}</FormControl.Caption>}
      {isErrored && (
        <FormControl.Validation>{errorMessage}</FormControl.Validation>
      )}
    </FormControl>
  );
}
