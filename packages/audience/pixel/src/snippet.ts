import type { Environment } from '@imtbl/audience-core';

const DEFAULT_CDN_URL = 'https://cdn.immutable.com/pixel/v1/imtbl.js';

export interface SnippetOptions {
  key: string;
  cdnUrl?: string;
  consent?: 'none' | 'anonymous' | 'full';
  environment?: Environment;
}

export function generateSnippet(options: SnippetOptions): string {
  const {
    key, cdnUrl = DEFAULT_CDN_URL, consent, environment,
  } = options;

  const initArgs: Record<string, string> = { key };
  if (environment && environment !== 'production') {
    initArgs.environment = environment;
  }
  if (consent) {
    initArgs.consent = consent;
  }

  const argsJson = JSON.stringify(initArgs);

  return [
    '<script>',
    '(function(){',
    'var w=window,i="__imtbl";',
    `w[i]=w[i]||[];w[i].push(["init",${argsJson}]);`,
    `var s=document.createElement("script");s.async=1;s.src="${cdnUrl}";`,
    'document.head.appendChild(s);',
    '})();',
    '</script>',
  ].join('');
}
