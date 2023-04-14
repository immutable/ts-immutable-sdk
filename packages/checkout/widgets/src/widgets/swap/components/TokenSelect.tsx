import { Box, Body } from '@biom3/react';
import { useCallback, useEffect, useState } from 'react';
import { Checkout, ConnectResult, TokenInfo } from '@imtbl/checkout-sdk-web';
import { SelectStyle, OptionsContainerStyle, OptionStyle, SelectedOptionStyle } from '../SwapStyles';
import { alphaSortTokensList } from '../helpers';

export interface TokenSelectProps {
  onChange: (token: TokenInfo) => void;
  token?: TokenInfo;
  testId: string;
  connection: ConnectResult;
  filter?: string[];
}

const TokenSelect = ({ testId, onChange, token, connection, filter }: TokenSelectProps) => {
  const checkout = new Checkout();
  const allowList = checkout.getTokenAllowList({chainId: 1}); // TODO: THIS NEEDS TO BE SET BACK TO THE NETWORK CHAIN ID

  const sortedAllowList = alphaSortTokensList(allowList.tokens);

  const [isOpen, setIsOpen] = useState(false);
  const [option, setOption] = useState(token?.symbol || sortedAllowList[0]?.symbol);
  const [icon, setIcon] = useState(token?.icon || sortedAllowList[0]?.icon)

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const selectOption = useCallback((token: TokenInfo) => {
    setOption(token?.symbol);
    setIcon(token?.icon);
    onChange(token);
  }, [setOption, setIcon, onChange]);

  useEffect(()=>{
    token && selectOption(token)
  }, [token, selectOption])

  return (
    <Box sx={SelectStyle} onClick={() => toggleOpen()} >
      <Box testId={`${testId}__selected-option`} sx={SelectedOptionStyle}>
        <img style={{ width: '16px', height: '16px' }} alt={option} src={icon}/>
        <Body testId={`${testId}__selected-option-text`} size="small">{option}</Body>
      </Box>
      {isOpen &&
        <Box sx={OptionsContainerStyle}>
          {sortedAllowList.map((token) => {
            return (!filter || filter.includes(token.address || "")) ? (
              <Box testId={`${testId}__option-${token.symbol}`} sx={OptionStyle} key={token.symbol} onClick={() => selectOption(token)} >
                <img  style={{ width: '16px', height: '16px' }} src={token.icon} alt={token.symbol} />
                <Body size="small">{token.symbol}</Body>
              </Box>
            ) : null
          })}
        </Box>
      }
    </Box>
  );
};

export default TokenSelect;
