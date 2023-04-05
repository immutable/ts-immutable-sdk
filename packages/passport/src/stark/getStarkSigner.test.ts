import { ethers } from 'ethers';
import { getStarkSigner } from './getStarkSigner';

describe('getStarkSigner', () => {
  const privateKey =
    '0x610855bbd7dad4efa59587e97041baa5ec96d483cac2ae78f2c2fb124fc391c1';
  const wallet = new ethers.Wallet(privateKey);

  it('should get StarkSigner', async () => {
    const expectStarkAddress =
      '0x0245ce06e96c7257407ef6e9e59c2b1b30d0def22e7c470a136fbdee16f65798';

    const starkSigner = await getStarkSigner(wallet);

    expect(starkSigner.getAddress()).toEqual(expectStarkAddress);
  });

  it('should get same Stark address with same eth wallet', async () => {
    const ethWallet = ethers.Wallet.createRandom();

    const starkSigner = await getStarkSigner(ethWallet);
    const starkSigner2 = await getStarkSigner(ethWallet);

    expect(starkSigner.getAddress()).toEqual(starkSigner2.getAddress());
  });

  describe('signMessage', () => {
    it('should get signed message', async () => {
      const starkSigner = await getStarkSigner(wallet);
      const encodedMessage =
        'e2919c6f19f93d3b9e40c1eef10660bd12240a1520793a28ef21a7457037dd';
      const expectedSignature =
        '0x03a6d3fcf588f9db669988de05c3e53dd2a6270a646b038adc6909671174ab9c0224a8ca991abbfd6c9790d89c33831a0ce6fdb04e5bc3fef9bb8d50024d70d2';

      const messagehash = await starkSigner.signMessage(encodedMessage);

      expect(messagehash).toEqual(expectedSignature);
    });

    it('should throw error if sign with wrong encoded message', async () => {
      const starkSigner = await getStarkSigner(wallet);
      const encodedMessage = 'wrong message';
      await expect(starkSigner.signMessage(encodedMessage)).rejects.toThrow(
        'Invalid character in wrongmessage'
      );
    });
  });
});
