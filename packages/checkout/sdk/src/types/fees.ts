export interface OrderFee {
  amount: FeeToken | FeePercent;
  recipient: string;
}

export interface FeeToken {
  token: string
}

export interface FeePercent {
  percent: number
}
