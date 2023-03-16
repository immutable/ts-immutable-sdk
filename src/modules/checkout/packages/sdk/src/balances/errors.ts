export class BalanceError extends Error {
    constructor(message: string) {
      super(message);
    }
}

export class ERC20BalanceError extends Error {
  constructor(message: string) {
    super(message);
  }
}
