# STAGE 1: Build the React Application
# This stage installs dependencies and runs `npm run build`

FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies
# This is done in a separate layer to leverage Docker's caching
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Create the production build
# This will generate a '/app/dist' directory with your static files
RUN npm run build

# STAGE 2: Set up the Production Server with Nginx
# This stage takes the built files and serves them

FROM nginx:1.25-alpine

# Set the port Nginx will listen on
EXPOSE 8080

# Copy the static files from the 'builder' stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy our custom Nginx configuration file
# This is crucial for React Router to work correctly
COPY nginx.conf /etc/nginx/conf.d/default.conf

# The default command for the nginx image is to start the server.
# This keeps the container running.
CMD ["nginx", "-g", "daemon off;"]
