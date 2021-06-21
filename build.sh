#!/bin/sh

npm run build

rsync -r --delete dest/prod ../code-dot-org/apps/node_modules/@code-dot-org/piskel/dest/
