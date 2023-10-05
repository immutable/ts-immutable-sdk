#!/bin/sh

git ls-remote --tags origin > /tmp/imtbl-sdk-remote-tags.txt
git tag | while read x
do
  if ! grep -q "$x" /tmp/imtbl-sdk-remote-tags.txt
  then
    git tag -d "$x"
  fi
done
