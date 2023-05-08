#!/bin/bash

files=$(git diff --name-only --diff-filter=ACMRTUXB $(git rev-parse HEAD^1) | grep  -E '(.js$|.ts$|.tsx$)')

[[ -z $files ]] || eslint $files --ext .ts,.jsx,.tsx --max-warnings=0 --no-error-on-unmatched-pattern