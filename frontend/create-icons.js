const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Create a simple SVG logo for EasyLaw
const createSVG = (size, color = '#0066ff') => {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" fill="${color}" rx="${size/8}" />
    <g fill="white">
      <path d="M${size*0.25} ${size*0.25} L${size*0.75} ${size*0.25} L${size*0.75} ${size*0.35} L${size*0.25} ${size*0.35} Z" />
      <path d="M${size*0.4} ${size*0.45} L${size*0.75} ${size*0.45} L${size*0.75} ${size*0.55} L${size*0.4} ${size*0.55} Z" />
      <path d="M${size*0.25} ${size*0.65} L${size*0.75} ${size*0.65} L${size*0.75} ${size*0.75} L${size*0.25} ${size*0.75} Z" />
      <circle cx="${size*0.3}" cy="${size*0.5}" r="${size*0.1}" />
    </g>
  </svg>`;
};

// Function to convert SVG to PNG and save to public directory
const convertToPNG = async (size) => {
  const svg = createSVG(size);
  const outputPath = path.join(__dirname, 'public', `logo${size}.png`);
  
  try {
    await sharp(Buffer.from(svg))
      .png()
      .toFile(outputPath);
    console.log(`Created PNG icon: ${outputPath}`);
  } catch (error) {
    console.error(`Error creating PNG for size ${size}:`, error);
  }
};

// Function to create favicon.ico (using 32x32 size)
const createFavicon = async () => {
  const svg = createSVG(32);
  const outputPath = path.join(__dirname, 'public', 'favicon.ico');
  
  try {
    await sharp(Buffer.from(svg))
      .png()
      .toFile(path.join(__dirname, 'public', 'favicon.png'));
      
    // In a real environment, you would convert this to .ico format,
    // but for simplicity we'll just rename the PNG to .ico
    fs.copyFileSync(
      path.join(__dirname, 'public', 'favicon.png'),
      outputPath
    );
    // Clean up the temporary PNG
    fs.unlinkSync(path.join(__dirname, 'public', 'favicon.png'));
    
    console.log(`Created favicon: ${outputPath}`);
  } catch (error) {
    console.error('Error creating favicon:', error);
  }
};

// Main function to create all icons
async function createAllIcons() {
  try {
    // Create PNG icons
    await convertToPNG(192);
    await convertToPNG(512);
    
    // Create favicon.ico
    await createFavicon();
    
    console.log('All icons created successfully!');
  } catch (error) {
    console.error('Error creating icons:', error);
  }
}

// Run the main function
createAllIcons();
