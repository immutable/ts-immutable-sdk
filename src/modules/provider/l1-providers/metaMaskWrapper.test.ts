import { Configuration, Environment, PRODUCTION } from '../../../config';
import { MetaMaskProvider } from './metaMaskWrapper';
import { connect } from './metaMask';
import { connect as buildImxSigner } from '../imx-wallet/imxWallet';

jest.mock('./metaMask');
jest.mock('../imx-wallet/imxWallet');

describe('metaMetaWrapper', () => {
    describe('connect', () => {
        it('should create a metamask provider with a eth signer and imx signer', async () => {
            const config = new Configuration(PRODUCTION);

            const ethSigner = {};
            const imxSigner = {};

            const getSignerMock = jest.fn().mockReturnValue(ethSigner);
            (connect as jest.Mock).mockResolvedValue({
                getSigner: getSignerMock
            });

            (buildImxSigner as jest.Mock).mockResolvedValue(imxSigner);

            const metamaskProvider = await MetaMaskProvider.connect(config);

            expect(connect).toBeCalledTimes(1);
            expect(connect).toBeCalledWith({ "chainID": 1 });
            expect(buildImxSigner).toBeCalledTimes(1);
            expect(buildImxSigner).toBeCalledWith(
                { "getSigner": getSignerMock },
                Environment.PRODUCTION
            );
            expect(getSignerMock).toBeCalledTimes(1);
            expect(metamaskProvider).toBeInstanceOf(MetaMaskProvider)
        });
    });
});
