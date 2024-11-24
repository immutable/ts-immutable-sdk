#!/bin/sh

set -e
set -x

if [ -z "VERSION" ]
then
  echo "VERSION is not set"
  exit 1
fi

# this command will send a GET request to the docs site, the -s option silences the output,
# the -o option redirects the output to /dev/null, and the -w option formats the output to only return the HTTP status code
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://docs.immutable.com/sdk-references/ts-immutable-sdk/$VERSION/)

if [ "$HTTP_STATUS" -ne 200 ]; then
  echo "SDK reference docs for v$VERSION are not deployed. Check Netlify for the build status. https://app.netlify.com/sites/imx-docs-prod/deploys"
  exit 1
fi

echo "SDK reference docs for v$VERSION are deployed."
