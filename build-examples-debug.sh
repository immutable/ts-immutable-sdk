#!/bin/bash
# Build script for examples with debug output before each build
# This ensures debug info is printed immediately before each example's build

set -e

WORKSPACE_ROOT=$(dirname $(pnpm root -w))

echo "=== Environment Info ==="
echo "Node version: $(node --version)"
echo "pnpm version: $(pnpm --version)"
echo "Workspace root: $WORKSPACE_ROOT"
echo ""

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
  echo "SDK tarball exists, checking ALL @imtbl dependencies in package.json:"
  tar -xzf "$SDK_TARBALL" -O package/package.json 2>/dev/null | jq '.dependencies | to_entries[] | select(.key | startswith("@imtbl/"))' 2>/dev/null || echo "Failed to extract"
  
  echo ""
  echo "Checking if each SDK dependency tarball exists:"
  for dep_line in $(tar -xzf "$SDK_TARBALL" -O package/package.json 2>/dev/null | jq -r '.dependencies | to_entries[] | select(.key | startswith("@imtbl/")) | .value' 2>/dev/null); do
    if [[ "$dep_line" == file:* ]]; then
      dep_path="${dep_line#file:}"
      if [ -f "$dep_path" ]; then
        echo "  ✓ EXISTS: $dep_path"
      else
        echo "  ✗ MISSING: $dep_path"
      fi
    fi
  done
else
  echo "SDK tarball NOT found"
fi

echo ""
echo "=== Pre-build: Checking pnpm store for ALL SDK entries ==="
echo "Looking for SDK entries in pnpm store..."
find "$WORKSPACE_ROOT/node_modules/.pnpm" -maxdepth 1 -type d -name "@imtbl+sdk*" 2>/dev/null | while read -r store_entry; do
  echo ""
  echo "Found SDK store entry: $(basename "$store_entry")"
  SDK_IN_STORE="$store_entry/node_modules/@imtbl/sdk"
  if [ -d "$SDK_IN_STORE" ]; then
    echo "  ✓ SDK directory exists"
    if [ -f "$SDK_IN_STORE/package.json" ]; then
      echo "  ✓ package.json exists"
      # Check if exports field is valid
      jq -e '.exports["."]' "$SDK_IN_STORE/package.json" >/dev/null 2>&1 && echo "  ✓ exports field valid" || echo "  ✗ exports field INVALID or MISSING"
    else
      echo "  ✗ package.json MISSING!"
    fi
    if [ -d "$SDK_IN_STORE/dist" ]; then
      echo "  ✓ dist/ folder exists"
      # Check for key entry files
      [ -f "$SDK_IN_STORE/dist/index.js" ] && echo "  ✓ dist/index.js exists" || echo "  ✗ dist/index.js MISSING!"
      [ -f "$SDK_IN_STORE/dist/index.cjs" ] && echo "  ✓ dist/index.cjs exists" || echo "  ✗ dist/index.cjs MISSING!"
    else
      echo "  ✗ dist/ folder MISSING!"
    fi
    # Check SDK's node_modules for dependencies
    if [ -d "$SDK_IN_STORE/node_modules" ]; then
      echo "  SDK has nested node_modules:"
      ls "$SDK_IN_STORE/node_modules" 2>/dev/null | head -5 || echo "    (empty)"
    else
      echo "  SDK has NO nested node_modules (dependencies should be hoisted)"
    fi
  else
    echo "  ✗ SDK directory MISSING in store entry!"
    echo "  Contents of store entry:"
    ls -la "$store_entry" 2>/dev/null | head -5
  fi
done || echo "No SDK entries found in pnpm store"

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
    if [ -L "$SDK_MODULE_PATH" ]; then
      echo "DEBUG: node_modules/@imtbl/sdk is a symlink"
      ls -la "$SDK_MODULE_PATH"
      
      # Check if symlink target exists
      if [ -e "$SDK_MODULE_PATH" ]; then
        echo "DEBUG: Symlink target EXISTS"
      else
        echo "DEBUG: ERROR - Symlink target DOES NOT EXIST (broken symlink)!"
        # Try to see what the raw symlink points to
        RAW_TARGET=$(readlink "$SDK_MODULE_PATH" 2>/dev/null)
        echo "DEBUG: Raw symlink target: $RAW_TARGET"
        # Check if the parent directory exists
        PARENT_DIR=$(dirname "$SDK_MODULE_PATH/$RAW_TARGET")
        if [ -d "$PARENT_DIR" ]; then
          echo "DEBUG: Parent directory contents:"
          ls -la "$PARENT_DIR" | head -10
        else
          echo "DEBUG: Parent directory also doesn't exist: $PARENT_DIR"
        fi
      fi
    elif [ -d "$SDK_MODULE_PATH" ]; then
      echo "DEBUG: node_modules/@imtbl/sdk is a directory (not symlink)"
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
  
  # Try to resolve the SDK using Node.js
  echo "DEBUG: Testing Node.js module resolution..."
  (cd "$pkg_dir" && node -e "console.log('SDK resolves to:', require.resolve('@imtbl/sdk'))" 2>&1) || echo "DEBUG: Node.js could not resolve @imtbl/sdk"
  
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
