import type { ConsentLevel } from '@imtbl/audience-core';

const DEFAULT_CDN_URL = 'https://cdn.immutable.com/pixel/v1/imtbl.js';

export interface SnippetOptions {
  key: string;
  cdnUrl?: string;
  consent?: ConsentLevel;
}

export function generateSnippet(options: SnippetOptions): string {
  const { key, cdnUrl = DEFAULT_CDN_URL, consent } = options;

  const initArgs: Record<string, string> = { key };
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
