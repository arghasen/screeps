#!/bin/bash

output=$(git describe --tags)
DIR=$( cd "$( dirname "$0" )" && pwd )
echo "export const gitVersion = \""$output\"\; > $DIR/version.ts


