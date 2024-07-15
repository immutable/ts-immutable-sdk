#!/bin/bash
nx run $1:d --parallel=5 --verbose
nx watch --all -- node ./build-dependents.js \$NX_PROJECT_NAME \\$1