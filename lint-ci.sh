#!/bin/bash

# if GITHUB_BASE_REF is set, use it. Otherwise, use origin/main
# https://docs.github.com/en/actions/learn-github-actions/variables#default-environment-variables
base=${GITHUB_BASE_REF:-main}

files=$(git diff --name-only --diff-filter=ACMRTUXB origin/$base)

tolint=()
for f in $files; do
  #   match js,.js,.jsx,.ts,.tsx
  if [[ $f =~ \.[tj]sx?$ ]]; then
    tolint+=($f)
  fi
done

[[ -z $tolint ]] || eslint $tolint --no-error-on-unmatched-pattern