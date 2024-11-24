import axios from 'axios';
import { TenderlySimulation } from '../types/tenderly';
import { StateObject, submitTenderlySimulations, unwrapStateObjects } from './tenderly';
import { getTenderlyEndpoint } from './utils';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const axiosHeaders = {
  headers: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'Content-Type': 'application/json',
  },
};

function generateAxiosData(
  simulations: Array<TenderlySimulation>,
  stateObjects?: Record<string, Record<string, Record<string, string>>>,
) {
  return {
    jsonrpc: '2.0',
    id: 0,
    method: 'tenderly_simulateBundle',
    params: [
      simulations,
      'latest',
      stateObjects,
    ],
  };
}

describe('Tenderly Utils', () => {
  describe('unwrapStateObjects', () => {
    it('unwraps state objects', () => {
      const contractAddress = '0x123';
      const storageSlot = '0x456';
      const value = '0x789';

      const stateObjects: StateObject[] = [
        {
          contractAddress, stateDiff: { storageSlot, value },
        },
      ];

      const unwrappedStateObjects = unwrapStateObjects(stateObjects);

      expect(unwrappedStateObjects).toEqual({
        [contractAddress]: {
          stateDiff: {
            [storageSlot]: value,
          },
        },
      });
    });

    it('returns empty record if nothing is given', () => {
      const stateObjects: StateObject[] = [];

      const unwrappedStateObjects = unwrapStateObjects(stateObjects);

      expect(unwrappedStateObjects).toEqual({});
    });
  });

  describe('submitTenderlySimulations', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should submit tenderly simulation and return a 1-length array of numbers', async () => {
      const chainId = '123'; // 123 will fallback to dev
      const apiEndpoint = getTenderlyEndpoint(chainId);
      const simulations:TenderlySimulation[] = [
        { from: '0x123', to: '0x456' },
      ];

      const axiosDataParameter = generateAxiosData(simulations, undefined);

      const expectedResponse = {
        id: 0,
        jsonrpc: '2.0',
        result: [
          {
            gas: '0x30ff2',
            gasUsed: '0x2e496',
          },
        ],
      };

      mockedAxios.post.mockResolvedValueOnce({ data: expectedResponse });

      const result = (await submitTenderlySimulations(chainId, simulations)).gas;

      expect(result.length).toEqual(1);
      expect(result[0]).toEqual(expectedResponse.result[0].gasUsed);
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(axios.post).toHaveBeenCalledWith(
        apiEndpoint,
        axiosDataParameter,
        axiosHeaders,
      );
    });

    it('should submit multiple tenderly simulations and return multi-length array of numbers', async () => {
      const chainId = '123'; // 123 will fallback to dev
      const apiEndpoint = getTenderlyEndpoint(chainId);
      const simulations:TenderlySimulation[] = [
        { from: '0x123', to: '0x456' },
        { from: '0x456', to: '0x789' },
      ];

      const axiosDataParameter = generateAxiosData(simulations, undefined);

      const expectedResponse = {
        id: 0,
        jsonrpc: '2.0',
        result: [
          {
            gas: '0x30ff2',
            gasUsed: '0x2e496',
          },
          {
            gas: '0x30ff2',
            gasUsed: '0x2e496',
          },
        ],
      };

      mockedAxios.post.mockResolvedValueOnce({ data: expectedResponse });

      const result = (await submitTenderlySimulations(chainId, simulations)).gas;

      expect(result.length).toEqual(2);
      expect(result[0]).toEqual(expectedResponse.result[0].gasUsed);
      expect(result[1]).toEqual(expectedResponse.result[1].gasUsed);
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(axios.post).toHaveBeenCalledWith(
        apiEndpoint,
        axiosDataParameter,
        axiosHeaders,
      );
    });

    it('Uses the provided state overide objects', async () => {
      const chainId = '123'; // 123 will fallback to dev
      const apiEndpoint = getTenderlyEndpoint(chainId);
      const simulations:TenderlySimulation[] = [
        { from: '0x123', to: '0x456' },
        { from: '0x456', to: '0x789' },
      ];

      const stateObjects: StateObject[] = [
        {
          contractAddress: '0x123', stateDiff: { storageSlot: '0x456', value: '0x789' },
        },
      ];

      const unwrappedStateObjects = unwrapStateObjects(stateObjects);

      const axiosDataParameter = generateAxiosData(simulations, unwrappedStateObjects);

      const expectedResponse = {
        id: 0,
        jsonrpc: '2.0',
        result: [
          {
            gas: '0x30ff2',
            gasUsed: '0x2e496',
          },
          {
            gas: '0x30ff2',
            gasUsed: '0x2e496',
          },
        ],
      };

      mockedAxios.post.mockResolvedValueOnce({ data: expectedResponse });

      const result = (await submitTenderlySimulations(chainId, simulations, stateObjects)).gas;

      expect(result.length).toEqual(2);
      expect(result[0]).toEqual(expectedResponse.result[0].gasUsed);
      expect(result[1]).toEqual(expectedResponse.result[1].gasUsed);
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(axios.post).toHaveBeenCalledWith(
        apiEndpoint,
        axiosDataParameter,
        axiosHeaders,
      );
    });

    it('should throw an error if the response contains an error', async () => {
      const chainId = '123'; // 123 will fallback to dev
      const apiEndpoint = getTenderlyEndpoint(chainId);
      const simulations:TenderlySimulation[] = [
        { from: '0x123', to: '0x456' },
      ];

      const axiosDataParameter = generateAxiosData(simulations, undefined);
      const errorMessage = 'this is an error!!';

      const expectedResponse = {
        id: 0,
        jsonrpc: '2.0',
        error: {
          message: errorMessage,
        },
      };

      mockedAxios.post.mockResolvedValueOnce({ data: expectedResponse });

      await expect(submitTenderlySimulations(chainId, simulations)).rejects.toThrowError(errorMessage);
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(axios.post).toHaveBeenCalledWith(
        apiEndpoint,
        axiosDataParameter,
        axiosHeaders,
      );
    });

    it('should throw an error if the response length does not match the number of simulations', async () => {
      const chainId = '123'; // 123 will fallback to dev
      const apiEndpoint = getTenderlyEndpoint(chainId);
      const simulations:TenderlySimulation[] = [
        { from: '0x123', to: '0x456' },
      ];

      const axiosDataParameter = generateAxiosData(simulations, undefined);

      const expectedResponse = {
        id: 0,
        jsonrpc: '2.0',
        result: [
          {
            gas: '0x30ff2',
            gasUsed: '0x2e496',
          },
          {
            gas: '0x40ff2',
            gasUsed: '0x2e496',
          },
        ],
      };

      mockedAxios.post.mockResolvedValueOnce({ data: expectedResponse });

      await expect(
        submitTenderlySimulations(chainId, simulations),
      ).rejects.toThrowError(
        'Estimating gas failed with mismatched responses',
      );
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(axios.post).toHaveBeenCalledWith(
        apiEndpoint,
        axiosDataParameter,
        axiosHeaders,
      );
    });

    it('should throw an error if the response contains an error for a single simulation', async () => {
      const chainId = '123'; // 123 will fallback to dev
      const apiEndpoint = getTenderlyEndpoint(chainId);
      const simulations:TenderlySimulation[] = [
        { from: '0x123', to: '0x456' },
      ];

      const axiosDataParameter = generateAxiosData(simulations, undefined);
      const errorMessage = 'this is an error!!';

      const expectedResponse = {
        id: 0,
        jsonrpc: '2.0',
        result: [
          {
            error: {
              message: errorMessage,
            },
          },
        ],
      };

      mockedAxios.post.mockResolvedValueOnce({ data: expectedResponse });

      await expect(
        submitTenderlySimulations(chainId, simulations),
      ).rejects.toThrowError(
        `Estimating deposit gas failed with the reason: ${errorMessage}`,
      );
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(axios.post).toHaveBeenCalledWith(
        apiEndpoint,
        axiosDataParameter,
        axiosHeaders,
      );
    });

    it('should throw an error if the response contains an error for one of multiple simulations', async () => {
      const chainId = '123'; // 123 will fallback to dev
      const apiEndpoint = getTenderlyEndpoint(chainId);
      const simulations:TenderlySimulation[] = [
        { from: '0x123', to: '0x456' },
        { from: '0x456', to: '0x789' },
      ];

      const axiosDataParameter = generateAxiosData(simulations, undefined);
      const errorMessage = 'this is an error!!';

      const expectedResponse = {
        id: 0,
        jsonrpc: '2.0',
        result: [
          {
            gas: '0x40ff2',
            gasUsed: '0x2e496',
          },
          {
            error: {
              message: errorMessage,
            },
          },
        ],
      };

      mockedAxios.post.mockResolvedValueOnce({ data: expectedResponse });

      await expect(
        submitTenderlySimulations(chainId, simulations),
      ).rejects.toThrowError(
        `Estimating deposit gas failed with the reason: ${errorMessage}`,
      );
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(axios.post).toHaveBeenCalledWith(
        apiEndpoint,
        axiosDataParameter,
        axiosHeaders,
      );
    });

    it('should throw an error if one of the responses is missing gasUsed', async () => {
      const chainId = '123'; // 123 will fallback to dev
      const apiEndpoint = getTenderlyEndpoint(chainId);
      const simulations:TenderlySimulation[] = [
        { from: '0x123', to: '0x456' },
      ];

      const axiosDataParameter = generateAxiosData(simulations, undefined);

      const expectedResponse = {
        id: 0,
        jsonrpc: '2.0',
        result: [
          {
            gas: '0x30ff2',
          },
        ],
      };

      mockedAxios.post.mockResolvedValueOnce({ data: expectedResponse });

      await expect(
        submitTenderlySimulations(chainId, simulations),
      ).rejects.toThrowError(
        'Estimating gas did not return simulation results',
      );
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(axios.post).toHaveBeenCalledWith(
        apiEndpoint,
        axiosDataParameter,
        axiosHeaders,
      );
    });
  });
});
