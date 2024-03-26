#!/bin/sh

set -e
set -x

if [ -z "$VERSION" ]
then
  echo "VERSION is not set"
  exit 1
fi

if [ -z "$CLONE_DIR" ]
then
  echo "CLONE_DIR is not set"
  exit 1
fi

(
  cd $CLONE_DIR;
  FILE=src/components/UnifiedSDKLink/index.tsx
  if [ "$(uname)" == "Darwin" ]; then
      # On Mac OS, sed requires an empty string as an argument to -i to avoid creating a backup file
      sed -i '' -E "s/SDK_VERSION = '.*'/SDK_VERSION = '$VERSION'/g;" $FILE
  else
      sed -i -E "s/SDK_VERSION = '.*'/SDK_VERSION = '$VERSION'/g;" $FILE
  fi

  # Update versions in the browserBundle docs (https://docs.immutable.com/docs/x/sdks/typescript/#browser-bundle)
  FILE=docs/main/sdks/_typescript.mdx
  major=$(echo $VERSION | awk '{ 
    split($0, a, ".");
    print a[1];
  }')
  minor=$(echo $VERSION | awk '{ 
    split($0, a, ".");
    print a[2];
  }')
  patch=$(echo $VERSION | awk '{ 
    split($0, a, ".");
    print a[3];
  }')
  echo "major: $major minor: $minor patch: $patch"

  # On Mac OS, sed requires an empty string as an argument to -i to avoid creating a backup file
  # sed -i '' -E ...
  # vs on Linux:
  # sed -i -E ...

  if [ "$(uname)" == "Darwin" ]; then
      # Be careful modifying the regexs below.
      # They have been adapted from the numbered capture group version on the semver website:
      # https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
      # If you do modify them, please update the regex101 links in the comments to reflect the changes.

      # See https://regex101.com/r/FBpHw4/1 for a breakdown of the regex matches
      sed -i '' -E "s/sdk@(0|[1-9]\d*)\`/sdk@$major\`/g;" $FILE
      
      # See https://regex101.com/r/jZeWrd/1 for a breakdown of the regex matches
      sed -i '' -E "s/sdk@(0|[1-9]\d*)\.(0|[1-9]\d*)\`/sdk@$major.$minor\`/g;" $FILE

      # See https://regex101.com/r/2RWnGP/1 for a breakdown of the regex matches
      sed -i '' -E "s/sdk@(0|[1-9]\d*)\.(0|[1-9]\d*)\.(.*)\`/sdk@$VERSION\`/g;" $FILE

      # See https://regex101.com/r/Gep6h6/1 for a breakdown of the regex matches
      sed -i '' -E "s/e\.g\. (0|[1-9]\d*)\.(0|[1-9]\d*)\.(.*)\)/e.g. $VERSION\)/g;" $FILE
  else
      # Be careful modifying the regexs below.
      # They have been adapted from the numbered capture group version on the semver website:
      # https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
      # If you do modify them, please update the regex101 links in the comments to reflect the changes.

      # See https://regex101.com/r/FBpHw4/1 for a breakdown of the regex matches
      sed -i -E "s/sdk@(0|[1-9]\d*)\`/sdk@$major\`/g;" $FILE
      
      # See https://regex101.com/r/jZeWrd/1 for a breakdown of the regex matches
      sed -i -E "s/sdk@(0|[1-9]\d*)\.(0|[1-9]\d*)\`/sdk@$major.$minor\`/g;" $FILE

      # See https://regex101.com/r/2RWnGP/1 for a breakdown of the regex matches
      sed -i -E "s/sdk@(0|[1-9]\d*)\.(0|[1-9]\d*)\.(.*)\`/sdk@$VERSION\`/g;" $FILE

      # See https://regex101.com/r/Gep6h6/1 for a breakdown of the regex matches
      sed -i -E "s/e\.g\. (0|[1-9]\d*)\.(0|[1-9]\d*)\.(.*)\)/e.g. $VERSION\)/g;" $FILE
  fi
)
