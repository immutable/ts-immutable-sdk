#!/bin/bash

set -e
set -x

# The file to update
FILE_PATH="./src/config/config.ts"

# check file exists
if [ ! -f "$FILE_PATH" ]; then
  echo "File not found. Exiting..."
  exit 1
fi

# update variables in file
if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' 's/const sdkVersion = '\''[^'\'']*'\'';/const sdkVersion = '\''__SDK_VERSION__'\'';/g' $FILE_PATH
else
  sed -i 's/const sdkVersion = '\''[^'\'']*'\'';/const sdkVersion = '\''__SDK_VERSION__'\'';/g' $FILE_PATH
fi
