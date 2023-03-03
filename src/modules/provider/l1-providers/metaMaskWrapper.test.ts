import { Configuration, PRODUCTION } from '../../../config';
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

            await MetaMaskProvider.connect(config);

            expect(connect).toBeCalledTimes(1);
            expect(getSignerMock).toBeCalledTimes(1);
        });
    });
});
