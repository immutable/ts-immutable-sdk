import { RequestExampleProps } from '@/types';
import ValidateSignature from '@/components/zkevm/SignatureValidation/ValidateSignature';
import { isValidTypedDataSignature } from './isValidTypedDataSignature';

function ValidateTypedDataSignature({ disabled, handleExampleSubmitted }: RequestExampleProps) {
  return (
    <ValidateSignature
      handleExampleSubmitted={handleExampleSubmitted}
      disabled={disabled}
      handleSignatureValidation={isValidTypedDataSignature}
    />
  );
}

export default ValidateTypedDataSignature;
