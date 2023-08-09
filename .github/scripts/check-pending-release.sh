#!/bin/sh

set -e
set -x

VERSION=$(cat package.json | jq -r '.version')
CLONE_DIR="./imx-docs"
INPUT_DESTINATION_HEAD_BRANCH="ts-immutable-sdk-docs-$VERSION"

cd "$CLONE_DIR"
PENDING_RELEASE=$(git ls-remote --heads origin refs/heads/$INPUT_DESTINATION_HEAD_BRANCH)
if [ -n "$PENDING_RELEASE" ]; then
  echo "There is already a pending release for v$VERSION"
  echo "The branch $INPUT_DESTINATION_HEAD_BRANCH already exists on https://github.com/immutable/imx-docs"
  exit 1
fi

