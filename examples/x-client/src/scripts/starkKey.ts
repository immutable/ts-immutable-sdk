import { generateStarkPrivateKey } from '@imtbl/sdk/x';

const starkPrivateKey = async () => {
  const starkKey = generateStarkPrivateKey();

  console.log(`Stark Key: ${starkKey}`);
};

starkPrivateKey()
  .catch(console.error)
  .finally(() => process.exit(0));
