#!/bin/bash
# Build script for examples with debug output before each build
# This ensures debug info is printed immediately before each example's build

set -e

WORKSPACE_ROOT=$(dirname $(pnpm root -w))

echo "=== Pre-build: Checking all @imtbl tarballs ==="
echo "Workspace root: $WORKSPACE_ROOT"
ls -la "$WORKSPACE_ROOT"/imtbl-*.tgz 2>/dev/null || echo "No tarballs found"

echo ""
echo "=== Pre-build: Checking auth-next packages specifically ==="
for tarball in imtbl-auth-next-client-0.0.0.tgz imtbl-auth-next-server-0.0.0.tgz imtbl-auth-0.0.0.tgz; do
  if [ -f "$WORKSPACE_ROOT/$tarball" ]; then
    echo "✓ $tarball EXISTS"
  else
    echo "✗ $tarball MISSING"
  fi
done

echo ""
echo "=== Pre-build: Checking SDK tarball contents ==="
SDK_TARBALL="$WORKSPACE_ROOT/imtbl-sdk-0.0.0.tgz"
if [ -f "$SDK_TARBALL" ]; then
  echo "SDK tarball exists, checking dependencies in package.json:"
  tar -xzf "$SDK_TARBALL" -O package/package.json 2>/dev/null | jq '.dependencies | to_entries[] | select(.key | startswith("@imtbl/auth"))' 2>/dev/null || echo "Failed to extract"
else
  echo "SDK tarball NOT found"
fi

echo ""

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
    SDK_MODULE_PATH="$pkg_dir/node_modules/@imtbl/sdk"
    if [ -d "$SDK_MODULE_PATH" ] || [ -L "$SDK_MODULE_PATH" ]; then
      echo "DEBUG: node_modules/@imtbl/sdk exists"
      ls -la "$SDK_MODULE_PATH" | head -5
      
      # Check if symlink target is valid
      if [ -L "$SDK_MODULE_PATH" ]; then
        RESOLVED_PATH=$(readlink -f "$SDK_MODULE_PATH" 2>/dev/null || echo "UNRESOLVED")
        echo "DEBUG: Symlink resolves to: $RESOLVED_PATH"
        if [ -d "$RESOLVED_PATH" ]; then
          echo "DEBUG: Resolved path EXISTS"
          # Check for key files
          echo "DEBUG: Contents of resolved SDK:"
          ls -la "$RESOLVED_PATH" | head -10
          if [ -f "$RESOLVED_PATH/package.json" ]; then
            echo "DEBUG: SDK package.json main/module fields:"
            jq '{main, module, types, exports: .exports["."]?.default}' "$RESOLVED_PATH/package.json" 2>/dev/null || echo "Failed to parse"
          fi
          if [ -d "$RESOLVED_PATH/dist" ]; then
            echo "DEBUG: SDK dist/ contents:"
            ls -la "$RESOLVED_PATH/dist" | head -10
          else
            echo "DEBUG: WARNING - dist/ folder MISSING!"
          fi
        else
          echo "DEBUG: ERROR - Resolved path does NOT exist!"
        fi
      fi
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
