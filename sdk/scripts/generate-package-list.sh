#!/bin/sh

set -e

yarn workspaces list --json | sed -e ' $ ! s/}/},/' | sed '$ s/$/]/' | sed '1 s/^/[/' > workspace-packages.json