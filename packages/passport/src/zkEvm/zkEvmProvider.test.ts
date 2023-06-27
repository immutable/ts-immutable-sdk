import { ZkEvmProviderInput, ZkEvmProvider } from "./zkEvmProvider";
import { JsonRpcProvider } from '@ethersproject/providers';

jest.mock('@ethersproject/providers')
jest.mock('./relayerAdapter')

describe('ZkEvmProvider', () => {
    const sendMock = jest.fn();
    const passthroughMethods = [
        ['eth_getBalance', '0x1'],
        ['eth_getStorageAt', '0x'],
        ['eth_gasPrice', '0x2'],
    ];

    beforeEach(() => {
        jest.resetAllMocks();

        (JsonRpcProvider as unknown as jest.Mock).mockImplementation(() => ({
            send: sendMock
        }));
    });

    it.each(passthroughMethods)("should passthrough %s to the jsonRpcProvider", async (method, returnValue) => {
        sendMock.mockResolvedValueOnce(returnValue);

        const constructorParameters = {
            config: {}
        } as Partial<ZkEvmProviderInput>;

        const provider = new ZkEvmProvider(constructorParameters as ZkEvmProviderInput);

        // NOTE: params are static since we are only testing the call is
        // forwarded with whatever parameters it's called with. Might not match
        // the actual parameters for a specific method.
        const providerParams = {method, params: []};
        const result = await provider.request(providerParams);

        expect(sendMock).toBeCalledTimes(1);
        expect(sendMock).toBeCalledWith(providerParams.method, providerParams.params);
        expect(result).toBe(returnValue);
    })
});
