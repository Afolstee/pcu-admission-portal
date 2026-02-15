#!/bin/bash
set -e

echo "Installing system dependencies..."
apt-get update
apt-get install -y wkhtmltopdf xvfb fonts-dejavu-core

echo "System dependencies installed successfully"
