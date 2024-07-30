#!/bin/bash

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
  # Update versions in the browserBundle docs (https://docs.immutable.com/docs/x/sdks/typescript/#browser-bundle)
  FILES=(
    docs/main/sdks/zkEVM/typescript/_zkevmtypescript.mdx
    docs/main/x/sdks/typescript/_starkextypescript.mdx
  )
  for FILE in "${FILES[@]}"
  do
    if [ "$(uname)" == "Darwin" ]; then
        # Be careful modifying the regexs below.
        # They have been adapted from the numbered capture group version on the semver website:
        # https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
        # If you do modify them, please update the regex101 links in the comments to reflect the changes.

        # `https://cdn.jsdelivr.net/npm/@imtbl/sdk@1` -> `https://cdn.jsdelivr.net/npm/@imtbl/sdk@2` 
        # See https://regex101.com/r/OyHYf7/1 for a breakdown of the regex matches
        sed -i '' -E "s/@imtbl\/sdk@(0|[1-9][0-9]*)/@imtbl\/sdk@$major/g;" $FILE
        
        # `https://cdn.jsdelivr.net/npm/@imtbl/sdk@1.23` -> `https://cdn.jsdelivr.net/npm/@imtbl/sdk@1.24` 
        # See https://regex101.com/r/RrmTTi/1 for a breakdown of the regex matches
        sed -i '' -E "s/@imtbl\/sdk@(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)/@imtbl\/sdk@$major.$minor/g;" $FILE

        # `https://cdn.jsdelivr.net/npm/@imtbl/sdk@1.23.4` -> `https://cdn.jsdelivr.net/npm/@imtbl/sdk@1.24.5` 
        # See https://regex101.com/r/9QZ9JD/1 for a breakdown of the regex matches
        sed -i '' -E "s/@imtbl\/sdk@(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(.*)/@imtbl\/sdk@$VERSION/g;" $FILE

        # See https://regex101.com/r/C3FDZv/1 for a breakdown of the regex matches
        sed -i '' -E "s/e\.g\. (0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(.*)\)/e.g. $VERSION\)/g;" $FILE
    else
        # Be careful modifying the regexs below.
        # They have been adapted from the numbered capture group version on the semver website:
        # https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
        # If you do modify them, please update the regex101 links in the comments to reflect the changes.

        # `https://cdn.jsdelivr.net/npm/@imtbl/sdk@1` -> `https://cdn.jsdelivr.net/npm/@imtbl/sdk@2` 
        # See https://regex101.com/r/OyHYf7/1 for a breakdown of the regex matches
        sed -i -E "s/@imtbl\/sdk@(0|[1-9][0-9]*)/@imtbl\/sdk@$major/g;" $FILE
        
        # `https://cdn.jsdelivr.net/npm/@imtbl/sdk@1.23` -> `https://cdn.jsdelivr.net/npm/@imtbl/sdk@1.24` 
        # See https://regex101.com/r/RrmTTi/1 for a breakdown of the regex matches
        sed -i -E "s/@imtbl\/sdk@(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)/@imtbl\/sdk@$major.$minor/g;" $FILE

        # `https://cdn.jsdelivr.net/npm/@imtbl/sdk@1.23.4` -> `https://cdn.jsdelivr.net/npm/@imtbl/sdk@1.24.5` 
        # See https://regex101.com/r/9QZ9JD/1 for a breakdown of the regex matches
        sed -i -E "s/@imtbl\/sdk@(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(.*)/@imtbl\/sdk@$VERSION/g;" $FILE

        # See https://regex101.com/r/C3FDZv/1 for a breakdown of the regex matches
        sed -i -E "s/e\.g\. (0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(.*)\)/e.g. $VERSION\)/g;" $FILE
    fi
  done
)
