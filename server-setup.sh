#!/bin/bash

# Server setup script for patrickadrianus.com nginx configuration
# Run this script on your server after deployment

echo "Setting up nginx configuration for patrickadrianus.com..."

# Define variables (update these paths as needed)
NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"
NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"
SITE_NAME="patrickadrianus.com"
DEPLOY_PATH="/var/www/patrickadrianus.com"  # Update this to match your deployment path

# Copy nginx configuration
echo "Copying nginx configuration..."
sudo cp "$DEPLOY_PATH/nginx.conf" "$NGINX_SITES_AVAILABLE/$SITE_NAME"

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
echo "3. Update the root path in nginx config if your deployment directory is different"
echo ""
echo "📝 To check nginx status: sudo systemctl status nginx"
echo "📝 To view nginx logs: sudo tail -f /var/log/nginx/error.log"