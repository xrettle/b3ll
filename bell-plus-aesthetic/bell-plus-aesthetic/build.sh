#!/bin/bash

# Set Node.js version
export NODE_VERSION=20

# Install dependencies
npm install

# Build the Next.js app
cd bell-plus-aesthetic
npx next build
npx next export -o ../out

# Done
echo "Build completed successfully!"
