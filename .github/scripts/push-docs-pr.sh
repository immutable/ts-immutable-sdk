#!/bin/sh

set -e
set -x

VERSION=$(cat package.json | jq -r '.version')
CLONE_DIR="./imx-docs"
INPUT_SOURCE_FOLDER="./docs/"
INPUT_DESTINATION_REPO="immutable/imx-docs"
INPUT_DESTINATION_HEAD_BRANCH="ts-immutable-sdk-docs-$VERSION"
INPUT_DESTINATION_FOLDER="$CLONE_DIR/api-docs/sdk-references/ts-immutable-sdk/$VERSION"

if [ -z "$INPUT_PULL_REQUEST_REVIEWERS" ]
then
  PULL_REQUEST_REVIEWERS=$INPUT_PULL_REQUEST_REVIEWERS
else
  PULL_REQUEST_REVIEWERS='-r '$INPUT_PULL_REQUEST_REVIEWERS
fi

# echo "CLONE_DIR: $CLONE_DIR"
# echo "Cloning destination git repository"
# # git clone "https://github.com/$INPUT_DESTINATION_REPO.git" "$CLONE_DIR"
# git clone "https://oauth2:$GITHUB_TOKEN@github.com/$INPUT_DESTINATION_REPO.git" "$CLONE_DIR"

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
git checkout -b "$INPUT_DESTINATION_HEAD_BRANCH"

echo "Adding git commit"
git add .
if git status | grep -q "Changes to be committed"
then
  git commit --message "Update from https://github.com/$GITHUB_REPOSITORY/commit/$GITHUB_SHA"
  echo "Pushing git commit"
  git push -u origin HEAD:$INPUT_DESTINATION_HEAD_BRANCH
  echo "Creating a pull request"
  gh pr create -t $INPUT_DESTINATION_HEAD_BRANCH \
               -b $INPUT_DESTINATION_HEAD_BRANCH \
               -B $INPUT_DESTINATION_BASE_BRANCH \
               -H $INPUT_DESTINATION_HEAD_BRANCH \
               -r $GITHUB_ACTOR
else
  echo "No changes detected"
fi
