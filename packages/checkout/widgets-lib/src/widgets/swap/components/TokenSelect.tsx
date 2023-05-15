import { Body, Box } from '@biom3/react';
import { useCallback, useEffect, useState } from 'react';
import { TokenInfo } from '@imtbl/checkout-sdk';
import {
  optionsContainerStyle,
  optionStyle,
  selectedOptionStyle,
  selectStyle,
} from '../SwapStyles';
import { alphaSortTokensList } from '../helpers';

export interface TokenSelectProps {
  allowedTokens: TokenInfo[];
  onChange: (token: TokenInfo) => void;
  token?: TokenInfo;
  testId: string;
  filter?: string[];
}

function TokenSelect({
  testId,
  onChange,
  token,
  filter,
  allowedTokens,
}: TokenSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [option, setOption] = useState(token?.symbol);
  const [icon, setIcon] = useState(token?.icon);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const selectOption = useCallback(
    (tkn: TokenInfo) => {
      setOption(tkn?.symbol);
      setIcon(tkn?.icon);
      onChange(tkn);
    },
    [setOption, setIcon, onChange],
  );

  useEffect(() => {
    // TODO: please fix
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    token && selectOption(token);
  }, [token, selectOption]);

  const getTokens = useCallback(async () => {
    const sortedAllowList = alphaSortTokensList(allowedTokens);
    setOption(sortedAllowList[0]?.symbol);
    setIcon(sortedAllowList[0]?.icon);
  }, [allowedTokens]);

  useEffect(() => {
    getTokens();
  }, [getTokens]);

  return (
    <Box sx={selectStyle} onClick={() => toggleOpen()}>
      <Box testId={`${testId}__selected-option`} sx={selectedOptionStyle}>
        <img
          style={{ width: '16px', height: '16px' }}
          alt={option}
          src={icon}
        />
        <Body testId={`${testId}__selected-option-text`} size="small">
          {option}
        </Body>
      </Box>
      {isOpen && (
        <Box sx={OptionsContainerStyle}>
          {allowedTokens.map((token) => {
            return !filter || filter.includes(token.address || '') ? (
              <Box
                testId={`${testId}__option-${token.symbol}`}
                sx={OptionStyle}
                key={token.symbol}
                onClick={() => selectOption(token)}
              >
                <img
                  style={{ width: '16px', height: '16px' }}
                  src={token.icon}
                  alt={token.symbol}
                />
                <Body size="small">{token.symbol}</Body>
              </Box>
            ) : null;
          })}
        </Box>
      )}
    </Box>
  );
}

export default TokenSelect;
