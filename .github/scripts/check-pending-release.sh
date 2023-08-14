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

INPUT_DESTINATION_HEAD_BRANCH="ts-immutable-sdk-docs-$VERSION"

cd "$CLONE_DIR"
PENDING_RELEASE=$(git ls-remote --heads origin refs/heads/$INPUT_DESTINATION_HEAD_BRANCH)
if [ -n "$PENDING_RELEASE" ]; then
  echo "There is already a pending release for v$VERSION"
  echo "The branch $INPUT_DESTINATION_HEAD_BRANCH already exists on https://github.com/immutable/imx-docs"
  exit 1
fi

