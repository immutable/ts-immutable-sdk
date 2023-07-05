#!/bin/bash

# Detect the operating system
if [[ "$(uname)" == "Darwin" ]]; then
    # Commands for Mac
    gitleaks protect --staged -v
elif [[ "$(uname)" == "Linux" ]]; then
    # Commands for Linux
  docker run -v $(pwd):/path ghcr.io/gitleaks/gitleaks:latest protect --source="/path" --staged -v
else
    echo "Please install gitleaks manually"
    echo "https://github.com/gitleaks/gitleaks#installing"
    exit 1
fi
