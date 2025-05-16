const favicon = require('favicon');
const fs = require('fs');
const path = require('path');

// Create a simple favicon that resembles a gavel or scale of justice
// Using a blue color to match the theme color from manifest.json (#0066ff)
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="#0066ff" rx="8" />
  <path d="M40 20 L24 36 L20 32 L16 36 L24 44 L44 24 Z" fill="white" />
  <rect x="16" y="46" width="32" height="4" fill="white" rx="2" />
</svg>`;

// Save SVG temporarily
fs.writeFileSync(path.join(__dirname, 'temp.svg'), svg);

// Generate favicon and related files
favicon({
  source: path.join(__dirname, 'temp.svg'),
  destination: path.join(__dirname, 'public'),
  configuration: {
    path: '/',
    appName: 'EasyLaw',
    appShortName: 'EasyLaw',
    appDescription: 'Legal Practice Management Platform',
    background: '#ffffff',
    theme_color: '#0066ff',
    appleStatusBarStyle: 'black-translucent',
    icons: {
      android: true,
      appleIcon: true,
      favicons: true
    }
  }
}).then(() => {
  console.log('Favicon generated successfully');
  // Clean up temp file
  fs.unlinkSync(path.join(__dirname, 'temp.svg'));
}).catch(err => {
  console.error('Error generating favicon:', err);
});
