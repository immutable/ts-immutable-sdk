#!/bin/bash

# Usage: ./add-unreleased-title.sh <changelog_path>

# Note: this script only runs on correctly on Linux!!

# Exit if any command fails
set -e

# Check parameter is not empty
if [ -z "$1" ]; then
  echo "Changelog path is empty"
  exit 1
fi

# Get the CHANGELOG.md path from the command line arguments
changelog_path=$1

# Introductory text to be added after
intro_text="and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)."

# New title to be added
new_title="## [Unreleased]\n"

# Calculate the line number to insert after
line_number=$(grep -n -m 1 -F "$intro_text" "$changelog_path" | cut -d ':' -f 1)
line_number=$((line_number + 1))

# Combine the intro text and new title
replacement="${intro_text}"$'\n'"${new_title}"

# Use sed to insert the new title right after the introductory text
sed -i.bak "${line_number}a\\
${new_title}" "$changelog_path"

echo "Added [Unreleased] title under introductory text in $changelog_path"
