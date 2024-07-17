/* eslint-disable @typescript-eslint/brace-style */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable max-len */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow exporting namespace imports directly or as part of an object, including direct namespace exports like export * as name from \'module\'',
      category: 'Possible Errors',
      recommended: true,
    },
    schema: [], // No options
    fixable: 'code', // Indicate that this rule supports automatic fixing
    messages: {
      namespaceExport: 'Exporting namespace imports directly or as part of an object may lead to issues with esbuild. Please refactor to avoid this pattern.',
      directNamespaceExport: 'Direct namespace exports like export * as name from \'module\' are disallowed due to potential issues with esbuild.',
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
            if (declarator.init && declarator.init.type === 'Identifier' && (namespaceImports.has(declarator.init.name) || variableMappings.has(declarator.init.name))) {
              context.report({
                node: declarator,
                messageId: 'namespaceExport',
              });
            } else if (declarator.init && declarator.init.type === 'ObjectExpression') {
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
      ExportAllDeclaration(node) {
        if (node.exported) {
          context.report({
            node,
            messageId: 'directNamespaceExport',
            fix(fixer) {
              const importDeclaration = `import * as ${node.exported.name}Import from '${node.source.value}';\n`;
              const exportDeclaration = `export const ${node.exported.name} = { ...${node.exported.name}Import };\n`; // Added newline here
              const rangeToRemove = [node.range[0], node.range[1] + 1]; // +1 to include the semicolon
              return [
                fixer.replaceTextRange(rangeToRemove, `${importDeclaration}${exportDeclaration}\n`), // Added newline here
              ];
            },
          });
        }
      },
    };
  },
};
