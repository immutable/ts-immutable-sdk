#!/bin/zsh

export NODE_OPTIONS=--max-old-space-size=6144; while true; do git clean -dxfff && yarn && yarn build; done
