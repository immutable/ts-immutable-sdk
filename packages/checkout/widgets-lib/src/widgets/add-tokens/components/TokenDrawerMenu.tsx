import { Checkout, TokenFilterTypes, TokenInfo } from '@imtbl/checkout-sdk';
import {
  Box,
  ButtCon,
  Drawer,
  FramedImage,
  MenuItem,
  SmartClone,
  TextInput,
  VerticalMenu,
} from '@biom3/react';
import {
  Dispatch,
  type MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Environment } from '@imtbl/config';
import { useTranslation } from 'react-i18next';
import type { StrongCheckoutWidgetsConfig } from '../../../lib/withDefaultWidgetConfig';
import {
  AddTokensAction,
  AddTokensActions,
  AddTokensState,
} from '../context/AddTokensContext';
import { useError } from '../hooks/useError';
import {
  getDefaultTokenImage,
  getTokenImageByAddress,
  isNativeToken,
} from '../../../lib/utils';
import {
  useAnalytics,
  UserJourney,
} from '../../../context/analytics-provider/SegmentAnalyticsProvider';
import { getL2ChainId } from '../../../lib';
import { AddTokensErrorTypes } from '../types';
import { TokenImage } from '../../../components/TokenImage/TokenImage';
import { TOKEN_PRIORITY_ORDER } from '../utils/config';
import { PULSE_SHADOW } from '../utils/animation';

export interface TokenDrawerMenuProps {
  checkout: Checkout;
  config: StrongCheckoutWidgetsConfig;
  toTokenAddress?: string;
  addTokensState: AddTokensState;
  addTokensDispatch: Dispatch<AddTokensAction>;
}

