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

# Do not remove the trailing period!!!
# https://dev.to/ackshaey/macos-vs-linux-the-cp-command-will-trip-you-up-2p00
INPUT_SOURCE_FOLDER="./docs/."
INPUT_DESTINATION_REPO="immutable/docs"
INPUT_DESTINATION_HEAD_BRANCH="ts-immutable-sdk-docs-$VERSION"
INPUT_DESTINATION_FOLDER="$CLONE_DIR/api-docs/sdk-references/ts-immutable-sdk/$VERSION"

if [ -z "$INPUT_PULL_REQUEST_REVIEWERS" ]
then
  PULL_REQUEST_REVIEWERS=$INPUT_PULL_REQUEST_REVIEWERS
else
  PULL_REQUEST_REVIEWERS='-r '$INPUT_PULL_REQUEST_REVIEWERS
fi

echo "Copying contents to git repo"
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
  git push -u origin main

  # Without this sleep, the checks on the imx-docs repo fail
  # but pass on a re-run from within Netlify
  echo "Waiting for 1 minute to allow Netlify to catch up"
  sleep 60
else
  echo "No changes detected"
fi
