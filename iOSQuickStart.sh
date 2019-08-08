#!/bin/bash

# Purge any existing node modules that may be installed.
rm -rf "node_modules"

# Install the node modules.
yarn install

# Go to the iOS folder to do iOS things.
cd "ios"

# Purge the pods folder
rm -rf "Pods"

# Install the native modules
pod install

# Go back to the root directory.
cd ".."

echo "~~~~~ It's done! ~~~~~"
