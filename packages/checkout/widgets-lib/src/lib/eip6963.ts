import { createStore, EIP1193Provider } from 'mipd';
import { EIP6963ProviderDetail } from 'mipd/src/types';

export class InjectedProvidersManager {
  private static instance: InjectedProvidersManager;

  private store: any;

  private resetTimeout: any;

  private constructor() {
    this.store = createStore();
    this.store.reset();
  }

  public static getInstance(): InjectedProvidersManager {
    if (!InjectedProvidersManager.instance) {
      InjectedProvidersManager.instance = new InjectedProvidersManager();
    }

    return InjectedProvidersManager.instance;
  }

  public getProviders(): EIP6963ProviderDetail[] {
    return this.store.getProviders();
  }

  public subscribe(callback: any) {
    return this.store.subscribe(callback);
  }

  public clear() {
    this.store.clear();
  }

  public reset() {
    clearTimeout(this.resetTimeout);
    this.resetTimeout = setTimeout(() => {
      this.store.reset();
    }, 200);
  }

  public destroy() {
    this.store.destroy();
  }
}

export const getProviderSlugFromRdns = (rdns: string) => {
  let providerSlug = '';
  switch (rdns) {
    case 'com.immutable.passport':
      providerSlug = 'passport';
      break;
    case 'io.metamask':
      providerSlug = 'metamask';
      break;
    case 'com.coinbase.wallet':
      providerSlug = 'coinbase-wallet';
      break;
    default:
      providerSlug = rdns;
  }

  return providerSlug;
};

