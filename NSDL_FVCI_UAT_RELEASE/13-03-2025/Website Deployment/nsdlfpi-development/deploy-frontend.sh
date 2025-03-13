#!/bin/bash

# Load user profile to ensure access to NVM and other environment variables
source $HOME/.bashrc
source $HOME/.profile
source $HOME/.nvm/nvm.sh

# Check if NVM is installed, if not, install it
if ! command -v nvm &> /dev/null; then
    echo "⚠️ NVM not found. Installing..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.4/install.sh | bash
    source $HOME/.bashrc
    source $HOME/.nvm/nvm.sh
fi

# Ensure Node.js LTS is installed via NVM
if ! command -v node &> /dev/null; then
    echo "⚠️ Node.js not found. Installing latest LTS version..."
    nvm install --lts
fi

# Use the latest installed LTS version
nvm use --lts

# Navigate to the frontend project directory
cd /home/ubuntu/nsdl-frontend || exit

# Fetch latest changes from remote
git fetch origin Production

# Get the latest and previous commit hashes
LATEST_COMMIT=$(git rev-parse origin/Production)
CURRENT_COMMIT=$(git rev-parse HEAD)

# Compare commits to check for new changes
if [ "$LATEST_COMMIT" != "$CURRENT_COMMIT" ]; then
    echo "🚀 New commit detected. Deploying..."

    # Pull the latest changes
    git pull origin Production

    # Ensure Angular CLI is installed
    if ! command -v ng &> /dev/null; then
        echo "⚠️ Angular CLI not found. Installing..."
        npm install -g @angular/cli
    fi

    # Install dependencies
    npm install

    # Build the Angular project
    ng build --configuration=production

    # Check if the build was successful
    if [ $? -eq 0 ]; then
        echo "✅ Build successful. Deploying..."

        # Remove existing frontend files
        rm -rf /var/www/nsdl-angular-app/*

        # Copy new build to the deployment directory
        cp -r dist/nsdl-fpi/* /var/www/nsdl-angular-app/

        echo "🚀 Frontend deployment completed."
    else
        echo "❌ Build failed. Check errors and try again."
    fi
else
    echo "✅ No new changes. Skipping deployment."
fi
