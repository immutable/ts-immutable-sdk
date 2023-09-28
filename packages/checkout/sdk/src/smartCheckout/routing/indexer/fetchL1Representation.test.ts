import { Environment } from '@imtbl/config';
import { CheckoutConfiguration } from '../../../config';
import { createBlockchainDataInstance } from '../../../instance';
import { ChainId, IMX_ADDRESS_ZKEVM } from '../../../types';
import { fetchL1Representation } from './fetchL1Representation';

jest.mock('../../../instance');

describe('fetchL1Representation', () => {
  const config = new CheckoutConfiguration({
    baseConfig: { environment: Environment.SANDBOX },
  });

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

  it('should fetch L1 representation of NATIVE', async () => {
    const requiredL2Address = IMX_ADDRESS_ZKEVM;
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
        l2address: '0x0000000000000000000000000000000000001010',
      },
    );
    expect(createBlockchainDataInstance).not.toHaveBeenCalled();
  });

  it('should return empty string if indexer returns null', async () => {
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

    expect(result).toEqual({ l1address: '', l2address: '0x123' });
  });

  it('should return empty string if L2 address is empty', async () => {
    const requiredL2Address = '';
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

    expect(result).toEqual({ l1address: '', l2address: '' });
    expect(createBlockchainDataInstance).not.toHaveBeenCalled();
  });
});
