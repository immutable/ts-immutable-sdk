export type Hex = `0x${string}`;
export type Hash = `0x${string}`;

export type Signature = {
  r: Hex
  s: Hex
  v: bigint
};
