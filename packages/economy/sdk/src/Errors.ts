/**
 * Types of SDK Errors
 */
export type ErrorType =
  | 'GET_ITEM_DEFINITION_ERROR'
  | 'GET_ITEMS_ERROR'
  | 'CRAFTING_ERROR'
  | 'UNKNOWN_ERROR';

/** SDK Error Payload */
export type SDKErrorType = {
  type: ErrorType;
  message?: string;
};

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
  return function (
    // eslint-disable-next-line @typescript-eslint/ban-types
    target: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      try {
        return await method.apply(this, args);
      } catch (error) {
        const params = `${args ? JSON.stringify(args, undefined, 2) : ''}`;
        const errorMessage =
          options.message ||
          `Error in method ${target.constructor.name}.${propertyKey}: "${
            (error as Error).message
          }"\n called with: ${params}`;
        throw new SDKError(options.type, errorMessage);
      }
    };

    return descriptor;
  };
}
