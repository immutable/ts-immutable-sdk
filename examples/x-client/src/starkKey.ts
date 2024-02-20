/* eslint-disable no-console */
import { x } from '@imtbl/sdk';

const generateStarkPrivateKey = async () => {
  const starkKey = x.generateStarkPrivateKey();

  console.log(`Stark Key: ${starkKey}`);
};

generateStarkPrivateKey()
  .catch(console.error)
  .finally(() => process.exit(0));
