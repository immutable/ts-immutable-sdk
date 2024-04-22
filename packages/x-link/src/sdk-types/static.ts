export class LinkError extends Error {
  constructor(public code: number, message?: string) {
    super(message ?? '');
    Object.setPrototypeOf(this, LinkError.prototype);
  }
}
