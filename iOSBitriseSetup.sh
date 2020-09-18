#!/bin/bash

# Install the node modules.
yarn install

# Download Realm
node node_modules/realm/scripts/download-realm.js ios --sync

echo "~~~~~ It's done! ~~~~~"