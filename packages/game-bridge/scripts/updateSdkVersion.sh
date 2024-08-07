#!/bin/bash

# This script is used to update the SDK version in the output files in main branch
# It is run as part of the build process and expects the following environment variables to be set:
# - TS_SDK_TAG: The tag of the SDK
# - TS_SDK_HASH: The git hash of the tag

set -e
# Enable debug mode (set -x) only in CI environment
if [ -n "$CI" ]; then
  set -x
fi

# The files to update
FILE_PATHS=("./dist/unity/index.html" "./dist/unreal/index.js")

# check files exist
for FILE_PATH in "${FILE_PATHS[@]}"
do
  if [ ! -f "$FILE_PATH" ]; then
    echo "File $FILE_PATH not found. Exiting..."
    exit 1
  fi
done

# if running locally, set the environment variables
if [ -z "$CI" ]; then
  export TS_SDK_TAG=$(git describe --tags --abbrev=0)
  export TS_SDK_HASH=$(git rev-parse $TS_SDK_TAG)

  # get the hash of the current HEAD
  export TS_SDK_LOCAL_HEAD_HASH=$(git rev-parse HEAD)

  # check the hash matches the has from the tag
  if [ "$TS_SDK_HASH" != "$TS_SDK_LOCAL_HEAD_HASH" ]; then
    # warn the user that the current tag does not match the current HEAD
    # but continue with the update
    echo "[!!!WARNING!!!]"
    echo "[!!!WARNING!!!]"
    echo "[!!!WARNING!!!] The current tag does not match the current HEAD. Do not commit this game brige to the Game SDK repos..."
    echo "[!!!WARNING!!!]"
    echo "[!!!WARNING!!!]"
  fi
else
  echo "Update SDK version in CI / non-locally" 
  # Get the current branch name
  current_branch=${GITHUB_REF#refs/heads/}

  # Check if the current branch is "main"
  if [ "$current_branch" == "main" ]; then
      echo "You are on the main branch. Continuing..."
  else
      echo "You are not on the main branch. Exiting..."
      exit 1
  fi

  # Check if TS_SDK_TAG environment variable is set
  if [ -z "$TS_SDK_TAG" ]; then
      echo "TS_SDK_TAG environment variable not found. Exiting..."
      exit 1
  fi

  # Check if TS_SDK_HASH environment variable is set
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
fi

echo "Updating __SDK_VERSION__ to $TS_SDK_TAG"
echo "Updating __SDK_VERSION_SHA__ to $TS_SDK_HASH"

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
