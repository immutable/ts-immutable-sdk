import axios from 'axios';
import { availabilityService } from './availability';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('availabilityService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkDexAvailability', () => {
    it('should return true when status is 204', async () => {
      const mockResponse = {
        status: 204,
      };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);
      const response = await availabilityService(true, false).checkDexAvailability();

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(response).toEqual(true);
    });

    it('should return false when status is 403', async () => {
      const mockResponse = {
        status: 403,
      };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);
      const response = await availabilityService(true, false).checkDexAvailability();

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(response).toEqual(false);
    });
  });
});
