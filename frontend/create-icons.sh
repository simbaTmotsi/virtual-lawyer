#!/bin/bash
# Script to create simple favicon and logo files

# Navigate to the public directory
cd /Users/simbatmotsi/Documents/Projects/virtual-lawyer/frontend/public

# Create a simple 1x1 pixel blue PNG file (base64 encoded)
BLUE_PIXEL="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

# Function to create files from base64 data
create_file_from_base64() {
  echo "$1" | base64 -d > "$2"
  echo "Created $2"
}

# Create the icon files
create_file_from_base64 "$BLUE_PIXEL" "favicon.ico"
create_file_from_base64 "$BLUE_PIXEL" "logo192.png"
create_file_from_base64 "$BLUE_PIXEL" "logo512.png"

echo "Icon files created successfully!"
