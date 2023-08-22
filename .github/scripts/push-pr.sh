#!/bin/sh
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

git checkout -b $PR_BRANCH

# DELETE ME
echo "Foo" >> CHANGELOG.md

echo "Staging changes"
git add CHANGELOG.md

echo "Adding git commit"
if git status | grep -q "Changes to be committed"
then
  git commit --message "Update CHANGELOG $VERSION during release workflow"
  echo "Pushing git commit"
  git push -u origin $PR_BRANCH

  sleep 10

  echo "Creating a pull request"
  gh pr create --title "Release SDK CHANGELOG $VERSION" \
               --body "Updated CHANGELOG.md from ts-immutable-sdk release workflow" \
               --reviewer "$GITHUB_ACTOR" \
               --base "main"
else
  echo "No changes detected"
fi