export const getPassportProviderDetail = (provider: EIP1193Provider): EIP6963ProviderDetail => ({
  info: {
    // eslint-disable-next-line max-len
    icon: 'data:image/svg+xml,<svg viewBox="0 0 48 48" class="SvgIcon undefined Logo Logo--PassportSymbolOutlined css-1dn9atd" xmlns="http://www.w3.org/2000/svg"><g data-testid="undefined__g"><circle cx="24" cy="24" r="22.5" fill="url(%23paint0_radial_6324_83922)"></circle><circle cx="24" cy="24" r="22.5" fill="url(%23paint1_radial_6324_83922)"></circle><path d="M24 0C10.7452 0 0 10.7452 0 24C0 37.2548 10.7452 48 24 48C37.2548 48 48 37.2548 48 24C48 10.7452 37.2548 0 24 0ZM23.0718 9.16608C23.7383 8.83951 24.4406 8.86188 25.087 9.2287C27.3282 10.5059 29.5627 11.7942 31.786 13.096C32.5018 13.5165 32.8686 14.1897 32.8708 15.0173C32.8843 17.9184 32.8798 20.8171 32.8708 23.7182C32.8708 23.8255 32.8015 23.9821 32.7143 24.0335C31.8531 24.548 30.9808 25.0423 30.0347 25.5881V25.1318C30.0347 22.148 30.0257 19.1664 30.0414 16.1827C30.0436 15.6101 29.8468 15.241 29.339 14.9525C26.7377 13.474 24.1499 11.9687 21.5575 10.4723C21.4457 10.4075 21.3361 10.3381 21.1661 10.2352C21.8326 9.85722 22.4321 9.47698 23.0673 9.16608H23.0718ZM22.5953 38.8451C22.45 38.7713 22.3426 38.7198 22.2375 38.6595C18.8041 36.68 15.3752 34.687 11.9307 32.7232C10.9644 32.173 10.5238 31.3879 10.5349 30.2852C10.5551 27.9411 10.5484 25.597 10.5372 23.2507C10.5327 22.1927 10.9622 21.4255 11.8926 20.8977C14.3105 19.5221 16.715 18.1264 19.1195 16.7284C19.3275 16.6076 19.4796 16.5875 19.6965 16.7172C20.5264 17.216 21.3719 17.6924 22.2554 18.2024C22.0876 18.3031 21.9601 18.3791 21.8304 18.4552C19.2268 19.9582 16.6278 21.4658 14.0175 22.9599C13.5903 23.2037 13.3912 23.5213 13.3957 24.0179C13.4091 25.8654 13.4114 27.713 13.3957 29.5605C13.3912 30.0705 13.5948 30.3948 14.0332 30.6453C16.7866 32.2199 19.5288 33.8125 22.28 35.3916C22.5126 35.5258 22.611 35.6645 22.6065 35.9418C22.5864 36.888 22.5998 37.8363 22.5998 38.8473L22.5953 38.8451ZM22.5953 33.553C22.356 33.4166 22.1838 33.3204 22.0116 33.2198C19.8285 31.9605 17.6477 30.6967 15.4602 29.4464C15.2231 29.3122 15.1359 29.1668 15.1381 28.8917C15.1538 27.4714 15.1471 26.0511 15.1426 24.6308C15.1426 24.4384 15.1717 24.3064 15.3618 24.1991C16.167 23.7495 16.9633 23.2798 17.7618 22.8212C17.8199 22.7877 17.8826 22.7631 17.9877 22.7116V24.3064C17.9877 25.1698 18.0011 26.0354 17.9832 26.8988C17.972 27.3909 18.1622 27.7241 18.5916 27.9657C19.8285 28.6636 21.0498 29.3883 22.2867 30.0839C22.5305 30.2203 22.6043 30.3724 22.5998 30.6408C22.5842 31.5847 22.5931 32.5308 22.5931 33.5508L22.5953 33.553ZM20.0746 14.91C19.6116 14.6371 19.2157 14.6393 18.7527 14.91C16.1581 16.4265 13.5523 17.9228 10.9487 19.4259C10.8391 19.4908 10.7251 19.5489 10.5305 19.6541C10.5998 18.6654 10.3873 17.7327 10.7251 16.8291C10.9085 16.3348 11.2529 15.9635 11.7092 15.6995C13.8811 14.4447 16.0507 13.1877 18.227 11.9396C19.0211 11.4833 19.8308 11.4945 20.6248 11.953C23.0964 13.3756 25.5657 14.8026 28.0306 16.2341C28.1357 16.2945 28.2677 16.4309 28.2677 16.5338C28.2856 17.5493 28.2788 18.567 28.2788 19.6563C27.3819 19.1396 26.5543 18.6609 25.7267 18.1823C23.8412 17.093 21.9512 16.0149 20.0746 14.91ZM37.4427 30.8779C37.3778 31.6764 36.9103 32.2423 36.2192 32.6404C33.5732 34.1614 30.9294 35.6913 28.2856 37.2168C27.4557 37.6954 26.6259 38.1741 25.7938 38.6527C25.6932 38.7109 25.5903 38.7601 25.4539 38.8317C25.4449 38.693 25.4337 38.5924 25.4337 38.4917C25.4337 37.6149 25.4382 36.7404 25.4293 35.8636C25.4293 35.6645 25.4762 35.5437 25.6596 35.4386C29.5157 33.2198 33.3696 30.9942 37.2212 28.7709C37.2794 28.7374 37.3443 28.7105 37.4539 28.6591C37.4539 29.4375 37.4986 30.1622 37.4427 30.8779ZM37.4628 25.3577C37.4561 26.2658 36.9663 26.9033 36.1901 27.3506C33.175 29.0841 30.1622 30.8265 27.1493 32.5666C26.5991 32.8842 26.0466 33.1996 25.4561 33.5396C25.4472 33.3897 25.436 33.2913 25.436 33.1907C25.436 32.3273 25.4449 31.4617 25.4293 30.5983C25.4248 30.3523 25.5075 30.2226 25.72 30.0995C28.46 28.5271 31.1911 26.9368 33.9355 25.3733C34.4231 25.096 34.6378 24.7538 34.6334 24.1812C34.6132 21.1974 34.6244 18.2136 34.6244 15.2298V14.7087C35.3402 15.1404 36.0112 15.496 36.624 15.9299C37.1832 16.3258 37.465 16.9253 37.4673 17.6164C37.4762 20.1976 37.4829 22.7788 37.465 25.3599L37.4628 25.3577Z" fill="%230D0D0D"></path><path fill-rule="evenodd" d="M24 0C10.7452 0 0 10.7452 0 24C0 37.2548 10.7452 48 24 48C37.2548 48 48 37.2548 48 24C48 10.7452 37.2548 0 24 0ZM24 2C11.8497 2 2 11.8497 2 24C2 36.1503 11.8497 46 24 46C36.1503 46 46 36.1503 46 24C46 11.8497 36.1503 2 24 2Z" fill="url(%23paint2_radial_6324_83922)"></path><path fill-rule="evenodd" d="M24 0C10.7452 0 0 10.7452 0 24C0 37.2548 10.7452 48 24 48C37.2548 48 48 37.2548 48 24C48 10.7452 37.2548 0 24 0ZM24 2C11.8497 2 2 11.8497 2 24C2 36.1503 11.8497 46 24 46C36.1503 46 46 36.1503 46 24C46 11.8497 36.1503 2 24 2Z" fill="url(%23paint3_radial_6324_83922)"></path><defs><radialGradient id="paint0_radial_6324_83922" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(13.4442 13.3899) rotate(44.9817) scale(46.7487 99.1435)"><stop stop-color="%23A3EEF8"></stop><stop offset="0.177083" stop-color="%23A4DCF5"></stop><stop offset="0.380208" stop-color="%23A6AEEC"></stop><stop offset="1" stop-color="%23ECBEE1"></stop></radialGradient><radialGradient id="paint1_radial_6324_83922" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(25.9515 43.7068) rotate(84.265) scale(24.2138 46.3215)"><stop stop-color="%23FCF5EE"></stop><stop offset="0.715135" stop-color="%23ECBEE1" stop-opacity="0"></stop></radialGradient><radialGradient id="paint2_radial_6324_83922" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(12.7405 12.6825) rotate(44.9817) scale(49.8653 105.753)"><stop stop-color="%23A3EEF8"></stop><stop offset="0.177083" stop-color="%23A4DCF5"></stop><stop offset="0.380208" stop-color="%23A6AEEC"></stop><stop offset="1" stop-color="%23ECBEE1"></stop></radialGradient><radialGradient id="paint3_radial_6324_83922" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(26.0816 45.0206) rotate(84.265) scale(25.828 49.4096)"><stop stop-color="%23FCF5EE"></stop><stop offset="0.715135" stop-color="%23ECBEE1" stop-opacity="0"></stop></radialGradient></defs></g></svg>',
    name: 'Immutable Passport',
    rdns: 'com.immutable.passport',
    uuid: '00000000-0000-0000-0000-000000000000',
  },
  provider,
});
