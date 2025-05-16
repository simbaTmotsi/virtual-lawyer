// Basic PNG data for a blue square (base64 encoded)
const fs = require('fs');
const path = require('path');

// Very basic PNG data for a blue square (16x16) - This is a tiny valid PNG in base64
const base64Data = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AkZCg86RGzb1AAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAAvSURBVDjLY2AYBaNgFIyCUYCJgYGBgYkEeVINYCGHwkF9FjARUkDIAGZcEkPNWQAARRsA5XKxvPAAAAAASUVORK5CYII=';

// Function to save the PNG file
const savePNG = (filename, data) => {
  const buffer = Buffer.from(data, 'base64');
  const filePath = path.join(__dirname, 'public', filename);
  fs.writeFileSync(filePath, buffer);
  console.log(`Created ${filename}`);
};

// Save files
savePNG('favicon.ico', base64Data);
savePNG('logo192.png', base64Data);
savePNG('logo512.png', base64Data);

console.log('All icon files created successfully!');
