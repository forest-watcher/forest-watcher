#!/bin/bash

# Remove the previous symlink, so we can add a new one.
unlink .env

# Change the .env alias to point to the iOS production file.
ln -s .env.ios.prod .env
