/* eslint-disable eol-last */
const fs = require('fs');
const path = require('path');

// Paths for input and output files
const inputFilePath = 'docs/typedoc_raw_export.json';
const outputFilePath = 'docs/parsed/{package_name}.json';

let typeToString;

// Add debug logging
const DEBUG = true;
function log(...args) {
  if (DEBUG) console.log(...args);
}

/**
 * Converts a reflection type to a string representation by examining its children properties.
 * @param {Object} type - Reflection type object from TypeDoc.
 * @returns {string} - A string representation of the reflection type.
 */
function reflectionToString(type) {
  if (!type.declaration) {
    return 'unknown';
  }

  // Handle index signatures
  if (type.declaration.indexSignatures && type.declaration.indexSignatures.length > 0) {
    const indexSig = type.declaration.indexSignatures[0];
    const keyType = typeToString(indexSig.parameters[0].type);
    const valueType = typeToString(indexSig.type);
    return `{ [key: ${keyType}]: ${valueType} }`;
  }

  // Handle regular object properties
  if (Array.isArray(type.declaration.children)) {
    const childrenStr = type.declaration.children.map((child) => {
      const childType = child.type ? typeToString(child.type) : 'unknown';
      return `${child.name}: ${childType}`;
    }).join('; ');
    return `{ ${childrenStr} }`;
  }

  return 'unknown';
}

/**
 * Converts a TypeDoc type object into a human-readable string format.
 * Handles various type kinds like intrinsic, literal, reference, union, array, and reflection.
 * @param {Object} type - TypeDoc type object.
 * @returns {string} - Readable string representation of the type.
 */
typeToString = function typeToStringImpl(type) {
  if (!type) return '';
  switch (type.type) {
    case 'intrinsic':
      return type.name;
    case 'literal':
      return JSON.stringify(type.value);
    case 'reference':
      return type.name + (type.typeArguments ? `<${type.typeArguments.map(typeToString).join(', ')}>` : '');
    case 'union':
      return type.types.map(typeToString).join(' | ');
    case 'array':
      return `${typeToString(type.elementType)}[]`;
    case 'reflection':
      return reflectionToString(type);
    default:
      return 'unknown';
  }
};

/**
 * Extracts the return description from the comments of a method or function.
 * @param {Object} comment - Comment object from TypeDoc structure.
 * @returns {string} - Description of the return value if available.
 */
function extractReturnDescription(comment) {
  if (comment && comment.blockTags) {
    const returnsTag = comment.blockTags.find((tag) => tag.tag === '@returns');
    if (returnsTag) {
      return returnsTag.content.map((c) => c.text).join(' ');
    }
  }
  return '';
}

/**
 * Extracts the source file information and line numbers from type source nodes.
 * @param {Array} sources - Array of source objects from TypeDoc.
 * @returns {Array} - Array of formatted source details including file name and position.
 */
function extractSources(sources) {
  if (!sources) return [];
  return sources.map((source) => ({
    fileName: source.fileName,
    line: source.line,
    character: source.character,
  }));
}

/**
 * Extracts detailed information about methods, including name, description, parameters, return types,
 * and whether it's deprecated.
 */
function extractMethodDetails(node) {
  if (node.signatures && node.signatures.length > 0) {
    const signature = node.signatures[0];

    return {
      kind: 'Method',
      name: node.name,
      description: signature.comment ? signature.comment.summary.map((s) => s.text).join(' ') : '',
      parameters: signature.parameters ? signature.parameters.map((param) => ({
        name: param.name,
        type: param.type ? typeToString(param.type) : '',
        description: param.comment ? param.comment.summary.map((s) => s.text).join(' ') : '',
        isOptional: param.flags?.isOptional || false,
      })) : [],
      returnType: typeToString(signature.type),
      returnDescription: extractReturnDescription(signature.comment),
    };
  }
  return null;
}

/**
 * Extracts class details from a TypeDoc node
 */
