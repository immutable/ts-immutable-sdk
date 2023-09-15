export interface OrderFee {
  amount: FeeToken | FeePercentage;
  recipient: string;
}

export interface FeeToken {
  token: string
}

export interface FeePercentage {
  percentageDecimal: number
}
