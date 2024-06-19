/* eslint-disable import/no-cycle */
import { CheckoutConfiguration } from '../config';

export const debugLogger = (config: CheckoutConfiguration, debugString: string, seconds: number) => {
  // eslint-disable-next-line no-console
  if (!config.isProduction) console.info(`🤡🤡🤡 ${debugString}`, seconds);
};

export const measureAsyncExecution = async <T>(
  config: CheckoutConfiguration,
  debugString: string,
  promise: Promise<T>,
): Promise<T> => {
  const startTime = performance.now();
  const result = await promise;
  const endTime = performance.now();
  const elapsedTimeInSeconds = (endTime - startTime) / 1000;
  debugLogger(config, debugString, elapsedTimeInSeconds);
  return result;
};
