import { generateSnippet } from './snippet';

describe('generateSnippet', () => {
  it('generates a script tag with the default CDN URL', () => {
    const html = generateSnippet({ key: 'pk_test_123' });

    expect(html).toContain('<script>');
    expect(html).toContain('</script>');
    expect(html).toContain('https://cdn.immutable.com/pixel/v1/imtbl.js');
    expect(html).toContain('"key":"pk_test_123"');
  });

  it('uses a custom CDN URL when provided', () => {
    const html = generateSnippet({
      key: 'pk_test_123',
      cdnUrl: 'https://cdn.dev.immutable.com/pixel/v1/imtbl.js',
    });

    expect(html).toContain('https://cdn.dev.immutable.com/pixel/v1/imtbl.js');
    expect(html).not.toContain('https://cdn.immutable.com/pixel/v1/imtbl.js');
  });

  it('includes consent level when provided', () => {
    const html = generateSnippet({ key: 'pk_test_123', consent: 'anonymous' });

    expect(html).toContain('"consent":"anonymous"');
  });

  it('omits consent from init args when not provided', () => {
    const html = generateSnippet({ key: 'pk_test_123' });

    expect(html).not.toContain('consent');
  });

  it('creates the __imtbl stub array and pushes init command', () => {
    const html = generateSnippet({ key: 'pk_test_123' });

    expect(html).toContain('w[i]=w[i]||[]');
    expect(html).toContain('w[i].push(["init"');
  });

  it('loads the script asynchronously', () => {
    const html = generateSnippet({ key: 'pk_test_123' });

    expect(html).toContain('s.async=1');
    expect(html).toContain('document.head.appendChild(s)');
  });
});
