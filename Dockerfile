# Base image
FROM node:16-alpine

# Set working directory
WORKDIR /app

# Copy package.json files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm install
RUN cd backend && npm install
RUN cd frontend && npm install

# Copy project files
COPY . .

# Build frontend
RUN cd frontend && npm run build

# Expose port
EXPOSE 5000

# Start the app
CMD ["npm", "start"]
