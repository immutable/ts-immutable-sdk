/* eslint-disable @typescript-eslint/naming-convention */
import axios, { AxiosResponse } from 'axios';
import { CheckoutConfiguration } from '@imtbl/checkout-sdk';
import { fetchRiskAssessmentV2 } from './riskAssessmentV2';

jest.mock('axios');

describe('riskAssessmentV2', () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  const mockRemoteConfig = jest.fn();

  const mockedConfig = {
    remote: {
      getConfig: mockRemoteConfig,
    },
  } as unknown as CheckoutConfiguration;

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchRiskAssessmentV2', () => {
    it('should fetch risk assessment and process it according to config', async () => {
      mockRemoteConfig.mockResolvedValue({
        enabled: true,
        levels: ['severe'],
      });

      const address1 = '0x1234567890';
      const address2 = '0xabcdef1234';

      const mockRiskResponse = {
        status: 200,
        data: [{
          address: address1,
          risk: 'Low',
          risk_reason: 'No reason',
        }, {
          address: address2,
          risk: 'Severe',
          risk_reason: 'Sanctioned',
        }],
      } as AxiosResponse;
      mockedAxios.post.mockResolvedValueOnce(mockRiskResponse);

      const sanctions = await fetchRiskAssessmentV2(
        [
          { address: address1, tokenAddr: '0xtest1', amount: BigInt(100) },
          { address: address2, tokenAddr: '0xtest2', amount: BigInt(200) },
        ],
        mockedConfig,
      );

      expect(sanctions[address1.toLowerCase()]).toEqual({ sanctioned: false });
      expect(sanctions[address2.toLowerCase()]).toEqual({ sanctioned: true });
    });

    it('should return default risk assessment if disabled', async () => {
      mockRemoteConfig.mockResolvedValue({
        enabled: false,
        levels: [],
      });

      const address1 = '0x1234567890';

      const sanctions = await fetchRiskAssessmentV2(
        // Include required fields even when disabled
        [{ address: address1, tokenAddr: 'native', amount: BigInt(100) }],
        mockedConfig,
      );

      expect(sanctions[address1.toLowerCase()]).toEqual({ sanctioned: false });
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it('should return default risk assessment on empty response', async () => {
      mockRemoteConfig.mockResolvedValue({
        enabled: true,
        levels: ['severe'],
      });

      const address1 = '0x1234567890';

      const mockRiskResponse = {
        status: 200,
        data: [],
      } as AxiosResponse;
      mockedAxios.post.mockResolvedValueOnce(mockRiskResponse);

      const sanctions = await fetchRiskAssessmentV2(
        [{ address: address1, tokenAddr: '0xtest', amount: BigInt(100) }],
        mockedConfig,
      );

      expect(sanctions[address1.toLowerCase()]).toEqual({ sanctioned: false });
    });
  });
});
