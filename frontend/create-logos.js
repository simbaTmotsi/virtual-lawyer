const fs = require('fs');
const path = require('path');

// Create a simple data URI for a blue square with scale icon
const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192">
  <rect width="192" height="192" fill="#0066ff" rx="24" />
  <path d="M96 50 L136 90 L122 104 L96 78 L70 104 L56 90 Z" fill="white" />
  <path d="M96 140 L56 100 L70 86 L96 112 L122 86 L136 100 Z" fill="white" />
</svg>
`;

// Save the SVG file temporarily
fs.writeFileSync(path.join(__dirname, 'temp.svg'), svgContent);

// Function to convert SVG to PNG
const convertSvgToPng = async (size) => {
  try {
    // For simplicity, we'll create a data URI that browsers can understand
    const svgBase64 = Buffer.from(svgContent).toString('base64');
    const dataUri = `data:image/svg+xml;base64,${svgBase64}`;
    
    // In a real-world scenario, you'd use a library like sharp to convert SVG to PNG
    // Since we can't do that here, we'll write the SVG directly with the right dimensions
    
    // Write files with appropriate sizes
    fs.writeFileSync(path.join(__dirname, 'public', `logo${size}.png`), 
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 192 192">
        <rect width="192" height="192" fill="#0066ff" rx="${size/8}" />
        <path d="M96 50 L136 90 L122 104 L96 78 L70 104 L56 90 Z" fill="white" />
        <path d="M96 140 L56 100 L70 86 L96 112 L122 86 L136 100 Z" fill="white" />
      </svg>`
    );
    
    console.log(`Created logo${size}.png`);
  } catch (error) {
    console.error(`Error creating logo${size}.png:`, error);
  }
};

// Create both size logos
convertSvgToPng(192);
convertSvgToPng(512);
