import { Button, ButtonProps } from '@biom3/react';

function WorkflowButton({ children, disabled, ...remainingProps }: ButtonProps) {
  return (
    <Button
      variant={disabled ? 'tertiary' : 'primary'}
      {...remainingProps}
    >
      { children }
    </Button>
  );
}

export default WorkflowButton;
