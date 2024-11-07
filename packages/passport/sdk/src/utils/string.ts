import { getBytes, stripZerosLeft, toUtf8String } from "ethers";

export const hexToString = (hex: string) => {
  if (!hex) return hex;

  try {
    const stripped = stripZerosLeft(getBytes(hex));
    return toUtf8String(stripped);
  } catch (e) {
    return hex;
  }
};
