#!/bin/bash

# Usage: ./update-changelog-title.sh <version> <changelog_path>

# Exit if any command fails
set -e
# Print each command as it executes
set -x

# Check first parameter is not empty
if [ -z "$1" ]; then
  echo "Version is empty"
  exit 1
fi

# Check second parameter is not empty
if [ -z "$2" ]; then
  echo "Changelog path is empty"
  exit 1
fi

# Get the version number from the command line arguments
version=$1
# Get the CHANGELOG.md path from the command line arguments
changelog_path=$2
# Get the date in YYYY-MM-DD format
date=$(date +%Y-%m-%d)

# Replace the [Unreleased] title in file referenced by changelog_path with the version number and date
sed -i.bak "s/\[Unreleased\]/[${version}] - ${date}/g" "$changelog_path"
