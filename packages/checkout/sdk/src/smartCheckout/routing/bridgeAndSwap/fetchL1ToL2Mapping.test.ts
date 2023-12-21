import { Environment } from '@imtbl/config';
import { CheckoutConfiguration } from '../../../config';
import { fetchL1Representation } from '../indexer/fetchL1Representation';
import { fetchL1ToL2Mappings } from './fetchL1ToL2Mappings';
import { HttpClient } from '../../../api/http';

jest.mock('../indexer/fetchL1Representation');

describe('fetchL1ToL2Mappings', () => {
  const mockedHttpClient = new HttpClient() as jest.Mocked<HttpClient>;
  const config = new CheckoutConfiguration({
    baseConfig: { environment: Environment.SANDBOX },
  }, mockedHttpClient);

  it('should fetch the l1 to l2 token mapping', async () => {
    (fetchL1Representation as jest.Mock)
      .mockResolvedValueOnce(
        {
          l1address: '0xIMXL1',
          l2address: '0xIMX',
        },
      )
      .mockResolvedValueOnce(
        {
          l1address: '0xYEETL1',
          l2address: '0xYEET',
        },
      );

    const mapping = await fetchL1ToL2Mappings(config, [
      {
        address: '0xIMX',
        name: 'IMX',
        symbol: 'IMX',
        decimals: 18,
      },
      {
        address: '0xYEET',
        name: 'zkYEET',
        symbol: 'zkYEET',
        decimals: 18,
      },
    ]);

    expect(fetchL1Representation).toHaveBeenCalledTimes(2);
    expect(mapping).toEqual([
      {
        l1address: '0xIMXL1',
        l2address: '0xIMX',
      },
      {
        l1address: '0xYEETL1',
        l2address: '0xYEET',
      },
    ]);
  });

  it('should return an empty array if no swappable l2 addresses', async () => {
    (fetchL1Representation as jest.Mock).mockResolvedValue({});

    const mapping = await fetchL1ToL2Mappings(config, []);

    expect(fetchL1Representation).toHaveBeenCalledTimes(0);
    expect(mapping).toEqual([]);
  });
});
