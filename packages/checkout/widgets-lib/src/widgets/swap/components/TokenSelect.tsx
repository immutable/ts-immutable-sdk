import { Body, Box } from '@biom3/react';
import { useCallback, useEffect, useState } from 'react';
import { TokenInfo } from '@imtbl/checkout-sdk';
import {
  optionsContainerStyle,
  optionStyle,
  selectedOptionStyle,
  selectStyle,
} from './TokenSelectStyles';
import { alphaSortTokensList } from '../helpers/tokens';

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
}: TokenSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [option, setOption] = useState(token?.symbol);
  const [icon, setIcon] = useState(token?.icon);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const selectOption = useCallback(
    // TODO: token is declared in the upper scope
    // eslint-disable-next-line @typescript-eslint/no-shadow
    (token: TokenInfo) => {
      setOption(token?.symbol);
      setIcon(token?.icon);
      onChange(token);
    },
    [setOption, setIcon, onChange],
  );

  useEffect(() => {
    // TODO: Expected an assignment or function call and instead saw an expression
    // if statement? should this be short curcuited?
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
        <Box sx={optionsContainerStyle}>
          {/* TODO: 'token' is already declared in the upper scope */}
          {/* eslint-disable-next-line @typescript-eslint/no-shadow */}
          {allowedTokens.map((token) => (!filter || filter.includes(token.address || '') ? (
            <Box
              testId={`${testId}__option-${token.symbol}`}
              sx={optionStyle}
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
          ) : null))}
        </Box>
      )}
    </Box>
  );
}

export default TokenSelect;
