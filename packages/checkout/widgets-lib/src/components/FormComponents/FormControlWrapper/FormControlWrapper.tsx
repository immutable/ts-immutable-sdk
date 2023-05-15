import { FormControl } from '@biom3/react';

interface FormControlWrapperProps {
  children: React.ReactNode;
}

export const FormControlWrapper = ({ children }: FormControlWrapperProps) => {
  return <FormControl>{children}</FormControl>;
};
