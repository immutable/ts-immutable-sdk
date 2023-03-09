import { Configuration, Environment, PRODUCTION } from 'config';
import { MetaMaskIMXProvider } from './metaMaskWrapper';
import { connect } from './metaMask';
import { connect as buildImxSigner, disconnect as disconnectImxSigner } from '../imx-wallet/imxWallet';

jest.mock('./metaMask');
jest.mock('../imx-wallet/imxWallet');

describe('metaMetaWrapper', () => {
    describe('connect', () => {
        it('should create a metamask imx provider with a eth signer and imx signer', async () => {
            const config = new Configuration(PRODUCTION);

            const ethSigner = {};
            const imxSigner = {};

            const getSignerMock = jest.fn().mockReturnValue(ethSigner);
            (connect as jest.Mock).mockResolvedValue({
                getSigner: getSignerMock
            });

            (buildImxSigner as jest.Mock).mockResolvedValue(imxSigner);

            const metamaskIMXProvider = await MetaMaskIMXProvider.connect(config);

            expect(connect).toBeCalledTimes(1);
            expect(connect).toBeCalledWith({ "chainID": 1 });
            expect(buildImxSigner).toBeCalledTimes(1);
            expect(buildImxSigner).toBeCalledWith(
                { "getSigner": getSignerMock },
                Environment.PRODUCTION
            );
            expect(getSignerMock).toBeCalledTimes(1);
            expect(metamaskIMXProvider).toBeInstanceOf(MetaMaskIMXProvider)
        });

        it('should call disconnect with the imx signer', async () => {
            disconnectImxSigner as jest.Mock
            await MetaMaskIMXProvider.disconnect();
            expect(disconnectImxSigner).toBeCalledTimes(1);
        });

        it('should call sign message on imx signer and return a string', async () => {
            const getSignerMock = jest.fn().mockReturnValue({});
            (connect as jest.Mock).mockResolvedValue({
                getSigner: getSignerMock
            });
            const signMessageMock = jest.fn().mockReturnValue("Signed message");
            (buildImxSigner as jest.Mock).mockResolvedValue({
                signMessage: signMessageMock
            });

            await MetaMaskIMXProvider.connect(new Configuration(PRODUCTION));
            const signedMessage = await MetaMaskIMXProvider.signMessage("Message to sign");

            expect(signMessageMock).toBeCalledTimes(1);
            expect(signMessageMock).toBeCalledWith("Message to sign");
            expect(signedMessage).toEqual("Signed message");
        });
    });
});
