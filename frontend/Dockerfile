FROM node:18-alpine

# Set working directory
WORKDIR /app

# Add package.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Add the rest of the files
COPY . .

# Expose port 3000
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
