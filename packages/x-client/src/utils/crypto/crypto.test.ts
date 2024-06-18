import { getDefaultProvider } from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';
import { signMessage, signRaw, signRegisterEthAddress } from './crypto';
import { generateLegacyStarkPrivateKey } from '../stark/starkCurve';
import { createStarkSigner } from '../stark/starkSigner';

describe('signRaw()', () => {
  test('Correctly signs string', async () => {
    const provider = getDefaultProvider('sepolia', {});
    const signer = new Wallet(
      '5c7b4b5cad9a3fc7b1ba235a49cd74e615488a18b0d6a531739fd1062935104d',
    ).connect(provider);
    const timestamp = '1609462141000';

    const result = await signRaw(timestamp, signer);
    expect(result.toString()).toEqual(
      // eslint-disable-next-line max-len
      '0x31043c2584b8f20d67c4d895f8e385e0d5c0ecb8bfb34e76874da4c27660c13d0cdbdf4bb9fe6473614d400e90a846ee25271f5a102a5c3162e3f84321a2113a00',
    );
  });
});

describe('signMessage()', () => {
  test('Correctly signs message', async () => {
    const provider = getDefaultProvider('sepolia', {});
    const signer = new Wallet(
      '5c7b4b5cad9a3fc7b1ba235a49cd74e615488a18b0d6a531739fd1062935104d',
    ).connect(provider);
    const message = 'Some message to sign ABC';
    const ethSignature = await signRaw(message, signer);
    const ethAddress = await signer.getAddress();

    const result = await signMessage(message, signer);
    expect(result).toEqual({
      message,
      ethSignature,
      ethAddress,
    });
  });
});

describe('signRegisterEthAddress()', () => {
  test('Correctly signs message', async () => {
    const signer = new Wallet('5c7b4b5cad9a3fc7b1ba235a49cd74e615488a18b0d6a531739fd1062935104d');
    const starkKey = await generateLegacyStarkPrivateKey(signer);
    const starkSigner = createStarkSigner(starkKey);
    const starkPublicKey = await createStarkSigner(starkKey).getAddress();
    const ethSignature = await signRegisterEthAddress(starkSigner, signer.publicKey, starkPublicKey);
    expect(ethSignature).toEqual(
      // eslint-disable-next-line max-len
      '0x03fd522589dd46a74cc7d004eea819c111294dbb1a1af9ccdb4d42565730134c05d33b76e5fe733314051420c2c76aea1f6d677394eb7b92369d2a2bab2674ab02603b092fe208e20cd5187a4ded4645e2f55605988c91579b3822bb63629e21',
    );
  });
});
