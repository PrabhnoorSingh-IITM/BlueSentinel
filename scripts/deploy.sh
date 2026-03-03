#!/bin/bash
echo "🚀 Starting BlueSentinel V2.4 Deployment..."

# Check if firebase CLI is available
if ! command -v firebase &> /dev/null; then
    echo "❌ Error: 'firebase' command not found."
    echo "💡 Please install the Firebase CLI by running:"
    echo "   npm install -g firebase-tools"
    echo "   (You may need to use 'sudo npm install -g firebase-tools' if that fails)"
    exit 1
fi

# Deploy
echo "📦 Deploying 'public' folder to bluesentinel1..."
firebase deploy --only hosting

echo "✅ Done! Deployment command finished."
echo "🌍 Site: https://bluesentinel1.web.app"
echo "👉 CRITICAL: Please Hard Refresh your browser to see BlueSentinel V2.4:"
echo "   - Mac: Cmd + Shift + R"
echo "   - Windows/Linux: Ctrl + F5"
