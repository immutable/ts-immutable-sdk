//@ts-check
import { getPluginConfiguration } from '@yarnpkg/cli';
import { Configuration, Project } from '@yarnpkg/core';
import semver from 'semver';
import fs from 'fs';
import path from 'path';

const __dirname = path.resolve();
const SDK_PACKAGE = '@imtbl/sdk';

const getWorkspacePackages = () => {
  const workspacePackages = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, 'workspace-packages.json'), {
      encoding: 'utf8',
    })
  ).map((pkg) => pkg.name);
  return workspacePackages;
};

// Recusively go through a workspace, and return it's dependencies
// and peer dependencies
const collectDependenciesRecusively = async (workspace) => {
  const workspacePackages = getWorkspacePackages();
  const dependenciesMap = new Map();
  const peerDependenciesMap = new Map();

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
      dependenciesMap.set(dependency, version);
    }
  };

  // Recursively go through a workspace and update the dependencies
  const processWorkspace = (workspace) => {
    const manifest = workspace.manifest;
    const { dependencies, peerDependencies, devDependencies } = manifest;

    // Don't process the root SDK package dependencies
    // Check it's dev dependencies
    if (manifest.raw.name === SDK_PACKAGE) {
      // Dev dependencies, only check if they're project packages
      // This is for the root SDK package.
      devDependencies.forEach((dep) => {
        const depWorkspace = workspace.project.tryWorkspaceByIdent(dep);
        if (depWorkspace) {
          processWorkspace(depWorkspace);
        }
      });

      // Early exit for root workspace. No peer or dev dependencies.
      // These will be filled in from the recusive calls
      return;
    }

    // UpdateVersion for dependencies
    dependencies.forEach((dep) => {
      updateVersion(
        dependenciesMap,
        packageName(dep.scope, dep.name),
        dep.range
      );

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
  processWorkspace(workspace);

  return {
    dependencies: Object.fromEntries(dependenciesMap.entries()),
    peerDependencies: Object.fromEntries(peerDependenciesMap.entries()),
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
  // const workspacePackages = getWorkspacePackages();

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

  const { dependencies, peerDependencies } =
    await collectDependenciesRecusively(targetWorkspace);

  const packageJson = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf8')
  );

  packageJson.dependencies = dependencies;
  // Only add peerDependencies if there are any
  if (Object.values(peerDependencies).length > 0) {
    packageJson.peerDependencies = peerDependencies;
  }

  fs.writeFileSync(
    path.resolve(__dirname, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
};

main();
