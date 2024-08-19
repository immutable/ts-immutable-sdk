//@ts-check
import { getPluginConfiguration } from '@yarnpkg/cli';
import { Configuration, Project } from '@yarnpkg/core';
import semver from 'semver';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const __dirname = path.resolve();
const SDK_PACKAGE = '@imtbl/sdk';

const workspacePackages = execSync('yarn workspaces list --json')
  .toString()
  .trim()
  .split('\n')
  .map((line) => JSON.parse(line))
  .map((pkg) => pkg.name);

// Update the map with the dependency if it doesn't exist, or if the
// version is greater than the existing version
const updateVersion = (map, dependency, version) => {
  // Don't add any workspace packages as a dependency
  if (workspacePackages.includes(dependency)) return;

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
    const manifest = workspace.manifest;
    const { dependencies, peerDependencies, devDependencies } = manifest;

    // Dev dependencies, only check if they're workspace packages
    // And then process them
    devDependencies.forEach((dep) => {
      const depWorkspace = workspace.project.tryWorkspaceByIdent(dep);
      if (depWorkspace) {
        processWorkspace(depWorkspace);
      }
    });

    // If sdkpackage, exit early
    if (manifest.raw.name === SDK_PACKAGE) return;

    // UpdateVersion for dependencies
    dependencies.forEach((dep) => {
      // check for optional dependencies metadata
      if (manifest.dependenciesMeta?.get(dep.name)?.get(null)?.optional) {
        updateVersion(
          optionalDependenciesMap,
          packageName(dep.scope, dep.name),
          dep.range
        );
      } else {
        updateVersion(
          dependenciesMap,
          packageName(dep.scope, dep.name),
          dep.range
        );
      }

      const depWorkspace = workspace.project.tryWorkspaceByIdent(dep);
      if (depWorkspace) {
        processWorkspace(depWorkspace);
      }
    });

    // Same for peerDependencies, but don't recurse
    peerDependencies.forEach((dep) =>
      updateVersion(
        peerDependenciesMap,
        packageName(dep.scope, dep.name),
        dep.range
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

// Takes a scope and a package name and returns a scoped package name
const packageName = (scope, name) => {
  return scope ? `@${scope}/${name}` : name;
};

// Remove ranges to parse just version
const parseVersion = (version) => {
  return version.replace(/^[^\d]*/, '');
};

// Update package.json with the dependencies and peerDependencies
const main = async () => {
  const cwd = process.cwd();
  const pluginConfiguration = getPluginConfiguration();
  const configuration = await Configuration.find(cwd, pluginConfiguration);
  const { project } = await Project.find(configuration, cwd);

  const targetWorkspace = project.workspaces.find(
    (workspace) => workspace.manifest.raw.name === SDK_PACKAGE
  );

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
