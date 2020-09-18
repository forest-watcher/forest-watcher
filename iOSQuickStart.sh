#!/bin/bash

# Purge any existing node modules that may be installed.
rm -rf "node_modules"

# Install the node modules.
yarn install

# Download Realm
node node_modules/realm/scripts/download-realm.js ios --sync

# Go to the iOS folder to do iOS things.
cd "ios"

# Purge the pods folder
rm -rf "Pods"

# Install the native modules
pod install

# Go back to the root directory.
cd ".."

echo "~~~~~ It's done! ~~~~~"
