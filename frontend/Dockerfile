# Use the official Nginx image from the Docker Hub
FROM nginx:alpine

# Copy the custom Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the build files from the React app to the Nginx web root
COPY src/build /usr/share/nginx/html

# Expose port 80 to the Docker host
EXPOSE 3000

# Start Nginx when the container launches
CMD ["nginx", "-g", "daemon off;"]
