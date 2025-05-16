// Create a copy of the logo192.png as logo512.png (same icon, different size)
const fs = require('fs');
const path = require('path');

// Read the logo192.png file
const logo192 = fs.readFileSync(path.join(__dirname, 'public', 'logo192.png'));

// Write it as logo512.png
fs.writeFileSync(path.join(__dirname, 'public', 'logo512.png'), logo192);

console.log('logo512.png created successfully!');
