//@ts-check
import semver from 'semver';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const __dirname = path.resolve();
const SDK_PACKAGE = '@imtbl/sdk';

const cwd = process.cwd()
const absoluteRoot = `${cwd.split('ts-immutable-sdk')[0]}ts-immutable-sdk`;

console.log('DEBUGGING')
console.log('CWD:', cwd)
console.log('ABSOLUTE ROOT:', absoluteRoot)

const workspacePackages = execSync('yarn workspaces list --json')
  .toString()
  .trim()
  .split('\n')
  .map((line) => JSON.parse(line))

const workspaceNames = workspacePackages.map((pkg) => pkg.name);

// Update the map with the dependency if it doesn't exist, or if the
// version is greater than the existing version
const updateVersion = (map, dependency, version) => {
  // Don't add any workspace packages as a dependency
  if (workspaceNames.includes(dependency)) return;

  const existingVersion = map.get(dependency);

  if (
    !existingVersion ||
    semver.gt(parseVersion(version), parseVersion(existingVersion))
  ) {
    map.set(dependency, version);
  }
};

// Recusively go through a workspace, and return it's dependencies
// and peer dependencies
const collectDependenciesRecusively = async (sdkWorkspace) => {
  const dependenciesMap = new Map();
  const peerDependenciesMap = new Map();
  const optionalDependenciesMap = new Map();

  // Recursively go through a workspace and update the dependencies
  const processWorkspace = (workspace) => {
    const workspacePackageJSON = path.resolve(
      absoluteRoot, workspace, 'package.json'
    );
    const manifest = JSON.parse(fs.readFileSync(workspacePackageJSON, {encoding: 'utf8'}))
    const { dependencies, peerDependencies, devDependencies, optionalDependencies } = manifest;

    // Dev dependencies, only check if they're workspace packages
    // And then process them
    Object.keys(devDependencies).forEach((dep) => {
      const depWorkspace = workspacePackages.find((pkg) => pkg.name === dep);
      if (depWorkspace) {
        processWorkspace(depWorkspace.location);
      }
    });

    // If sdkpackage, exit early
    if (manifest.name === SDK_PACKAGE) return;

    // UpdateVersion for dependencies
    if (dependencies) Object.keys(dependencies).forEach((dep) => {
        updateVersion(
          dependenciesMap,
          dep,
          dependencies[dep]
        );

        const depWorkspace = workspacePackages.find((pkg) => pkg.name === dep);
        if (depWorkspace) {
          processWorkspace(depWorkspace.location);
        }
    });



      // refactor the above optionalDependencies part
      if (optionalDependencies) Object.keys(optionalDependencies).forEach((dep) =>
        updateVersion(
          optionalDependenciesMap,
          dep,
          optionalDependencies[dep]
        )
      );

    // Same for peerDependencies, but don't recurse
    if (peerDependencies) Object.keys(peerDependencies).forEach((dep) =>
      updateVersion(
        peerDependenciesMap,
        dep,
        peerDependencies[dep]
      )
    );
  };

  // Start the recursive process
  processWorkspace(sdkWorkspace);

  return {
    dependencies: Object.fromEntries(dependenciesMap.entries()),
    peerDependencies: Object.fromEntries(peerDependenciesMap.entries()),
    optionalDependencies: Object.fromEntries(optionalDependenciesMap.entries()),
  };
};

// Remove ranges to parse just version
const parseVersion = (version) => {
  return version.replace(/^[^\d]*/, '');
};

// Update package.json with the dependencies and peerDependencies
const main = async () => {
  const targetWorkspace = workspacePackages.find(
    (pkg) => pkg.name === SDK_PACKAGE
  ).location;

  if (!targetWorkspace) {
    throw Error(`${SDK_PACKAGE} package not found`);
  }

  const { dependencies, peerDependencies, optionalDependencies } =
    await collectDependenciesRecusively(targetWorkspace);

  const packageJson = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf8')
  );

  // manually add @stdlib/number-float64-base-normalize as it's not a
  // dependency of any of the SDK packages
  dependencies['@stdlib/number-float64-base-normalize'] = '0.0.8';

  packageJson.dependencies = dependencies;
  // Only add peerDependencies if there are any
  if (Object.values(peerDependencies).length > 0) {
    packageJson.peerDependencies = peerDependencies;
  }

  // only add optionalDependencies if there are any
  if (Object.values(optionalDependencies).length > 0) {
    packageJson.optionalDependencies = optionalDependencies;
  }

  fs.writeFileSync(
    path.resolve(__dirname, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
};

main();
