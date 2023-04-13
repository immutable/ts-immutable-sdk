#!/usr/bin/env node

import { program, Option } from 'commander';
import chalk from 'chalk';
import { json } from 'npm-registry-fetch';
import { inc, compare } from 'semver';

const PACKAGE_NAME = '/@imtbl/core-sdk';
const RELEASE_TYPES = ['alpha', 'beta', 'public'];

// Define the command-line interface using Commander
program
  .description(
    'Bump the next version number based on the latest version on NPM'
  )
  .addOption(
    new Option('-u, --upgrade-type <upgrade_type>', 'upgrade type').choices([
      'patch',
      'minor',
      'major',
      'none',
    ])
  )
  .addOption(
    new Option('-r, --release-type <release_type>', 'release type').choices(
      RELEASE_TYPES
    )
  )
  .parse(process.argv);

const opts = program.opts(); // { upgradeType: 'minor', releaseType: 'alpha' }

// sanity check required options are passed
if (!opts.upgradeType || !opts.releaseType) {
  console.error(
    chalk.red(
      'Missing required options: upgrade-type and release-type options are both required'
    )
  );
  process.exit(1);
}

// Fetch the latest version from the NPM registry
async function getLatestVersions() {
  try {
    const metadata = await json(PACKAGE_NAME);
    const latestVersion = metadata['dist-tags'];

    return latestVersion; // { latest: '1.0.1', beta: '1.0.0-beta.4', alpha: '1.0.2-alpha.5' },
  } catch (error) {
    if (error.statusCode === 404) {
      console.error(
        chalk.red(`Error fetching package: ${PACKAGE_NAME} not found: ${error}`)
      );
    } else {
      console.error(
        chalk.red(`Error fetching latest version for ${PACKAGE_NAME}: ${error}`)
      );
    }

    const defaultVersion = { latest: '0.0.1' };
    console.log(
      chalk.blue(`Using default version ${JSON.stringify(defaultVersion)}`)
    );
    return defaultVersion;
  }
}

function setPreRelease(latestVersion, type) {
  if (!latestVersion[type]) {
    latestVersion[type] = `${latestVersion.latest}.${type}.1`;
    return latestVersion[type];
  }
}

// Determine the next version based on user input and latest version on NPM
async function getNextVersion({ upgradeType, releaseType }) {
  const latestVersion = await getLatestVersions();

  if (!latestVersion) {
    return null;
  }

  let nextVersion;

  console.log('latestVersion', latestVersion);

  // alpha only
  if (releaseType === 'alpha' && upgradeType === 'none') {
    // create pre-release versions if it doesn't exist
    if (!latestVersion.alpha) {
      return setPreRelease(latestVersion, 'alpha');
    }

    nextVersion = inc(latestVersion.alpha, 'pre');
  }
  // alpha and a version (check the next version is at least greater than the latest)
  else if (releaseType === 'alpha' && upgradeType !== 'none') {
    if (!latestVersion.alpha) {
      const tempVersion = setPreRelease(latestVersion, 'alpha');
      nextVersion = inc(tempVersion, upgradeType);
    } else {
      const tempVersion = latestVersion.alpha.split('-')[0];
      if (compare(tempVersion, latestVersion.latest) === 1) {
        nextVersion = `${inc(tempVersion, upgradeType)}.alpha.1`;
      } else {
        nextVersion = `${inc(latestVersion.latest, upgradeType)}.alpha.1`;
      }
    }
  }
  // beta only
  else if (releaseType === 'beta' && upgradeType === 'none') {
    // create pre-release version if it doesn't exist
    if (!latestVersion.beta) {
      return setPreRelease(latestVersion, 'beta');
    }

    nextVersion = inc(latestVersion.beta, 'pre');
  }
  // beta and a version (check the next version is at least greater than the latest)
  else if (releaseType === 'beta' && upgradeType !== 'none') {
    if (!latestVersion.beta) {
      const tempVersion = setPreRelease(latestVersion, 'beta');
      nextVersion = inc(tempVersion, upgradeType);
    } else {
      const tempVersion = latestVersion.beta.split('-')[0];
      if (compare(tempVersion, latestVersion.latest) === 1) {
        nextVersion = `${inc(tempVersion, upgradeType)}.beta.1`;
      } else {
        nextVersion = `${inc(latestVersion.latest, upgradeType)}.beta.1`;
      }
    }
  }
  // public only
  else if (releaseType === 'public') {
    nextVersion = inc(latestVersion.latest, upgradeType);
  }

  return nextVersion;
}

// Print the next version number to the console using Chalk for formatting
getNextVersion(opts).then((nextVersion) => {
  if (nextVersion) {
    console.log(`Next version: ${chalk.green(nextVersion)}`);
  } else {
    console.error(chalk.red('Error getting next version'));
  }
});

export { getLatestVersions, setPreRelease, getNextVersion };
