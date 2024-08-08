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

# check a docs folder with the same version exists in $CLONE_DIR
if [ -d "$CLONE_DIR/api-docs/sdk-references/ts-immutable-sdk/$VERSION" ]; then
  echo "There is already a docs folder for v$VERSION. Please create a separate PR to update the SDK reference docs for v$VERSION."
  exit 1
fi

# check the version contains `alpha` string
if echo "$VERSION" | grep -q "alpha"; then
  echo "Skipping docs generation for alpha version"
  exit 1
fi
