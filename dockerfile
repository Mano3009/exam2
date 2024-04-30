FROM node:14
# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available) to the working directory
COPY package.json package-lock.json* ./
COPY views ./views
COPY public ./public


# Install dependencies
RUN npm install
RUN npm rebuild sqlite3
# Copy the rest of the application code to the working directory
COPY . .

# Expose the port on which the application will run
EXPOSE 8080

# Define the command to run your Node.js application
CMD ["node", "app.js"]
