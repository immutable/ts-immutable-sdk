import { globalPackageVersion } from '../env/env';
import { SemanticVersion } from './definitions/types';

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
