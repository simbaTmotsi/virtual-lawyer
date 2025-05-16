// Create simple placeholder icon files
const fs = require('fs');
const path = require('path');

function createPlaceholderFile(filePath, content) {
  try {
    // Remove the file if it exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Removed existing file: ${filePath}`);
    }
    
    // Write new content to the file
    fs.writeFileSync(filePath, content);
    console.log(`Created file: ${filePath}`);
    
    // Verify the file was created correctly
    const stats = fs.statSync(filePath);
    console.log(`File size: ${stats.size} bytes`);
  } catch (error) {
    console.error(`Error creating file ${filePath}:`, error);
  }
}

// Main function
function createIcons() {
  const publicDir = path.join(__dirname, 'public');
  
  // Simple PNG header (1x1 pixel) for favicon.ico
  const pngData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00, 
    0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0x60, 0x60, 0x60, 0x00, 
    0x00, 0x00, 0x04, 0x00, 0x01, 0xF6, 0x9A, 0x55, 0x76, 0x00, 0x00, 0x00, 
    0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
  ]);
  
  // Create each icon
  createPlaceholderFile(path.join(publicDir, 'favicon.ico'), pngData);
  createPlaceholderFile(path.join(publicDir, 'logo192.png'), pngData);
  createPlaceholderFile(path.join(publicDir, 'logo512.png'), pngData);
  
  console.log('All icon files created');
}

// Run the function
createIcons();
