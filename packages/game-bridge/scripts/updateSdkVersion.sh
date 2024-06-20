#!/bin/bash

set -e
set -x

# The files to update
FILE_PATHS=("./dist/unity/index.html" "./dist/unreal/index.js" "./dist/unreal/index.js.map")

# check files exist
for FILE_PATH in "${FILE_PATHS[@]}"
do
  if [ ! -f "$FILE_PATH" ]; then
    echo "File $FILE_PATH not found. Exiting..."
    exit 1
  fi
done

# pull down latest tags
git fetch --tags

# get latest git tag
LATEST_TAG=$(git tag -l --sort=-v:refname | grep -v '\-alpha' | head -n 1)

if [ -z "$LATEST_TAG" ]; then
  echo "No tags found. Exiting..."
  exit 1
fi

# get latest commit hash
LATEST_COMMIT=$(git rev-parse HEAD)

# update variables in output files
for FILE_PATH in "${FILE_PATHS[@]}"
do
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/__SDK_VERSION__/${LATEST_TAG}/g" $FILE_PATH
    sed -i '' "s/__SDK_VERSION_SHA__/${LATEST_COMMIT}/g" $FILE_PATH
  else
    sed -i "s/__SDK_VERSION__/${LATEST_TAG}/g" $FILE_PATH
    sed -i "s/__SDK_VERSION_SHA__/${LATEST_COMMIT}/g" $FILE_PATH
  fi
done
