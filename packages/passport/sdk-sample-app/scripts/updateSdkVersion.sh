#!/bin/bash

if [[ "$OSTYPE" == "darwin"* ]]; then
find $1 -type f -name "*.js" -exec sed -i '' "s/__SDK_VERSION__/$(git describe --tags --abbrev=0)/g" {} +;
else
find $1 -type f -name "*.js" -exec sed -i "s/__SDK_VERSION__/$(git describe --tags --abbrev=0)/g" {} +;
fi
