// Simple base64 encoded PNG data for a blue square
const fs = require('fs');
const path = require('path');

// Base64 encoded PNG data (blue square)
const pngData = 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAA3NCSVQICAjb4U/gAAAACXBIWXMAAADsAAAA7AF5KHG9AAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAGxQTFRF////AAD/MzMzKioqJCQ3ICA3HBwxHx8fHBwuGhouGBgxFxctFxcrFhYuFRUpFBQsFBQrExMpERElEREjEBAkEBAgDw8fDg4iDg4hDQ0dDAwfDAweDAwcCwsaCgocCQkXCAgZCAgWBgYVBQUVAAAAIJ1wagAAAB90Uk5TAAEDAwUIDxMWFxocJSktPkpRV1dYYm16i5ufq8LQ6/K8TaRYAAAAuklEQVQ4y63TSQ6DMBAEUBlCIEyZQyAQwP3/GxZtIsuAl1nU1mvJLRn+aKhZavG4NO+N7Qvn2X7hYpg+UB+MALmUjCVJv8tHPpQkF4CIJAI15+SxgKgFfN4BTj3QAhCr04GgACuBAJSS9YEDXgMxJerADvgGOHxX2YAwQPALcOVxQFLA8QswdQ1QFXCXCsyDAgRQKnBNHgB65QOQKdA5dkCRXoEnVQ/0N0D1QVL1wfQHQ83yP5n+lbEsF3/wLYGVAAAAAElFTkSuQmCC';

// Write to files
try {
  const publicDir = path.join(__dirname, 'public');
  
  // Create favicon.ico
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), Buffer.from(pngData, 'base64'));
  console.log('Created favicon.ico');
  
  // Create logo192.png
  fs.writeFileSync(path.join(publicDir, 'logo192.png'), Buffer.from(pngData, 'base64'));
  console.log('Created logo192.png');
  
  // Create logo512.png
  fs.writeFileSync(path.join(publicDir, 'logo512.png'), Buffer.from(pngData, 'base64'));
  console.log('Created logo512.png');
  
  console.log('All icon files created successfully.');
} catch (error) {
  console.error('Error creating icon files:', error);
}
