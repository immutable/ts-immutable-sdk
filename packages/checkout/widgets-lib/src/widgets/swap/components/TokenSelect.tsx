import { Body, Box } from '@biom3/react';
import { useCallback, useEffect, useState } from 'react';
import { TokenInfo } from '@imtbl/checkout-sdk';
import {
  OptionsContainerStyle,
  OptionStyle,
  SelectedOptionStyle,
  SelectStyle,
} from '../SwapStyles';
import { alphaSortTokensList } from '../helpers';

export interface TokenSelectProps {
  allowedTokens: TokenInfo[];
  onChange: (token: TokenInfo) => void;
  token?: TokenInfo;
  testId: string;
  filter?: string[];
}

const TokenSelect = ({
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
    (token: TokenInfo) => {
      setOption(token?.symbol);
      setIcon(token?.icon);
      onChange(token);
    },
    [setOption, setIcon, onChange]
  );

  useEffect(() => {
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
    <Box sx={SelectStyle} onClick={() => toggleOpen()}>
      <Box testId={`${testId}__selected-option`} sx={SelectedOptionStyle}>
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
};

export default TokenSelect;
