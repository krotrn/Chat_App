#!/bin/bash

# Force install dependencies
npm install --force

# Prisma code generation (optional)
npx prisma generate

# Run the build
npm run build
