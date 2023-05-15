import { TextInput } from '@biom3/react';
import { FormControlWrapper } from '../FormControlWrapper/FormControlWrapper';
import { useState } from 'react';

interface TextInputFormProps {
  subtext?: string;
  textAlign?: 'left' | 'right';
  isErrored?: boolean;
  errorMessage?: string;
  validator: (value: string) => boolean;
  onTextInputBlur: (value: string) => void;
  maxButtonClick?: () => void;
}

export const TextInputForm = ({
  errorMessage,
  isErrored,
  validator,
  onTextInputBlur,
  textAlign,
  subtext,
  maxButtonClick,
}: TextInputFormProps) => {
  const [textInputValue, setTextInputValue] = useState<string>('');

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (!validator(value)) return;
    setTextInputValue(value);
  };

  const handleOnBlur = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (!validator(value)) return;
    onTextInputBlur(value);
  };

  return (
    <FormControlWrapper
      textAlign={textAlign ?? 'left'}
      subtext={subtext}
      isErrored={isErrored}
      errorMessage={errorMessage}
    >
      <TextInput
        onChange={handleOnChange}
        sizeVariant="large"
        value={textInputValue}
        validationStatus={isErrored ? 'error' : 'success'}
        placeholder="1.123456"
        onBlur={handleOnBlur}
      >
        {maxButtonClick && (
          <TextInput.Button onClick={maxButtonClick}>max</TextInput.Button>
        )}
      </TextInput>
    </FormControlWrapper>
  );
};
