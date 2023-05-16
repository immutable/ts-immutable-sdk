import { TextInput } from '@biom3/react';
import { FormControlWrapper } from '../FormControlWrapper/FormControlWrapper';

interface TextInputFormProps {
  testId: string;
  value: string;
  placeholder?: string;
  subtext?: string;
  textAlign?: 'left' | 'right';
  isErrored?: boolean;
  errorMessage?: string;
  validator: (value: string) => boolean;
  onTextInputFocus: () => void;
  onTextInputChange: (value: string) => void;
  onTextInputBlur: (value: string) => void;
  maxButtonClick?: () => void;
}

export function TextInputForm({
  testId,
  value,
  placeholder,
  errorMessage,
  isErrored,
  validator,
  onTextInputFocus,
  onTextInputChange,
  onTextInputBlur,
  textAlign,
  subtext,
  maxButtonClick,
}: TextInputFormProps) {
  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    if (!validator(inputValue)) return;
    onTextInputChange(inputValue);
  };

  const handleOnBlur = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    if (!validator(inputValue)) return;
    onTextInputBlur(inputValue);
  };

  return (
    <FormControlWrapper
      textAlign={textAlign ?? 'left'}
      subtext={subtext}
      isErrored={isErrored}
      errorMessage={errorMessage}
    >
      <TextInput
        testId={testId}
        onChange={handleOnChange}
        sizeVariant="large"
        value={value}
        validationStatus={isErrored ? 'error' : 'success'}
        placeholder={placeholder}
        onBlur={handleOnBlur}
        hideClearValueButton
        onFocus={onTextInputFocus}
        sx={{ backgroundColor: 'base.color.translucent.container.200' }}
      >
        {maxButtonClick && (
          <TextInput.Button onClick={maxButtonClick}>max</TextInput.Button>
        )}
      </TextInput>
    </FormControlWrapper>
  );
}
