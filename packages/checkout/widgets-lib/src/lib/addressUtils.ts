export function abbreviateAddress(address: string) {
  if (!address) return '';
  return address.substring(0, 6).concat('...').concat(address.substring(address.length - 4));
}
