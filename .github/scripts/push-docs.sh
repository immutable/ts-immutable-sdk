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

# Extract major version only - handle both regular and prelease tags
MAJOR_VERSION=$(echo $VERSION | sed -E 's/^(prelease-)?([0-9]+)\..*/\2/')
# Use v{MAJOR} format for the folder
INPUT_SOURCE_FOLDER="./docs/."
INPUT_DESTINATION_REPO="immutable/docs"
INPUT_DESTINATION_HEAD_BRANCH="ts-immutable-sdk-docs-$VERSION"
INPUT_DESTINATION_FOLDER="$CLONE_DIR/api-docs/sdk-references/ts-immutable-sdk/v$MAJOR_VERSION"

if [ -z "$INPUT_PULL_REQUEST_REVIEWERS" ]
then
  PULL_REQUEST_REVIEWERS=$INPUT_PULL_REQUEST_REVIEWERS
else
  PULL_REQUEST_REVIEWERS='-r '$INPUT_PULL_REQUEST_REVIEWERS
fi

echo "Copying contents to git repo"
# Clear existing vX folder if it exists
if [ -d "$INPUT_DESTINATION_FOLDER" ]; then
  echo "Cleaning existing v$MAJOR_VERSION folder..."
  rm -rf "$INPUT_DESTINATION_FOLDER"/*
fi

mkdir -p $INPUT_DESTINATION_FOLDER

if [ -d "$INPUT_DESTINATION_FOLDER" ]; then
  ### Take action if $DIR exists ###
  cp -r $INPUT_SOURCE_FOLDER $INPUT_DESTINATION_FOLDER
else
  ###  Control will jump here if $DIR does NOT exists ###
  echo "Error: $INPUT_DESTINATION_FOLDER not found. Can not continue."
  exit 1
fi

cd "$CLONE_DIR"

echo "Adding git commit"
git add .
if git status | grep -q "Changes to be committed"
then
  git commit --message "SDK reference docs update from https://github.com/$GITHUB_REPOSITORY/commit/$GITHUB_SHA"
  echo "Pushing git commit"
  git push -u origin DVR-236-fix-ts-sdk-version-pipeline

  # Without this sleep, the checks on the imx-docs repo fail
  # but pass on a re-run from within Netlify
  echo "Waiting for 1 minute to allow Netlify to catch up"
  sleep 60
else
  echo "No changes detected"
fi
