import { j as jsx, d4 as TextInput, cJ as FormControlWrapper } from './index-Ae2juTF3.js';

function TextInputForm({ testId, value, placeholder, errorMessage, validator, onTextInputChange, onTextInputBlur, onTextInputFocus, onTextInputEnter, textAlign, type, subtext, maxButtonClick, disabled, inputMode, }) {
    const handleOnChange = (event, previousValue) => {
        let inputValue = event.target.value;
        if (type === 'number' && inputValue === '.') {
            inputValue = '0.';
        }
        if (!validator(inputValue)) {
            // TODO: is there a better solution to this, cypress tests having issues with typing 'abc' and it still being set
            onTextInputChange(previousValue ?? '');
            return;
        }
        onTextInputChange(inputValue);
    };
    const handleOnBlur = (event) => {
        if (!onTextInputBlur)
            return;
        const inputValue = event.target.value;
        if (!validator(inputValue))
            return;
        onTextInputBlur(inputValue);
    };
    const handleOnFocus = (event) => {
        if (!onTextInputFocus)
            return;
        const inputValue = event.target.value;
        if (!validator(inputValue))
            return;
        onTextInputFocus(inputValue);
    };
    const handleOnKeyDown = (event) => {
        if (!onTextInputEnter)
            return;
        if (event.key === 'Enter') {
            onTextInputEnter();
        }
    };
    return (jsx(FormControlWrapper, { testId: `${testId}-text-control`, textAlign: textAlign ?? 'left', subtext: errorMessage ? undefined : subtext, isErrored: !!errorMessage, errorMessage: errorMessage, sx: { width: '100%' }, children: jsx(TextInput, { testId: `${testId}-text`, onChange: (event) => handleOnChange(event, value), sizeVariant: "large", value: value, inputMode: inputMode, validationStatus: errorMessage ? 'error' : 'success', placeholder: placeholder, onBlur: handleOnBlur, onFocus: handleOnFocus, onKeyDown: handleOnKeyDown, disabled: disabled, hideClearValueButton: true, sx: { minWidth: '100%' }, children: maxButtonClick && (jsx(TextInput.Button, { testId: `${testId}-max-button`, onClick: maxButtonClick, disabled: disabled, children: "max" })) }) }));
}

export { TextInputForm as T };
