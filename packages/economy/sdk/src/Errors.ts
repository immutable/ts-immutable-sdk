import { ErrorType, SDKErrorType } from './types';

/**
 * SDK Error Class
 */
export class SDKError extends Error {
  public type: ErrorType;

  public cause: unknown;

  constructor(type: ErrorType, message: string, cause: unknown) {
    console.log({ cause });
    super(message);
    this.type = type;
    this.cause = cause;
  }
}

/**
 * Decorator: Adds error handling to a class method
 * @param sdkError
 * @returns
 */
export function withSDKError(options: SDKErrorType) {
  // eslint-disable-next-line func-names
  return function (
    // eslint-disable-next-line @typescript-eslint/ban-types
    target: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const method = descriptor.value;

    // eslint-disable-next-line func-names, no-param-reassign
    descriptor.value = async function (...args: unknown[]) {
      try {
        // eslint-disable-next-line @typescript-eslint/return-await
        return await method.apply(this, args);
      } catch (error) {
        const params = `${args ? JSON.stringify(args, undefined, 2) : ''}`;
        const defaultErrorMessage = `
          Error in method ${target.constructor.name}.${propertyKey}: "${(error as Error).message}"\n 
          called with: ${params}`;

        const errorMessage = options.message || defaultErrorMessage;
        throw new SDKError(options.type, errorMessage, (error as Error).cause);
      }
    };

    return descriptor;
  };
}
