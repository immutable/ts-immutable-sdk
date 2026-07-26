import { RequestExampleProps } from '@/types';
import ValidateSignature from '@/components/zkevm/SignatureValidation/ValidateSignature';
import { isValidERC191Signature } from './isValidERC191Signature';

function ValidateERC191Signature({ disabled, handleExampleSubmitted }: RequestExampleProps) {
  return (
    <ValidateSignature
      handleExampleSubmitted={handleExampleSubmitted}
      disabled={disabled}
      handleSignatureValidation={isValidERC191Signature}
    />
  );
}

export default ValidateERC191Signature;
