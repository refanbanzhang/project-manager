#!/bin/bash

echo "🚀 Installing dependencies for Project Manager..."

echo "📦 Installing root dependencies..."
npm install

echo "📦 Installing backend dependencies..."
cd backend && npm install && cd ..

echo "📦 Installing frontend dependencies..."
cd frontend && npm install && cd ..

echo "✅ All dependencies installed successfully!"
echo "Run 'npm run dev' to start the development server."
