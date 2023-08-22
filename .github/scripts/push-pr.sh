#!/bin/sh

# echo all the parameters passed to this script
echo "All parameters: $*"
echo "Version: $VERSION"

set -e
set -x

if [ -z "VERSION" ]
then
  echo "VERSION is not set"
  exit 1
fi

if [ -z "GITHUB_ACTOR" ]
then
  echo "GITHUB_ACTOR is not set"
  exit 1
fi

PR_BRANCH="release-changelog-$VERSION"

echo "Foo" >> CHANGELOG.md

echo "Staging changes"
git add $*

echo "Adding git commit"
if git status | grep -q "Changes to be committed"
then
  git commit --message "Update from https://github.com/$GITHUB_REPOSITORY/commit/$GITHUB_SHA"
  echo "Pushing git commit"
  git push -u origin HEAD:$PR_BRANCH

  sleep 10

  echo "Creating a pull request"
  gh pr create --title "Release SDK CHANGELOG $VERSION" \
               --body "Updated CHANGELOG.md from ts-immutable-sdk release workflow" \
               --reviewer "$GITHUB_ACTOR"
else
  echo "No changes detected"
fi
