#!/bin/bash

# ChatKit Vercel Deployment Script
# This script helps you deploy your ChatKit application to Vercel

set -e  # Exit on error

echo "🚀 ChatKit Vercel Deployment Helper"
echo "===================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed."
    echo ""
    echo "Installing Vercel CLI..."
    npm install -g vercel
    echo "✅ Vercel CLI installed!"
    echo ""
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found."
    echo ""
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo ""
    echo "📝 Please edit the .env file and add your credentials:"
    echo "   - OPENAI_API_KEY=sk-proj-..."
    echo "   - VITE_CHATKIT_WORKFLOW_ID=wf_..."
    echo ""
    read -p "Press Enter when you're done editing .env..."
fi

# Source .env file
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Validate environment variables
echo "🔍 Validating environment variables..."
MISSING_VARS=0

if [ -z "$OPENAI_API_KEY" ] || [ "$OPENAI_API_KEY" = "sk-proj-..." ]; then
    echo "❌ OPENAI_API_KEY is not set or is using placeholder value"
    MISSING_VARS=1
fi

if [ -z "$VITE_CHATKIT_WORKFLOW_ID" ] || [ "$VITE_CHATKIT_WORKFLOW_ID" = "wf_..." ]; then
    echo "❌ VITE_CHATKIT_WORKFLOW_ID is not set or is using placeholder value"
    MISSING_VARS=1
fi

if [ $MISSING_VARS -eq 1 ]; then
    echo ""
    echo "Please update your .env file with valid credentials and try again."
    exit 1
fi

echo "✅ Environment variables validated!"
echo ""

# Ask user if they want to deploy to production
echo "📦 Deployment options:"
echo "  1) Deploy to development (preview)"
echo "  2) Deploy to production"
echo ""
read -p "Enter your choice (1 or 2): " DEPLOY_CHOICE

echo ""
echo "🔑 The following environment variables will be set in Vercel:"
echo "   - OPENAI_API_KEY: ${OPENAI_API_KEY:0:10}..."
echo "   - VITE_CHATKIT_WORKFLOW_ID: $VITE_CHATKIT_WORKFLOW_ID"
echo ""

if [ "$DEPLOY_CHOICE" = "2" ]; then
    echo "🚀 Deploying to PRODUCTION..."
    echo ""
    vercel --prod \
        -e OPENAI_API_KEY="$OPENAI_API_KEY" \
        -e VITE_CHATKIT_WORKFLOW_ID="$VITE_CHATKIT_WORKFLOW_ID"
else
    echo "🚀 Deploying to DEVELOPMENT (preview)..."
    echo ""
    vercel \
        -e OPENAI_API_KEY="$OPENAI_API_KEY" \
        -e VITE_CHATKIT_WORKFLOW_ID="$VITE_CHATKIT_WORKFLOW_ID"
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Copy your deployment URL from above"
echo "  2. Add the widget to Squarespace (see SQUARESPACE_GUIDE.md)"
echo "  3. Test the chat widget on your site"
echo ""
echo "Need help? Check out README.md for troubleshooting tips."
