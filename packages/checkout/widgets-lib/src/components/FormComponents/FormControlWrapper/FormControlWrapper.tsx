import { FormControl, FormControlProps } from '@biom3/react';

interface FormControlWrapperProps {
  testId: string;
  children: React.ReactNode;
  subtext?: string;
  textAlign?: 'left' | 'right';
  isErrored?: boolean;
  errorMessage?: string;
  sx?: FormControlProps<undefined>['sx'];
}

export function FormControlWrapper({
  testId,
  children,
  subtext,
  textAlign,
  isErrored,
  errorMessage,
  sx,
}: FormControlWrapperProps) {
  return (
    <FormControl
      testId={testId}
      textAlign={textAlign ?? 'left'}
      validationStatus={isErrored ? 'error' : 'success'}
      sx={sx}
    >
      {children}
      {subtext && (
        <FormControl.Caption testId={`${testId}-subtext`}>
          {subtext}
        </FormControl.Caption>
      )}
      {isErrored && (
        <FormControl.Validation testId={`${testId}-error`}>
          {errorMessage}
        </FormControl.Validation>
      )}
    </FormControl>
  );
}
