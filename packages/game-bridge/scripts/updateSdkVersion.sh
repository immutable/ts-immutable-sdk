#!/bin/bash

set -e
set -x

# The file to update
FILE_PATH="./src/index.ts"

# check file exists
if [ ! -f "$FILE_PATH" ]; then
  echo "File not found. Exiting..."
  exit 1
fi

# pull down latest tags
git fetch --tags

# get latest git tag
LATEST_TAG=$(git describe --tags `git rev-list --tags --max-count=1`)

if [ -z "$LATEST_TAG" ]; then
  echo "No tags found. Exiting..."
  exit 1
fi

# get latest commit hash
LATEST_COMMIT=$(git rev-parse HEAD)

# update variables in file
if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' "s/const sdkVersionTag = '__SDK_VERSION__';/const sdkVersionTag = '${LATEST_TAG}';/g" $FILE_PATH
  sed -i '' "s/const sdkVersionSha = '__SDK_VERSION_SHA__';/const sdkVersionSha = '${LATEST_COMMIT}';/g" $FILE_PATH
else
  sed -i "s/const sdkVersionTag = '__SDK_VERSION__';/const sdkVersionTag = '${LATEST_TAG}';/g" $FILE_PATH
  sed -i "s/const sdkVersionSha = '__SDK_VERSION_SHA__';/const sdkVersionSha = '${LATEST_COMMIT}';/g" $FILE_PATH
fi
