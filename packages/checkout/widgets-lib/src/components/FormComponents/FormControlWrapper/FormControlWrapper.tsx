import { FormControl } from '@biom3/react';

interface FormControlWrapperProps {
  testId: string;
  children: React.ReactNode;
  subtext?: string;
  textAlign?: 'left' | 'right';
  isErrored?: boolean;
  errorMessage?: string;
}

export function FormControlWrapper({
  testId,
  children,
  subtext,
  textAlign,
  isErrored,
  errorMessage,
}: FormControlWrapperProps) {
  return (
    <FormControl
      testId={testId}
      textAlign={textAlign ?? 'left'}
      validationStatus={isErrored ? 'error' : 'success'}
    >
      {children}
      {subtext && <FormControl.Caption>{subtext}</FormControl.Caption>}
      {isErrored && (
        <FormControl.Validation testId={`${testId}-error`}>{errorMessage}</FormControl.Validation>
      )}
    </FormControl>
  );
}
