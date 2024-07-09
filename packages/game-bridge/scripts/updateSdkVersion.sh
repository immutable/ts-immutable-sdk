#!/bin/bash

# This script is used to update the SDK version in the output files
# It is run as part of the build process and expects the following environment variables to be set:
# - TS_SDK_TAG: The tag of the SDK
# - TS_SDK_HASH: The git hash of the tag

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
# git fetch --tags

# get latest git tag
# TS_SDK_TAG=$(git tag -l --sort=-v:refname | grep -v '\-alpha' | head -n 1)

# get the current tag
# CURRENT_TAG=$(git describe --tags --abbrev=0)

# check the TS_SDK_TAG environment variable is set
if [ -z "$TS_SDK_TAG" ]; then
  echo "TS_SDK_TAG environment variable not found. Exiting..."
  exit 1
fi

# check the TS_SDK_HASH environment variable is set
if [ -z "$TS_SDK_HASH" ]; then
  echo "TS_SDK_HASH environment variable not found. Exiting..."
  exit 1
fi

# use regex to check the current tag is a valid version
if [[ ! $TS_SDK_TAG =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Current tag is not a valid version. Exiting..."
  exit 1
fi

# get commit hash for the current tag
# CURRENT_TAG_COMMIT=$(git rev-list -n 1 $CURRENT_TAG)

# get latest commit hash
# LATEST_COMMIT=$(git rev-parse HEAD)

# update variables in output files
for FILE_PATH in "${FILE_PATHS[@]}"
do
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/__SDK_VERSION__/${TS_SDK_TAG}/g" $FILE_PATH
    sed -i '' "s/__SDK_VERSION_SHA__/${TS_SDK_HASH}/g" $FILE_PATH
  else
    sed -i "s/__SDK_VERSION__/${TS_SDK_TAG}/g" $FILE_PATH
    sed -i "s/__SDK_VERSION_SHA__/${TS_SDK_HASH}/g" $FILE_PATH
  fi
done
