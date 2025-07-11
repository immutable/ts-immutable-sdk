#!/bin/bash

# Update SDK version placeholders in game-bridge build output
# This script replaces placeholder values with actual SDK version information

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_DIR="$(dirname "$SCRIPT_DIR")"
DIST_DIR="$PACKAGE_DIR/dist"

echo "Updating SDK version placeholders in game-bridge build output..."

# Get the current SDK version from package.json
SDK_VERSION=$(node -p "require('$PACKAGE_DIR/../../package.json').version")

# Get the current git commit hash
GIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

echo "SDK Version: $SDK_VERSION"
echo "Git SHA: $GIT_SHA"

# Update version placeholders in all built files
if [ -d "$DIST_DIR" ]; then
    find "$DIST_DIR" -type f \( -name "*.js" -o -name "*.html" \) -exec sed -i.bak \
        -e "s/__SDK_VERSION__/$SDK_VERSION/g" \
        -e "s/__SDK_VERSION_SHA__/$GIT_SHA/g" \
        {} \;
    
    # Remove backup files
    find "$DIST_DIR" -name "*.bak" -delete
    
    echo "SDK version placeholders updated successfully!"
else
    echo "Warning: dist directory not found. Make sure to build the project first."
    exit 1
fi