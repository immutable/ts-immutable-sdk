#!/bin/bash
# Build script for examples with debug output before each build
# This ensures debug info is printed immediately before each example's build

set -e

WORKSPACE_ROOT=$(dirname $(pnpm root -w))

# Find all example package.json files
for pkg in $(find examples -name "package.json" -type f | sort); do
  # Skip node_modules
  if [[ "$pkg" == *"node_modules"* ]]; then
    continue
  fi
  
  # Get the directory containing the package.json
  pkg_dir=$(dirname "$pkg")
  
  # Get the actual package name from package.json
  pkg_name=$(jq -r '.name // "NONE"' "$pkg" 2>/dev/null)
  if [ "$pkg_name" = "NONE" ] || [ -z "$pkg_name" ]; then
    continue
  fi
  
  # Check if this package has a build script
  has_build=$(jq -r '.scripts.build // "NONE"' "$pkg" 2>/dev/null)
  if [ "$has_build" = "NONE" ]; then
    continue
  fi
  
  echo ""
  echo "========================================"
  echo "Building: $pkg_name ($pkg_dir)"
  echo "========================================"
  
  # Debug: Check @imtbl/sdk dependency
  SDK_PATH=$(jq -r '.dependencies["@imtbl/sdk"] // .devDependencies["@imtbl/sdk"] // "NONE"' "$pkg" 2>/dev/null)
  
  if [ "$SDK_PATH" != "NONE" ]; then
    echo "DEBUG: @imtbl/sdk = $SDK_PATH"
    
    if [[ "$SDK_PATH" == file:* ]]; then
      FILE_PATH="${SDK_PATH#file:}"
      if [ -f "$FILE_PATH" ]; then
        echo "DEBUG: Tarball EXISTS at $FILE_PATH"
        ls -la "$FILE_PATH"
      else
        echo "DEBUG: Tarball MISSING at $FILE_PATH"
        echo "DEBUG: Looking for tarballs in workspace root..."
        ls -la "$WORKSPACE_ROOT"/*.tgz 2>/dev/null || echo "No tarballs found"
      fi
    fi
    
    # Check node_modules resolution
    if [ -d "$pkg_dir/node_modules/@imtbl/sdk" ]; then
      echo "DEBUG: node_modules/@imtbl/sdk exists"
      ls -la "$pkg_dir/node_modules/@imtbl/sdk" | head -5
    else
      echo "DEBUG: node_modules/@imtbl/sdk NOT FOUND"
    fi
  fi
  
  echo ""
  echo "Running build for $pkg_name..."
  
  # Run the build using the actual package name
  pnpm --filter "$pkg_name" build
  
  echo "Build completed: $pkg_name"
done

echo ""
echo "========================================"
echo "All examples built successfully!"
echo "========================================"
