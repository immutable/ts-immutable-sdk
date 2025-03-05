#!/bin/sh

set -e
set -x

if [ -z "VERSION" ]
then
  echo "VERSION is not set"
  exit 1
fi

if [ -z "$CLONE_DIR" ]
then
  echo "CLONE_DIR is not set"
  exit 1
fi

# Extract major version only
MAJOR_VERSION=$(echo $VERSION | cut -d. -f1)

echo "Checking if docs folder for v$VERSION / v$MAJOR_VERSION exists"

# Remove any check for existing folders - we want to overwrite

echo "Will generate docs for v$VERSION in the v$MAJOR_VERSION folder"
