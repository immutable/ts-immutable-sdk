#!/bin/bash

# Script to manually prepare dependencies for the SDK, examples, or tests

# It will go through each workspace in the provided environment and prepare the dependencies
# The dependencies are prepared by having the script check its dependencies and devDependencies
# and replace the package version with a local tarball version of the package

# The script will then pack the workspace if it is a dependency of the SDK package, or the sdk package itself

# This is much faster than going through all workspaces individually and running `pnpm add @imtbl/*` for each
# workspace package and then package each workspace separately. This script will do it all in one go in parallel.

# Get environment to prepare from the first argument
envToPrepare=$1

# Check if an argument was provided
if [ -z "$envToPrepare" ]; then
  echo "Please provide the environment to prepare"
  echo "Environments: sdk | examples | tests"
  echo "Example: ./prepare-deps.sh sdk"
  exit 1
fi

# Set the initial workspace filter to the SDK package and its workspace dependencies recursively
workspaceFilter="@imtbl/sdk..."

# Change the workspace filter based on the provided environment
if [ "$envToPrepare" = "examples" ]; then
  workspaceFilter="@examples/**"
elif [ "$envToPrepare" = "tests" ]; then
  workspaceFilter="@tests/**"
fi

echo "Preparing $envToPrepare..."

prepare_deps() {
  # Get all dependencies and devDependencies that start with @imtbl/ and combine them into a single list
  deps=$(pnpm list --json | jq -r ".[0].dependencies | keys[] | select(startswith(\"@imtbl/\"))")
  devDeps=$(pnpm list --json | jq -r ".[0].devDependencies | keys[] | select(startswith(\"@imtbl/\"))")
  combinedDeps=$(echo -e "$deps\n$devDeps")

  # Loop through each dependency and devDependency and replace the package version with a local tarball version matching what the output name will be
  while read -r dep; do
    # Skip if the dependency is empty
    if [ -z "$dep" ]; then
      continue
    fi
    
    # Get the packed dependency filename. For example, @imtbl/sdk -> imtbl-sdk-0.0.0.tgz
    packedDepFilename=$(echo "$dep" | sed "s/@imtbl\///" | sed "s/\//-/" | sed "s/^/imtbl-/" | sed "s/$/-0.0.0.tgz/")
    # Check if the dependency is a dependency or a devDependency and replace the version with a local tarball version
    if echo "$deps" | grep -q "$dep"; then
      pnpm exec jq ".dependencies[\"$dep\"] = \"file:$(dirname $(pnpm root -w))/$packedDepFilename\"" package.json > package.tmp.json
    elif echo "$devDeps" | grep -q "$dep"; then
      pnpm exec jq ".devDependencies[\"$dep\"] = \"file:$(dirname $(pnpm root -w))/$packedDepFilename\"" package.json > package.tmp.json
    fi
    mv package.tmp.json package.json
  done <<< "$combinedDeps"

  # Pack the workspace if it is a dependency of the SDK package or is the SDK package itself
  if [ "$1" = "sdk" ]; then
    pnpm pack --pack-destination "$(dirname "$(pnpm root -w)")"
  fi
}

#  Run the below recursively for each workspace in the workspace filter set above
pnpm --parallel --filter $workspaceFilter exec bash -c "$(declare -f prepare_deps); prepare_deps $envToPrepare"