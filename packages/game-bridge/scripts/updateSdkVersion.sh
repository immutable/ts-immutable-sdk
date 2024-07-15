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
# example valid version: 1.2.3
# or: 1.2.3-alpha 
# or: 1.2.3-alpha.1
if [[ ! $TS_SDK_TAG =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.]+)?$ ]]; then
  echo "Current tag is not a valid version. Exiting..."
  exit 1
fi

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
