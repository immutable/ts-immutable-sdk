#!/bin/bash

# Check if an argument was provided
if [ -z "$1" ]; then
  echo "No package specified."
  echo ""
  echo "Fetching package list..."
  # This command might change based on your nx setup. It assumes you can list projects like this.
  nx show projects | grep @ | grep -v sample-app | sort | awk '{print NR-1 " " $1}' > /tmp/nx_projects
  cat /tmp/nx_projects
  echo ""
  echo "Enter the number of the project you want to select:"
  read project_number
  project_name=$(awk -v num="$project_number" '$1 == num {print $2}' /tmp/nx_projects)
  echo ""
  echo "You selected: $project_name"
  echo ""
  rm /tmp/nx_projects
  PACKAGE_NAME=$project_name
else
  PACKAGE_NAME=$1
fi

if echo "$PACKAGE_NAME" | grep -q "sample"; then
  echo -e "You are targeting a sample app. Dev mode only supports SDK packages. \nPlease run development script in your sample app instead."
  exit 1
fi

# Run nx commands with the selected or provided package name
echo "Running commands for package: $PACKAGE_NAME"
nx run $PACKAGE_NAME:d --no-cloud
nx watch --all -- node ./build-dependents.js \$NX_PROJECT_NAME $(echo $PACKAGE_NAME)