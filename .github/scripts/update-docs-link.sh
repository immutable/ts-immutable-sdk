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

FILE=_typescript.mdx

pushd $CLONE_DIR
if [[ "$OSTYPE" == "darwin"* ]]; then
    # On Mac OS, sed requires an empty string as an argument to -i to avoid creating a backup file
    sed -i '' -E "s/[0-9]\\.[0-9]\\.[0-9](.* class=\"ts-immutable-sdk-ref-link\")/$VERSION\1/g;" $FILE
else
    sed -i -E "s/[0-9]\\.[0-9]\\.[0-9](.* class=\"ts-immutable-sdk-ref-link\")/$VERSION\1/g;" $FILE
fi
popd
