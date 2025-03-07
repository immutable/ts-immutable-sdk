import semver from 'semver';
import { globalPackageVersion } from '../env';
import { SemanticVersion } from './definitions/types';
import { CheckoutWidgetsVersionConfig } from '../types';

/**
 * Validates and builds a version string based on the given SemanticVersion object.
 * If the version is undefined or has an invalid major version, it returns the default checkout version.
 * If the version is all zeros, it also returns the default checkout version.
 * Otherwise, it constructs a validated version string based on the major, minor, patch, and build numbers.
 */
export function validateAndBuildVersion(
  version: SemanticVersion | undefined,
): string {
  const defaultPackageVersion = globalPackageVersion();

  if (version === undefined || version.major === undefined) return defaultPackageVersion;

  if (!Number.isInteger(version.major) || version.major < 0) return defaultPackageVersion;
  if (version.minor !== undefined && version.minor < 0) return defaultPackageVersion;
  if (version.patch !== undefined && version.patch < 0) return defaultPackageVersion;

  if (version.major === 0 && version.minor === undefined) return defaultPackageVersion;
  if (version.major === 0 && version.minor === 0 && version.patch === undefined) return defaultPackageVersion;
  if (version.major === 0 && version.minor === undefined && version.patch === undefined) return defaultPackageVersion;
  if (version.major === 0 && version.minor === 0 && version.patch === 0) return defaultPackageVersion;

  let validatedVersion: string = version.major.toString();

  if (version.minor === undefined) return validatedVersion;

  if (Number.isInteger(version.minor)) {
    validatedVersion += `.${version.minor.toString()}`;
  }

  if (version.patch === undefined) return validatedVersion;

  if (Number.isInteger(version.patch)) {
    validatedVersion += `.${version.patch.toString()}`;
  }

  if (version.prerelease === undefined || version.prerelease !== 'alpha') return validatedVersion;

  if (version.prerelease === 'alpha') {
    validatedVersion += `-${version.prerelease}`;
  }

  if (version.build === undefined) return validatedVersion;

  if (Number.isInteger(version.build) && version.build >= 0) {
    validatedVersion += `.${version.build.toString()}`;
  }

  return validatedVersion;
}

/**
 * Fetches the latest version of the package from the JSDelivr version.json file.
 * Falls back to 'latest' if an error occurs or the response is invalid.
 * @returns {Promise<string>} A promise resolving to the latest version string or 'latest'.
 */
export async function getLatestVersion(): Promise<string> {
  const cacheBustingUrl = `https://cdn.jsdelivr.net/npm/@imtbl/sdk@latest/dist/version.json?t=${Date.now()}`;
  const fallbackVersion = 'latest';

  try {
    const response = await fetch(cacheBustingUrl);

    if (!response.ok) {
      return fallbackVersion;
    }

    const data = await response.json();
    const version = data.version?.trim();

    if (version) {
      return version;
    }

    return fallbackVersion;
  } catch (error) {
    return fallbackVersion;
  }
}

/**
 * Returns the latest compatible version based on the provided checkout version config.
 * If no compatible version markers are provided, it returns 'latest'.
 */
function latestCompatibleVersion(
  validVersion: string,
  compatibleVersionMarkers: string[],
) {
  for (const comptabileVersionMarker of compatibleVersionMarkers) {
    if (semver.valid(comptabileVersionMarker) && semver.lte(validVersion, comptabileVersionMarker)) {
      return comptabileVersionMarker;
    }
  }
  return 'latest';
}

/**
 * Determines the version of the widgets to use based on the provided validated build version and checkout version config.
 * If a version is provided in the widget init parameters, it uses that version.
 * If the build version is an alpha, it uses that version.
 * Defaults to 'latest' if no compatible version markers are found.
 */
export async function determineWidgetsVersion(
  validatedBuildVersion: string,
  initVersionProvided: boolean,
  versionConfig?: CheckoutWidgetsVersionConfig,
) {
  // If version is provided in widget init params, use that
  if (initVersionProvided) {
    return validatedBuildVersion;
  }

  // If validated build version is an alpha, use that
  if (validatedBuildVersion.includes('alpha')) {
    return validatedBuildVersion;
  }

  // If there's version config is invalid, default to use current build version
  if (!versionConfig || !Array.isArray(versionConfig.compatibleVersionMarkers)) {
    return validatedBuildVersion;
  }

  const compatibleVersion = latestCompatibleVersion(
    validatedBuildVersion,
    versionConfig.compatibleVersionMarkers,
  );

  // If `latest` is returned, query CDN for the actual latest version
  if (compatibleVersion === 'latest') {
    return await getLatestVersion();
  }

  return compatibleVersion;
}
