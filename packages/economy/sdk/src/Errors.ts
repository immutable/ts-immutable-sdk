import { ErrorType, SDKErrorType } from './types';

/**
 * SDK Error Class
 */
export class SDKError extends Error {
  public type: ErrorType;

  constructor(type: ErrorType, message: string) {
    super(message);
    this.type = type;
  }
}

/**
 * Decorator: Adds error handling to a class method
 * @param sdkError
 * @returns
 */
export function withSDKError(options: SDKErrorType) {
  // TODO: fix this eslint error
  // eslint-disable-next-line func-names
  return function (
    // eslint-disable-next-line @typescript-eslint/ban-types
    target: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const method = descriptor.value;

    // TODO: fix this eslint error
    // eslint-disable-next-line func-names, no-param-reassign
    descriptor.value = async function (...args: unknown[]) {
      try {
        // TODO: fix this eslint error
        // eslint-disable-next-line @typescript-eslint/return-await
        return await method.apply(this, args);
      } catch (error) {
        const params = `${args ? JSON.stringify(args, undefined, 2) : ''}`;
        const errorMessage = options.message
          || `Error in method ${target.constructor.name}.${propertyKey}: "${
            (error as Error).message
          }"\n called with: ${params}`;
        throw new SDKError(options.type, errorMessage);
      }
    };

    return descriptor;
  };
}
