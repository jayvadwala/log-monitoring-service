# Use the official Node.js LTS image
FROM node:16

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the application port
EXPOSE 3001

# Set environment variables
ENV LOG_PATH=/var/log

# Run the application
CMD ["npm", "start"]
