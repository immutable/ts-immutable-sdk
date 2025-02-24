import { getDefaultProvider, Wallet } from 'ethers';
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
    const ethSignature = await signRegisterEthAddress(starkSigner, await signer.getAddress(), starkPublicKey);
    expect(ethSignature).toEqual(
      // eslint-disable-next-line max-len
      '0x046bdd105dbb9ea7aeb592f0e221e07b37166e4e4d2c50847072e2894b245c0600e0052a8096d633a804c08c6792242909643703f743606c5127d1fa112229aa02603b092fe208e20cd5187a4ded4645e2f55605988c91579b3822bb63629e21',
    );
  });
});
