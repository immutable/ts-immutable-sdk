export async function connectMetamaskWallet(): Promise<string> {
  try {
    const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
    return accounts[0];
  } catch (e) {
    // eslint-disable-next-line no-alert
    alert(`Something went wrong: ${e}`);
    return '';
  }
}
