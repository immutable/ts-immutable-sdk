#!/bin/bash

set -e
set -x

# Directory where docs repo is cloned (should match push-docs.sh)
DOCS_REPO_DIR=${CLONE_DIR:-"./imx-docs"}

# Root of the example apps
EXAMPLES_ROOT="./examples"

# Products to process
PRODUCTS=("passport" "checkout" "orderbook" "contracts")

# Process tutorials for each product
for PRODUCT in "${PRODUCTS[@]}"; do
  echo "Processing tutorials for $PRODUCT..."
  
  # Create _tutorials directory in docs repo if it doesn't exist
  TUTORIALS_DIR="$DOCS_REPO_DIR/docs/main/build/typescript/usage-guides/$PRODUCT/_tutorials"
  mkdir -p "$TUTORIALS_DIR"
  
  # Get all example apps for this product
  SAMPLE_APPS=$(ls -d $EXAMPLES_ROOT/$PRODUCT/*/ 2>/dev/null | xargs -n1 basename)
  
  for APP in $SAMPLE_APPS; do
    TUTORIAL_FILE="$EXAMPLES_ROOT/$PRODUCT/$APP/tutorial.md"
    
    # Check if tutorial.md exists
    if [ -f "$TUTORIAL_FILE" ]; then
      echo "Processing tutorial for $APP..."
      
      # Copy the content to a new file named after the app
      cp "$TUTORIAL_FILE" "$TUTORIALS_DIR/${APP}.md"
      echo "Copied $TUTORIAL_FILE to $TUTORIALS_DIR/${APP}.md"
    else
      echo "No tutorial.md found for $APP, skipping..."
    fi
  done
  
  # Also copy the generated JSON file
  JSON_FILE="$EXAMPLES_ROOT/_parsed/${PRODUCT}-examples.json"
  if [ -f "$JSON_FILE" ]; then
    # Create directory for JSON file if it doesn't exist
    JSON_DIR="$DOCS_REPO_DIR/docs/main/build/typescript/usage-guides/$PRODUCT"
    mkdir -p "$JSON_DIR"
    
    # Copy JSON file
    cp "$JSON_FILE" "$JSON_DIR/${PRODUCT}-examples.json"
    echo "Copied $JSON_FILE to $JSON_DIR/${PRODUCT}-examples.json"
  else
    echo "Warning: No ${PRODUCT}-examples.json found at $JSON_FILE"
  fi
done

echo "Tutorial processing complete." 