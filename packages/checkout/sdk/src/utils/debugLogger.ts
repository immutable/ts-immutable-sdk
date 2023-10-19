import { Environment } from '@imtbl/config';
import { CheckoutConfiguration } from '../config';

export const debugLogger = (config: CheckoutConfiguration, debugString: string, seconds: number) => {
  // eslint-disable-next-line no-console
  if (config.environment === Environment.SANDBOX) console.debug(debugString, seconds);
};

export const measureAsyncExecution = async <T> (
  config: CheckoutConfiguration,
  debugString: string,
  promise: Promise<T>,
): Promise<T> => {
  const startTime = new Date().getTime();
  const result = await promise;
  const endTime = new Date().getTime();
  const elapsedTimeInSeconds = (endTime - startTime) / 1000;
  debugLogger(config, debugString, elapsedTimeInSeconds);
  return result;
};
