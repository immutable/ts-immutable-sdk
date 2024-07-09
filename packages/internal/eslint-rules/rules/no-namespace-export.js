/* eslint-disable @typescript-eslint/brace-style */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable max-len */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow exporting namespace imports directly or as part of an object',
      category: 'Possible Errors',
      recommended: true,
    },
    schema: [], // No options
    messages: {
      namespaceExport: 'Exporting namespace imports directly or as part of an object may lead to issues with esbuild. Please refactor to avoid this pattern.',
    },
  },
  create(context) {
    const namespaceImports = new Map();
    const variableMappings = new Map();

    return {
      ImportDeclaration(node) {
        node.specifiers.forEach((specifier) => {
          if (specifier.type === 'ImportNamespaceSpecifier') {
            namespaceImports.set(specifier.local.name, true);
          }
        });
      },
      VariableDeclarator(node) {
        if (node.init && node.init.type === 'Identifier' && namespaceImports.has(node.init.name)) {
          variableMappings.set(node.id.name, true);
        }
      },
      ExportNamedDeclaration(node) {
        if (node.declaration && node.declaration.declarations) {
          node.declaration.declarations.forEach((declarator) => {
            // Direct export of namespace import or variable initialized with namespace import
            if (declarator.init && declarator.init.type === 'Identifier' && (namespaceImports.has(declarator.init.name) || variableMappings.has(declarator.init.name))) {
              context.report({
                node: declarator,
                messageId: 'namespaceExport',
              });
            }
            // Export of an object that includes namespace import or variable initialized with namespace import
            else if (declarator.init && declarator.init.type === 'ObjectExpression') {
              declarator.init.properties.forEach((property) => {
                if (property.value && property.value.type === 'Identifier' && (namespaceImports.has(property.value.name) || variableMappings.has(property.value.name))) {
                  context.report({
                    node: property,
                    messageId: 'namespaceExport',
                  });
                }
              });
            }
          });
        }
      },
    };
  },
};
