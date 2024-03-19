#!/bin/sh

set -e
set -x

if [ -z "$VERSION" ]
then
  echo "VERSION is not set"
  exit 1
fi

if [ -z "$CLONE_DIR" ]
then
  echo "CLONE_DIR is not set"
  exit 1
fi

(
  cd $CLONE_DIR;
  FILE=src/components/UnifiedSDKLink/index.tsx
  if [ "$(uname)" == "Darwin" ]; then
      # On Mac OS, sed requires an empty string as an argument to -i to avoid creating a backup file
      sed -i '' -E "s/SDK_VERSION = '.*'/SDK_VERSION = '$VERSION'/g;" $FILE
  else
      sed -i -E "s/SDK_VERSION = '.*'/SDK_VERSION = '$VERSION'/g;" $FILE
  fi
)
