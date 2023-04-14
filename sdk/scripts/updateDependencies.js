import { getPluginConfiguration } from '@yarnpkg/cli';
import { Configuration, Project } from '@yarnpkg/core';
import semver from 'semver';
import fs from 'fs';
import path from 'path';

async function collectDependencies(workspacePackages) {
  const cwd = process.cwd();
  const pluginConfiguration = getPluginConfiguration();
  const configuration = await Configuration.find(cwd, pluginConfiguration);
  const { project } = await Project.find(configuration, cwd);

  const dependenciesMap = new Map();
  const peerDependenciesMap = new Map();

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

  for (const workspace of project.workspaces) {
    const manifest = workspace.manifest;
    const { dependencies, peerDependencies } = manifest;

    dependencies.forEach((dep) =>
      updateVersion(
        dependenciesMap,
        packageName(dep.scope, dep.name),
        dep.range
      )
    );
    peerDependencies.forEach((dep) =>
      updateVersion(
        peerDependenciesMap,
        packageName(dep.scope, dep.name),
        dep.range
      )
    );
  }

  return {
    dependencies: Object.fromEntries(dependenciesMap.entries()),
    peerDependencies: Object.fromEntries(peerDependenciesMap.entries()),
  };
}

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
  const __dirname = path.resolve();

  const workspacePackages = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, 'workspace-packages.json'), {
      encoding: 'utf8',
    })
  ).map((pkg) => pkg.name);

  const { dependencies, peerDependencies } = await collectDependencies(
    workspacePackages
  );

  const packageJson = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf8')
  );

  packageJson.dependencies = dependencies;
  packageJson.peerDependencies = peerDependencies;

  fs.writeFileSync(
    path.resolve(__dirname, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
};

main();
