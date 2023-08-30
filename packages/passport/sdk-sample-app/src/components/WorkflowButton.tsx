import { Button, ButtonProps } from "@biom3/react";
import { ReactElement } from "react";

function WorkflowButton<RC extends ReactElement | undefined>({
  children,
  ...remainingProps
}: ButtonProps<RC>) {
  const { disabled } =
    "disabled" in remainingProps ? remainingProps : { disabled: undefined };
  return (
    <Button variant={disabled ? "tertiary" : "primary"} {...remainingProps}>
      {children}
    </Button>
  );
}

export default WorkflowButton;
