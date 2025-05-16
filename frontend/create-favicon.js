const fs = require('fs');
const path = require('path');

// Simple blue icon with a check mark shape (represents law) 
const iconData = 'AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAABILAAASCwAAAAAAAAAAAAD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8AMGKqYC9gqN0vYKjtL2Co7S5gqO0vYKjtL2Co3S9gqGD///8A////AP///wD///8A////AP///wD///8AL2CoMC9gqO0vYKj/L2Co/y9gqP8vYKj/L2Co/y9gqP8vYKj/L2Co7S9gqDD///8A////AP///wD///8A////AC9gqDAvYKj/L2Co/y9gqP8vYKj/L2Co/y9gqP8vYKj/L2Co/y9gqP8vYKj/L2CoMP///wD///8A////AP///wAvYKgwL2Co/y9gqP8vYKj/L2Co/y9gqP8vYKj/L2Co/y9gqP8vYKj/L2Co/y9gqP8vYKgw////AP///wD///8AL2CoYC9gqP8vYKj/L2Co/zFjq/8+cLT/OWyw/y9gqP8vYKj/L2Co/y9gqP8vYKj/L2Co/y9gqGD///8A////AC9gqN0vYKj/L2Co/zlssP9pnMr/n8Hi/4e02v8vYKj/L2Co/y9gqP8vYKj/L2Co/y9gqP8vYKjd////AP///wAvYKjtL2Co/y9gqP9WorX/n8Hi/5/B4v+fweL/R3m5/y9gqP8vYKj/L2Co/y9gqP8vYKj/L2Co7f///wD///8AL2Co7S9gqP8vYKj/VqK1/5/B4v+fweL/n8Hi/0d6uf8vYKj/L2Co/y9gqP8vYKj/L2Co/y9gqO3///8A////AC9gqO0vYKj/L2Co/zNkrf95rNP/n8Hi/3eq0v8vYKj/L2Co/y9gqP8vYKj/L2Co/y9gqP8vYKjt////AP///wAvYKjdL2Co/y9gqP8vYKj/M2St/0V3uP8zaaz/L2Co/y9gqP8vYKj/L2Co/y9gqP8vYKj/L2Co3f///wD///8AL2CoYC9gqP8vYKj/L2Co/y9gqP8vYKj/L2Co/y9gqP8vYKj/L2Co/y9gqP8vYKj/L2Co/y9gqGD///8A////AP///wAvYKgwL2Co/y9gqP8vYKj/L2Co/y9gqP8vYKj/L2Co/y9gqP8vYKj/L2Co/y9gqDD///8A////AP///wD///8A////AC9gqDAvYKj/L2Co/y9gqP8vYKj/L2Co/y9gqP8vYKj/L2Co/y9gqP8vYKgw////AP///wD///8A////AP///wD///8AL2CoMC9gqO0vYKj/L2Co/y9gqP8vYKj/L2Co/y9gqO0vYKgw////AP///wD///8A////AP///wD///8A////AP///wD///8AL2CoYC9gqN0vYKjtL2Co7S9gqN0vYKhg////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A';

// Write the base64 data to a file as binary
const buffer = Buffer.from(iconData, 'base64');
fs.writeFileSync(path.join(__dirname, 'public', 'favicon.ico'), buffer);

console.log('Favicon created successfully!');

// Also create an Apple touch icon (logo192.png) from the same data
fs.writeFileSync(path.join(__dirname, 'public', 'logo192.png'), buffer);

console.log('Apple touch icon created successfully!');
