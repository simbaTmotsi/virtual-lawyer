// Create very simple PNG files using direct byte writing
const fs = require('fs');
const path = require('path');

// Function to create a basic PNG file of a solid color
function createPNG(width, height, color, outputPath) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR chunk (header)
  const IHDR = Buffer.alloc(13);
  IHDR.writeUInt32BE(width, 0);      // Width
  IHDR.writeUInt32BE(height, 4);     // Height
  IHDR.writeUInt8(8, 8);             // Bit depth
  IHDR.writeUInt8(6, 9);             // Color type (RGBA)
  IHDR.writeUInt8(0, 10);            // Compression method
  IHDR.writeUInt8(0, 11);            // Filter method
  IHDR.writeUInt8(0, 12);            // Interlace method
  
  const IHDRChunk = createChunk('IHDR', IHDR);
  
  // IDAT chunk (image data) - Very simple image data for a solid color
  // Each pixel is RGBA (4 bytes)
  const pixelCount = width * height;
  const pixelDataSize = pixelCount * 4 + height; // +height for filter byte per scanline
  
  const pixelData = Buffer.alloc(pixelDataSize);
  
  let offset = 0;
  for (let y = 0; y < height; y++) {
    // Filter byte (0 = no filter)
    pixelData.writeUInt8(0, offset++);
    
    // Write pixels for this scanline
    for (let x = 0; x < width; x++) {
      // RGBA values (convert hex color to RGB components)
      pixelData.writeUInt8((color >> 16) & 0xFF, offset++);  // R
      pixelData.writeUInt8((color >> 8) & 0xFF, offset++);   // G
      pixelData.writeUInt8(color & 0xFF, offset++);          // B
      pixelData.writeUInt8(255, offset++);                   // A (fully opaque)
    }
  }
  
  // Compress the pixel data (simple zlib wrapper)
  const zlib = require('zlib');
  const compressedData = zlib.deflateSync(pixelData);
  
  const IDATChunk = createChunk('IDAT', compressedData);
  
  // IEND chunk (end of image)
  const IENDChunk = createChunk('IEND', Buffer.alloc(0));
  
  // Combine all chunks to form the PNG file
  const pngFile = Buffer.concat([
    signature,
    IHDRChunk,
    IDATChunk,
    IENDChunk
  ]);
  
  // Write the PNG file
  fs.writeFileSync(outputPath, pngFile);
}

// Helper function to create a PNG chunk
function createChunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const chunk = Buffer.alloc(4 + 4 + data.length + 4);
  
  // Length (4 bytes)
  chunk.writeUInt32BE(data.length, 0);
  
  // Type (4 bytes)
  typeBuffer.copy(chunk, 4);
  
  // Data
  data.copy(chunk, 8);
  
  // CRC (4 bytes)
  const crc = calculateCRC(Buffer.concat([typeBuffer, data]));
  chunk.writeUInt32BE(crc, 8 + data.length);
  
  return chunk;
}

// CRC calculation for PNG chunks
function calculateCRC(data) {
  let crc = 0xffffffff;
  const crcTable = [];
  
  // Generate CRC table
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) {
        c = 0xedb88320 ^ (c >>> 1);
      } else {
        c = c >>> 1;
      }
    }
    crcTable[n] = c;
  }
  
  // Calculate CRC
  for (let i = 0; i < data.length; i++) {
    crc = crcTable[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  
  return crc ^ 0xffffffff;
}

// Function to create an "E" letter in the image
function addLetter(imgData, width, height, x, y, letterWidth, letterHeight, color) {
  for (let i = 0; i < letterHeight; i++) {
    // Horizontal lines (top, middle, bottom)
    if (i === 0 || i === Math.floor(letterHeight / 2) || i === letterHeight - 1) {
      for (let j = 0; j < letterWidth; j++) {
        const pos = ((y + i) * width + (x + j)) * 4;
        imgData[pos] = (color >> 16) & 0xFF;     // R
        imgData[pos + 1] = (color >> 8) & 0xFF;  // G
        imgData[pos + 2] = color & 0xFF;         // B
        imgData[pos + 3] = 255;                  // A
      }
    } 
    // Vertical line (left side)
    else {
      const pos = ((y + i) * width + x) * 4;
      imgData[pos] = (color >> 16) & 0xFF;     // R
      imgData[pos + 1] = (color >> 8) & 0xFF;  // G
      imgData[pos + 2] = color & 0xFF;         // B
      imgData[pos + 3] = 255;                  // A
    }
  }
}

// Create the icons
try {
  const publicDir = path.join(__dirname, 'public');
  
  // Create a 32x32 favicon
  createPNG(32, 32, 0x0066FF, path.join(publicDir, 'favicon.ico'));
  console.log('Created favicon.ico');
  
  // Create a 192x192 logo
  createPNG(192, 192, 0x0066FF, path.join(publicDir, 'logo192.png'));
  console.log('Created logo192.png');
  
  // Create a 512x512 logo
  createPNG(512, 512, 0x0066FF, path.join(publicDir, 'logo512.png'));
  console.log('Created logo512.png');
  
  console.log('All icon files created successfully!');
} catch (error) {
  console.error('Error creating icon files:', error);
}
