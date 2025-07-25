import axios, { AxiosResponse } from 'axios';
import { fetchRiskAssessment, isAddressSanctioned } from './riskAssessment';
import { CheckoutConfiguration } from '../config';

jest.mock('axios');

describe('riskAssessment', () => {
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

  describe('fetchRiskAssessment', () => {
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

      const sanctions = await fetchRiskAssessment(
        mockedConfig,
        [
          { address: address1, tokenAddr: '0xtest1', amount: '100' },
          { address: address2, tokenAddr: '0xtest2', amount: '200' },
        ],
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

      const sanctions = await fetchRiskAssessment(
        mockedConfig,
        [{ address: address1 }], // Test without token data when disabled
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

      const sanctions = await fetchRiskAssessment(
        mockedConfig,
        [{ address: address1, tokenAddr: '0xtest', amount: '100' }],
      );

      expect(sanctions[address1.toLowerCase()]).toEqual({ sanctioned: false });
    });
  });

  describe('isAddressSanctioned', () => {
    it('should return true if any address is sanctioned', () => {
      const assessment = {
        '0x9999999123123123': {
          sanctioned: false,
        },
        '0xabcdef1234567890': {
          sanctioned: true,
        },
      };

      expect(isAddressSanctioned(assessment)).toBe(true);
    });

    it('should return true if single address is sanctioned', () => {
      const address = '0x1234567890ABCdef';
      const assessment = {
        [address.toLowerCase()]: {
          sanctioned: true,
        },
      };

      expect(isAddressSanctioned(assessment, address)).toBe(true);
    });

    it('should return false if single address is not sanctioned', () => {
      const address = '0x1234567890ABCdef';
      const assessment = {
        [address.toLowerCase()]: {
          sanctioned: false,
        },
      };

      expect(isAddressSanctioned(assessment, address)).toBe(false);
    });
  });
});
