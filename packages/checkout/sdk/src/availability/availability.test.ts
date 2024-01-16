import axios from 'axios';
import { availabilityService } from './availability';
import { CheckoutError, CheckoutErrorType } from '../errors';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('availabilityService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkDexAvailability', () => {
    it('should return true when status is 2xx', async () => {
      const mockResponse = {};
      mockedAxios.post.mockResolvedValueOnce(mockResponse);
      const response = await availabilityService(true, false).checkDexAvailability();

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(response).toEqual(true);
    });

    it('should return false when status is 403', async () => {
      const mockResponse = {
        status: 403,
      };
      mockedAxios.post.mockRejectedValueOnce({ response: mockResponse });
      const response = await availabilityService(true, false).checkDexAvailability();

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(response).toEqual(false);
    });

    it('should throw error when status is neither 204 or 403', async () => {
      const mockResponse = {
        status: 500,
        statusText: 'error message',
      };
      mockedAxios.post.mockRejectedValueOnce({ response: mockResponse });

      await expect(availabilityService(true, false).checkDexAvailability())
        .rejects
        .toThrow(
          new CheckoutError(
            'Error fetching from api: 500 error message',
            CheckoutErrorType.API_ERROR,
          ),
        );
    });
  });
});
