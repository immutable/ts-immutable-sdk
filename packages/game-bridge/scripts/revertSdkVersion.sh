#!/bin/bash

set -e
set -x

# The file to update
FILE_PATH="./src/index.ts"

# check file exists
if [ ! -f "$FILE_PATH" ]; then
  echo "File not found. Exiting..."
  exit 1
fi

# update variables in file
if [[ "$OSTYPE" == "darwin"* ]]; then
  # sed -i '' "s/const sdkVersionTag = '__SDK_VERSION__';/const sdkVersionTag = '${LATEST_TAG}';/g" $FILE_PATH
  # sed -i '' "s/const sdkVersionSha = '__SDK_VERSION_SHA__';/const sdkVersionSha = '${LATEST_COMMIT}';/g" $FILE_PATH
  sed -i '' 's/const sdkVersionTag = '\''[^'\'']*'\'';/const sdkVersionTag = '\''__SDK_VERSION__'\'';/g' $FILE_PATH
  sed -i '' 's/const sdkVersionSha = '\''[^'\'']*'\'';/const sdkVersionSha = '\''__SDK_VERSION_SHA__'\'';/g' $FILE_PATH
else
  # sed -i "s/const sdkVersionTag = '__SDK_VERSION__';/const sdkVersionTag = '${LATEST_TAG}';/g" $FILE_PATH
  # sed -i "s/const sdkVersionSha = '__SDK_VERSION_SHA__';/const sdkVersionSha = '${LATEST_COMMIT}';/g" $FILE_PATH
  sed -i 's/const sdkVersionTag = '\''[^'\'']*'\'';/const sdkVersionTag = '\''__SDK_VERSION__'\'';/g' $FILE_PATH
  sed -i 's/const sdkVersionSha = '\''[^'\'']*'\'';/const sdkVersionSha = '\''__SDK_VERSION_SHA__'\'';/g' $FILE_PATH
fi
