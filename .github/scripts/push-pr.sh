#!/bin/sh

# echo all the parameters passed to this script
echo "All parameters: $*"
echo "Version: $VERSION"

set -e
set -x

# if [ -z "$INPUT_PULL_REQUEST_REVIEWERS" ]
# then
#   PULL_REQUEST_REVIEWERS=$INPUT_PULL_REQUEST_REVIEWERS
# else
#   PULL_REQUEST_REVIEWERS='-r '$INPUT_PULL_REQUEST_REVIEWERS
# fi

echo "Adding git commit"

echo "Foo" >> CHANGELOG.md

git add $*
git status

# if git status | grep -q "Changes to be committed"
# then
#   git commit --message "Update from https://github.com/$GITHUB_REPOSITORY/commit/$GITHUB_SHA"
#   echo "Pushing git commit"
#   git push -u origin HEAD:$INPUT_DESTINATION_HEAD_BRANCH

#   # Without this sleep, the checks on the imx-docs repo fail
#   # but pass on a re-run from within Netlify
#   echo "Waiting for 1 minute to allow Netlify to catch up"
#   sleep 60

#   echo "Creating a pull request"
#   gh pr create --title "Release SDK reference docs v$VERSION" \
#                --body "Released from ts-immutable-sdk" \
#                --reviewer "$GITHUB_ACTOR"
# else
#   echo "No changes detected"
# fi
