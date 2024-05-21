import axios from 'axios';
import { TenderlySimulation } from 'types/tenderly';
import { submitTenderlySimulations } from './tenderly';
import { getTenderlyEndpoint } from './utils';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

/*
      tenderlyAPI,
      {
        jsonrpc: '2.0',
        id: 0,
        method: 'tenderly_estimateGasBundle',
        params: [
          simulations,
          'latest',
          state_objects,
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
*/

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
    method: 'tenderly_estimateGasBundle',
    params: [
      simulations,
      'latest',
      stateObjects,
    ],
  };
}

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

    const result = await submitTenderlySimulations(chainId, simulations);

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

    const result = await submitTenderlySimulations(chainId, simulations);

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