function extractClassDetails(node) {
  const methods = [];
  const properties = [];
  if (node.children) {
    node.children.forEach((child) => {
      if (child.kind === 1024 && !child.inheritedFrom) { // Property
        if (child.name === 'details') {
          log('Found details property:', JSON.stringify(child, null, 2));
        }
        // Skip Error class properties
        if (['prepareStackTrace', 'stackTraceLimit', 'name', 'message', 'stack', 'cause'].includes(child.name)) {
          return;
        }
        properties.push({
          name: child.name,
          type: child.type ? typeToString(child.type) : '',
          description: child.comment ? child.comment.summary.map((s) => s.text).join(' ') : '',
          isOptional: child.flags?.isOptional || false,
        });
      } else if (child.kind === 2048 && !child.inheritedFrom) { // Method
        const methodDetail = extractMethodDetails(child);
        if (methodDetail) methods.push(methodDetail);
      }
    });
  }

  return {
    kind: 'Class',
    name: node.name,
    description: node.comment ? node.comment.summary.map((s) => s.text).join(' ') : '',
    properties,
    methods,
    sources: extractSources(node.sources),
  };
}

/**
 * Extracts details from a collection of nodes
 */
function extractDetails(node) {
  if (!node) {
    return {
      classes: [],
    };
  }

  const moduleData = {
    classes: [],
  };

  // Handle single node
  if (!Array.isArray(node)) {
    if (node.kind === 128) { // Class
      const classDetails = extractClassDetails(node);
      if (classDetails) moduleData.classes.push(classDetails);
    }
  }

  // Process children recursively
  if (node.children && Array.isArray(node.children)) {
    node.children.forEach((child) => {
      if (child) {
        const childDetails = extractDetails(child);
        moduleData.classes.push(...childDetails.classes);
      }
    });
  }

  // Process exports
  if (node.exports) {
    const exportDetails = extractDetails(node.exports);
    if (exportDetails && exportDetails.classes) {
      moduleData.classes.push(...exportDetails.classes);
    }
  }

  return moduleData;
}

function extractByPackage(nodes) {
  if (!nodes || !Array.isArray(nodes)) {
    return {};
  }

  const packages = {};

  nodes.forEach((node) => {
    if (!node || !node.name) return;

    const packageName = node.name.replace('@imtbl/', '');
    if (!packages[packageName]) {
      packages[packageName] = {
        name: packageName,
        classes: [],
      };
    }

    // Process TypeDoc data
    const details = extractDetails(node);
    if (details && details.classes) {
      packages[packageName].classes.push(...details.classes);
    }
  });

  return packages;
}

async function main() {
  try {
    log('Starting documentation parsing...');
    log('Input file path:', inputFilePath);
    log('Output file path template:', outputFilePath);

    // Create output directory if it doesn't exist
    let outputDir = path.dirname(outputFilePath);
    log('Creating directory if not exists:', outputDir);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Check if input file exists
    log('Checking for input file...');
    if (!fs.existsSync(inputFilePath)) {
      throw new Error(`Input file not found: ${inputFilePath}`);
    }

    // Read and parse TypeDoc JSON
    log('Reading TypeDoc JSON...');
    const rawData = fs.readFileSync(inputFilePath, 'utf-8');
    log(`File read successfully, size: ${rawData.length} bytes`);
    log('Parsing TypeDoc JSON...');
    const typeDocData = JSON.parse(rawData);

    if (!typeDocData || !typeDocData.children) {
      throw new Error('Invalid TypeDoc JSON: missing children property');
    }

    log(`Found children: ${typeDocData.children.length}`);
    log('Processing packages...');
    const sdkModules = extractByPackage(typeDocData.children);

    const moduleCount = Object.keys(sdkModules).length;
    log(`Found ${moduleCount} SDK packages to write:`, Object.keys(sdkModules));

    for (const [moduleName, data] of Object.entries(sdkModules)) {
      const moduleOutputFilePath = outputFilePath.replace('{package_name}', moduleName);
      log('Writing to:', moduleOutputFilePath);

      // Ensure the output directory exists
      outputDir = path.dirname(moduleOutputFilePath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      fs.writeFileSync(
        moduleOutputFilePath,
        JSON.stringify(data, null, 2),
        'utf-8',
      );
    }

    log('Documentation generation complete!');
  } catch (error) {
    console.error('Error processing documentation:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

main();