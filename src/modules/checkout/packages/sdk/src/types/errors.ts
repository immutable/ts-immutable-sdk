export class UserRejectedRequestError extends Error {
  constructor(message: string){
    super(message);
  }
}