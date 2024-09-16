export function reduceFraction(
  numerator: number,
  denominator: number
): [number, number] {
  const gcdVal = gcd(numerator, denominator)
  return [numerator / gcdVal, denominator / gcdVal]
}

export function gcd(a: number, b: number): number {
  return b ? gcd(b, a % b) : a
}
