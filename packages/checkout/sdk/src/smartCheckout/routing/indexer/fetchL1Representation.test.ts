import { Environment } from '@imtbl/config';
import { CheckoutConfiguration } from '../../../config';
import { createBlockchainDataInstance } from '../../../instance';
import { ChainId } from '../../../types';
import { fetchL1Representation } from './fetchL1Representation';
import { NATIVE } from '../../../env';
import { HttpClient } from '../../../api/http';

jest.mock('../../../instance');

describe('fetchL1Representation', () => {
  const mockedHttpClient = new HttpClient() as jest.Mocked<HttpClient>;
  const config = new CheckoutConfiguration({
    baseConfig: { environment: Environment.SANDBOX },
  }, mockedHttpClient);

  it('should fetch L1 representation of ERC20', async () => {
    const requiredL2Address = '0x123';
    (createBlockchainDataInstance as jest.Mock).mockReturnValue({
      getToken: jest.fn().mockResolvedValue({
        result: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          root_contract_address: '0xROOT_ADDRESS',
        },
      }),
    });

    const result = await fetchL1Representation(
      config,
      requiredL2Address,
    );

    expect(result).toEqual({ l1address: '0xROOT_ADDRESS', l2address: '0x123' });
  });

  it('should fetch L1 representation of IMX native', async () => {
    const requiredL2Address = '';
    (createBlockchainDataInstance as jest.Mock).mockReturnValue({
      getToken: jest.fn().mockResolvedValue({}),
    });

    const result = await fetchL1Representation(
      {
        remote: {
          getConfig: jest.fn().mockResolvedValue({
            [ChainId.SEPOLIA]: '0x2Fa06C6672dDCc066Ab04631192738799231dE4a',
          }),
        },
      } as unknown as CheckoutConfiguration,
      requiredL2Address,
    );

    expect(result).toEqual(
      {
        l1address: '0x2Fa06C6672dDCc066Ab04631192738799231dE4a',
        l2address: NATIVE,
      },
    );
    expect(createBlockchainDataInstance).not.toHaveBeenCalled();
  });

  it('should return undefined if indexer returns null and no matching L1', async () => {
    const requiredL2Address = '0x123';
    (createBlockchainDataInstance as jest.Mock).mockReturnValue({
      getToken: jest.fn().mockResolvedValue({
        result: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          root_contract_address: null,
        },
      }),
    });

    const result = await fetchL1Representation(
      config,
      requiredL2Address,
    );

    expect(result).toEqual(undefined);
  });

  it('should return IMX native string if L2 address is empty', async () => {
    const requiredL2Address = '';
    const result = await fetchL1Representation(
      {
        remote: {
          getConfig: jest.fn().mockResolvedValue({
            [ChainId.SEPOLIA]: '0xIMX_ADDRESS',
          }),
        },
      } as unknown as CheckoutConfiguration,
      requiredL2Address,
    );

    expect(result).toEqual({ l1address: '0xIMX_ADDRESS', l2address: 'native' });
    expect(createBlockchainDataInstance).not.toHaveBeenCalled();
  });
});
