import { TextInput } from '@biom3/react';
import { FormControlWrapper } from '../FormControlWrapper/FormControlWrapper';

interface TextInputFormProps {
  testId: string;
  value: string;
  placeholder?: string;
  subtext?: string;
  textAlign?: 'left' | 'right';
  errorMessage?: string;
  disabled?: boolean;
  validator: (value: string) => boolean;
  onTextInputChange: (value: string) => void;
  onTextInputBlur: (value: string) => void;
  onTextInputFocus?: (value: string) => void;
  maxButtonClick?: () => void;
}

export function TextInputForm({
  testId,
  value,
  placeholder,
  errorMessage,
  validator,
  onTextInputChange,
  onTextInputBlur,
  onTextInputFocus,
  textAlign,
  subtext,
  maxButtonClick,
  disabled,
}: TextInputFormProps) {
  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>, previousValue: string) => {
    const inputValue = event.target.value;
    if (!validator(inputValue)) {
      // TODO: is there a better solution to this, cypress tests having issues with typing 'abc' and it still being set
      onTextInputChange(previousValue ?? '');
      return;
    }
    onTextInputChange(inputValue);
  };

  const handleOnBlur = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    if (!validator(inputValue)) return;
    onTextInputBlur(inputValue);
  };

  const handleOnFocus = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!onTextInputFocus) return;
    const inputValue = event.target.value;
    if (!validator(inputValue)) return;
    onTextInputFocus(inputValue);
  };

  return (
    <FormControlWrapper
      testId={`${testId}-text-control`}
      textAlign={textAlign ?? 'left'}
      subtext={errorMessage ? undefined : subtext}
      isErrored={!!errorMessage}
      errorMessage={errorMessage}
      sx={{ width: '100%' }}
    >
      <TextInput
        testId={`${testId}-text`}
        onChange={(event) => handleOnChange(event, value)}
        sizeVariant="large"
        value={value}
        validationStatus={errorMessage ? 'error' : 'success'}
        placeholder={placeholder}
        onBlur={handleOnBlur}
        onFocus={handleOnFocus}
        disabled={disabled}
        hideClearValueButton
        sx={{ minWidth: '100%' }}
      >
        {maxButtonClick && (
          <TextInput.Button
            testId={`${testId}-max-button`}
            onClick={maxButtonClick}
            disabled={disabled}
          >
            max
          </TextInput.Button>
        )}
      </TextInput>
    </FormControlWrapper>
  );
}
