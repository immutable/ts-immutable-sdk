import { collectThirdPartyIds } from './thirdPartyIds';

function clearCookies() {
  document.cookie.split(';').forEach((c) => {
    const name = c.split('=')[0].trim();
    if (name) document.cookie = `${name}=; max-age=0; path=/`;
  });
}

beforeEach(clearCookies);

describe('collectThirdPartyIds', () => {
  it('returns an empty object when no third-party cookies are present', () => {
    expect(collectThirdPartyIds()).toEqual({});
  });

  it('reads ga_client_id from the _ga cookie', () => {
    document.cookie = '_ga=GA1.2.123456789.987654321; path=/';
    expect(collectThirdPartyIds()).toEqual({ ga_client_id: 'GA1.2.123456789.987654321' });
  });

  it('reads fb_click_id from the _fbc cookie', () => {
    document.cookie = '_fbc=fb.1.1234567890.abcdef; path=/';
    expect(collectThirdPartyIds()).toEqual({ fb_click_id: 'fb.1.1234567890.abcdef' });
  });

  it('reads fb_browser_id from the _fbp cookie', () => {
    document.cookie = '_fbp=fb.1.1234567890.ghijkl; path=/';
    expect(collectThirdPartyIds()).toEqual({ fb_browser_id: 'fb.1.1234567890.ghijkl' });
  });

  it('reads all three cookies together when present', () => {
    document.cookie = '_ga=GA1.2.111.222; path=/';
    document.cookie = '_fbc=fb.1.333.444; path=/';
    document.cookie = '_fbp=fb.1.555.666; path=/';

    expect(collectThirdPartyIds()).toEqual({
      ga_client_id: 'GA1.2.111.222',
      fb_click_id: 'fb.1.333.444',
      fb_browser_id: 'fb.1.555.666',
    });
  });
});
