import { TextInput } from '@biom3/react';
import { FormControlWrapper } from '../FormControlWrapper/FormControlWrapper';
import { useState } from 'react';

interface TextInputFormProps {
  errorMessage?: string;
  isErrored?: boolean;
  validator: (value: string) => boolean;
}

export const TextInputForm = ({
  errorMessage,
  isErrored,
  validator,
}: TextInputFormProps) => {
  const [textInputValue, setTextInputValue] = useState<string>('');

  const handleOnChange = (event) => {
    const value = event.target.value;
    if (!validator(value)) return;
    setTextInputValue(value);
  };

  return (
    <FormControlWrapper isErrored={isErrored} errorMessage={errorMessage}>
      <TextInput
        onChange={handleOnChange}
        sizeVariant="large"
        value={textInputValue}
        validationStatus={isErrored ? 'error' : 'success'}
        placeholder="1.123456"
      >
        <TextInput.Button
          onClick={() => console.log('max btn clicked, do stuff!')}
        >
          max
        </TextInput.Button>
      </TextInput>
    </FormControlWrapper>
  );
};
