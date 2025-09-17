#!/bin/bash

# Server setup script for patrickadrianus.com nginx configuration
# Run this script on your server after deployment

echo "Setting up nginx configuration for patrickadrianus.com..."

# Define variables (update these paths as needed)
NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"
NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"
SITE_NAME="patrickadrianus.com"
DEPLOY_PATH="/var/www"  # Updated to match your actual deployment path

# Check if nginx config exists
if [ ! -f "$DEPLOY_PATH/nginx.conf" ]; then
    echo "❌ nginx.conf not found in $DEPLOY_PATH"
    echo "Please make sure the deployment uploaded the nginx.conf file"
    exit 1
fi

# Copy nginx configuration
echo "Copying nginx configuration..."
sudo cp "$DEPLOY_PATH/nginx.conf" "$NGINX_SITES_AVAILABLE/$SITE_NAME"

# Remove default nginx site if it exists and conflicts
if [ -L "$NGINX_SITES_ENABLED/default" ]; then
    echo "Removing default nginx site..."
    sudo rm "$NGINX_SITES_ENABLED/default"
fi

# Create symbolic link if it doesn't exist
if [ ! -L "$NGINX_SITES_ENABLED/$SITE_NAME" ]; then
    echo "Creating symbolic link..."
    sudo ln -s "$NGINX_SITES_AVAILABLE/$SITE_NAME" "$NGINX_SITES_ENABLED/$SITE_NAME"
fi

# Test nginx configuration
echo "Testing nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "Nginx configuration is valid. Reloading nginx..."
    sudo systemctl reload nginx
    echo "✅ Nginx configuration updated successfully!"
    echo "🎉 Your birthday page should now be accessible at https://patrickadrianus.com/birthday"
else
    echo "❌ Nginx configuration test failed. Please check the configuration."
    exit 1
fi

echo ""
echo "🔧 Manual steps if needed:"
echo "1. Update SSL certificate paths in $NGINX_SITES_AVAILABLE/$SITE_NAME"
echo "2. Ensure your SSL certificates are properly installed"
echo "3. Update the root path in nginx config if needed"
echo ""
echo "📝 To check nginx status: sudo systemctl status nginx"
echo "📝 To view nginx logs: sudo tail -f /var/log/nginx/error.log"
echo "📝 Current deployment structure:"
echo "   - Releases: $DEPLOY_PATH/releases/"
echo "   - Current: $DEPLOY_PATH/current -> latest release"
echo "   - Web root: $DEPLOY_PATH/html -> current"