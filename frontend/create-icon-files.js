const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Create a simple SVG for the icon
const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#0066ff" rx="64" />
  <path d="M256 134 L363 241 L326 278 L256 208 L186 278 L149 241 Z" fill="white" />
  <path d="M256 373 L149 266 L186 229 L256 299 L326 229 L363 266 Z" fill="white" />
</svg>
`;

// Save the SVG file temporarily
fs.writeFileSync(path.join(__dirname, 'temp.svg'), svgContent);

// Generate logo192.png
sharp(path.join(__dirname, 'temp.svg'))
  .resize(192, 192)
  .png()
  .toFile(path.join(__dirname, 'public', 'logo192.png'))
  .then(() => {
    console.log('Created logo192.png');
  })
  .catch(err => {
    console.error('Error creating logo192.png:', err);
  });

// Generate logo512.png
sharp(path.join(__dirname, 'temp.svg'))
  .resize(512, 512)
  .png()
  .toFile(path.join(__dirname, 'public', 'logo512.png'))
  .then(() => {
    console.log('Created logo512.png');
  })
  .catch(err => {
    console.error('Error creating logo512.png:', err);
  });

// Generate favicon.ico (multiple sizes)
sharp(path.join(__dirname, 'temp.svg'))
  .resize(32, 32)
  .toFormat('ico')
  .toFile(path.join(__dirname, 'public', 'favicon.ico'))
  .then(() => {
    console.log('Created favicon.ico');
  })
  .catch(err => {
    console.error('Error creating favicon.ico:', err);
  });

// Clean up temp file after 1 second to ensure file operations are complete
setTimeout(() => {
  fs.unlinkSync(path.join(__dirname, 'temp.svg'));
  console.log('Cleaned up temporary files');
}, 1000);