export function TokenDrawerMenu({
  checkout,
  config,
  toTokenAddress,
  addTokensState,
  addTokensDispatch,
}: TokenDrawerMenuProps) {
  const { showErrorHandover } = useError(config.environment);
  const [visible, setVisible] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const defaultTokenImage = getDefaultTokenImage(
    checkout?.config.environment,
    config.theme,
  );
  const { track } = useAnalytics();
  const { t } = useTranslation();

  const setSelectedToken = (token: TokenInfo | undefined) => {
    addTokensDispatch({
      payload: {
        type: AddTokensActions.SET_SELECTED_TOKEN,
        selectedToken: token,
      },
    });
  };

  const handleTokenChange = useCallback(
    (token: TokenInfo) => {
      track({
        userJourney: UserJourney.ADD_TOKENS,
        screen: 'InputScreen',
        control: 'TokensMenu',
        controlType: 'MenuItem',
        extras: {
          contextId: addTokensState.id,
          tokenAddress: token?.address,
        },
      });
      setSelectedToken(token);
      setVisible(false);
      setSearchValue('');
    },
    [addTokensState.id],
  );

  const isSelected = useCallback(
    (token: TokenInfo) => token.address === addTokensState.selectedToken?.address,
    [addTokensState.selectedToken],
  );

  const tokenChoiceOptions = useMemo(
    () => addTokensState.allowedTokens?.filter((token) => {
      if (!searchValue) return true;
      return token.symbol.toLowerCase().startsWith(searchValue.toLowerCase());
    }),
    [
      addTokensState.allowedTokens,
      addTokensState.tokens,
      handleTokenChange,
      isSelected,
      defaultTokenImage,
      searchValue,
    ],
  );

  const handleTokenIconClick = useCallback<
  MouseEventHandler<HTMLButtonElement>
  >(() => {
    setVisible(!visible);
  }, [visible]);

  const handleDrawerClose = useCallback(() => {
    setVisible(false);
    setSearchValue('');
  }, [setVisible, setSearchValue]);

  useEffect(() => {
    if (!checkout || addTokensState.tokens != null) return;

    (async () => {
      try {
        const tokenResponse = await checkout.getTokenAllowList({
          type: TokenFilterTypes.SWAP,
          chainId: getL2ChainId(checkout.config),
        });

        if (tokenResponse?.tokens.length > 0) {
          const updatedTokens = tokenResponse.tokens.map((token) => {
            if (isNativeToken(token.address)) {
              return {
                ...token,
                icon: getTokenImageByAddress(
                  checkout.config.environment as Environment,
                  token.symbol,
                ),
              };
            }
            return token;
          });
          updatedTokens.sort((a, b) => {
            const aIndex = TOKEN_PRIORITY_ORDER.findIndex(
              (token) => token === a.symbol,
            );
            const bIndex = TOKEN_PRIORITY_ORDER.findIndex(
              (token) => token === b.symbol,
            );
            // If both tokens are not in the priority list, sort by symbol
            if (aIndex === -1 && bIndex === -1) {
              return a.symbol.localeCompare(b.symbol);
            }
            // If only one token is in the priority list, sort it first
            if (aIndex === -1) {
              return 1;
            }
            if (bIndex === -1) {
              return -1;
            }
            // If both tokens are in the priority list, sort by index
            return aIndex < bIndex ? -1 : 1;
          });

          if (toTokenAddress) {
            const preselectedToken = updatedTokens.find(
              (token) => token.address?.toLowerCase() === toTokenAddress.toLowerCase(),
            );

            if (preselectedToken) {
              setSelectedToken(preselectedToken);
            }
          }

          addTokensDispatch({
            payload: {
              type: AddTokensActions.SET_ALLOWED_TOKENS,
              allowedTokens: updatedTokens,
            },
          });
        }
      } catch (error) {
        showErrorHandover(AddTokensErrorTypes.SERVICE_BREAKDOWN, { contextId: addTokensState.id, error });
      }
    })();
  }, [addTokensState.tokens, checkout, toTokenAddress]);

  return (
    <Drawer
      visible={visible}
      onCloseDrawer={handleDrawerClose}
      size="full"
      headerBarTitle={t('views.ADD_TOKENS.tokenSelection.drawerHeading')}
      drawerCloseIcon="ChevronExpand"
      showHeaderBar
      outsideClicksClose
      escapeKeyClose
    >
      <Drawer.Target>
        {addTokensState.selectedToken ? (
          <SmartClone
            onClick={handleTokenIconClick as MouseEventHandler<unknown>}
          >
            <FramedImage
              size="xLarge"
              use={(
                <TokenImage
                  src={addTokensState.selectedToken?.icon}
                  name={addTokensState.selectedToken?.name}
                  defaultImage={defaultTokenImage}
                />
              )}
              padded
              emphasized
              circularFrame
              sx={{
                cursor: 'pointer',
                mb: 'base.spacing.x1',
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '&:hover': {
                  boxShadow: ({ base }) => `0 0 0 ${base.border.size[200]} ${base.color.text.body.primary}`,
                },
              }}
            />
          </SmartClone>
        ) : (
          <Box
            sx={{
              animation: `${PULSE_SHADOW} 2s infinite ease-in-out`,
              borderRadius: '50%',
            }}
          >
            <ButtCon
              size="large"
              variant="tertiary"
              icon="Add"
              onClick={handleTokenIconClick}
            />
          </Box>
        )}
      </Drawer.Target>
      <Drawer.Content sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflowY: 'hidden',
      }}
      >
        <TextInput
          sx={{ marginBottom: 'base.spacing.x2' }}
          placeholder={t('views.ADD_TOKENS.tokenSelection.searchPlaceholder')}
          sizeVariant="medium"
          onChange={(event) => {
            setSearchValue(event.target.value);
          }}
        >
          <TextInput.Icon icon="Search" />
        </TextInput>
        <VerticalMenu sx={{
          maxHeight: '100%',
          overflowY: 'auto',
        }}
        >
          {tokenChoiceOptions
            && tokenChoiceOptions.length > 0
            && tokenChoiceOptions.map((token) => (
              <MenuItem
                size="medium"
                key={token.name}
                onClick={() => handleTokenChange(token)}
                selected={isSelected(token)}
                emphasized
              >
                <MenuItem.FramedImage
                  circularFrame
                  use={(
                    <TokenImage
                      src={token.icon}
                      name={token.name}
                      defaultImage={defaultTokenImage}
                    />
                  )}
                  emphasized={false}
                />
                <MenuItem.Label>{token.symbol}</MenuItem.Label>
                {token.symbol !== token.name && (
                  <MenuItem.Caption>{token.name}</MenuItem.Caption>
                )}
              </MenuItem>
            ))}
        </VerticalMenu>
      </Drawer.Content>
    </Drawer>
  );
}
