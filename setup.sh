#!/bin/bash

echo "🚀 Setting up Costco Bill Splitter for deployment..."

# Install dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Create a GitHub repository"
echo "2. Push this code: git init && git add . && git commit -m 'Initial commit'"
echo "3. Follow DEPLOYMENT.md guide"
echo ""
echo "Quick Deploy to Render:"
echo "- Go to https://dashboard.render.com"
echo "- Click 'New Blueprint'"
echo "- Connect your GitHub repo"
echo "- Render will auto-configure everything from render.yaml"
