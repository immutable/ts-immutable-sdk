/* eslint-disable @typescript-eslint/naming-convention */
const noNamespaceExportRule = require('./rules/no-namespace-export');

module.exports = {
  meta: {
    name: 'eslint-plugin-imtbl',
  },
  rules: {
    'no-namespace-export': noNamespaceExportRule,
  },
};
