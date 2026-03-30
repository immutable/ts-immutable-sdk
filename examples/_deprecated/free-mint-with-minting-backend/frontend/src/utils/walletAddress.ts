export function shortenAddress(address: string | undefined) {
  if (!address) return '';
  if (address.length < 10) return address;
  return address.substring(0, 6).concat('...').concat(address.substring(address.length - 4))
}