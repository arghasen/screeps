#!/bin/bash

output=$(git describe --tags)
DIR=$( cd "$( dirname "$0" )" && pwd )
echo "export const git_version=\""$output\" > $DIR/version.ts


